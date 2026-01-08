import { db } from './drizzle';
import {
    frameworks,
    domains,
    controls,
    userFrameworkAccess,
    assessments,
    assessmentProgress,
    assessmentResults,
    riskUniverse,
    riskRegister,
    riskTreatments,
    riskReviews,
    riskCategories,
    assets,
    businessProcesses,
    riskAssets,
    riskProcesses
} from './schema';
import { eq, and, desc, or, isNull, sql, inArray } from 'drizzle-orm';
// import { calculateRiskScore } from '@/lib/utils'; 

// Framework Queriess
export async function getFrameworksForUser(userId: number) {
    // Get frameworks assigned to user or created by user's organisation
    // For now, simpler logic: get frameworks for user's org + standard ones they have access to

    // First update schema to support this properly or use userFrameworkAccess
    const access = await db.query.userFrameworkAccess.findMany({
        where: eq(userFrameworkAccess.userId, userId),
        with: {
            framework: true
        }
    });

    return access.map((a: { framework: any }) => a.framework);
}

export async function getDomainsForFramework(frameworkId: number) {
    return await db.query.domains.findMany({
        where: eq(domains.frameworkId, frameworkId),
        orderBy: [domains.order]
    });
}

export async function getControlsForDomain(domainId: number) {
    return await db.query.controls.findMany({
        where: eq(controls.domainId, domainId),
        orderBy: [controls.code]
    });
}

// Risk Management Queries

export async function getRiskRegister(organisationId: number, filters?: any) {
    const conditions = [eq(riskRegister.organisationId, organisationId)];

    if (filters?.status) {
        conditions.push(eq(riskRegister.status, filters.status));
    }
    if (filters?.severity) {
        // Logic for severity mapping if needed
    }
    if (filters?.categoryId) {
        conditions.push(eq(riskRegister.categoryId, filters.categoryId));
    }
    if (filters?.ownerUserId) {
        conditions.push(eq(riskRegister.ownerUserId, filters.ownerUserId));
    }

    return await db.query.riskRegister.findMany({
        where: and(...conditions),
        with: {
            owner: {
                columns: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            category: true,
            riskUniverse: {
                with: {
                    framework: true
                }
            },
            riskAssets: {
                with: {
                    asset: true
                }
            },
            riskProcesses: {
                with: {
                    process: true
                }
            }
        },
        orderBy: [desc(riskRegister.createdAt)]
    });
}

export async function getRiskCategories(organisationId: number) {
    return await db.query.riskCategories.findMany({
        where: eq(riskCategories.organisationId, organisationId),
    });
}

export async function getAssets(organisationId: number) {
    return await db.query.assets.findMany({
        where: eq(assets.organisationId, organisationId),
        orderBy: [desc(assets.createdAt)]
    });
}

export async function getBusinessProcesses(organisationId: number) {
    return await db.query.businessProcesses.findMany({
        where: eq(businessProcesses.organisationId, organisationId),
        orderBy: [desc(businessProcesses.createdAt)]
    });
}

// Helper to ensure a "General Risk Assessment" exists for ad-hoc risks
async function ensureGeneralRiskAssessment(organisationId: number, userId: number) {
    // 1. Check for existing "General Risk Assessment"
    const existing = await db.query.assessments.findFirst({
        where: and(
            eq(assessments.userId, userId),
            eq(assessments.assessmentName, 'General Risk Assessment')
        )
    });

    if (existing) return existing;

    // 2. We need a framework. Try "ISO 22301" or first available.
    let framework = await db.query.frameworks.findFirst({
        where: eq(frameworks.organisationId, organisationId)
    });

    // If absolutely no framework, we might need to create one, but that's edge case.

    const [newAssessment] = await db.insert(assessments).values({
        organisationId: organisationId, // Wait, assessment table DOES NOT have organisationId in Schema Step 18?
        // Let's check schema.ts Step 18.
        // assessments: id, assessmentName, userId, frameworkId... NO organisationId directly?
        // It references users. users belong to orgs.
        // Let's check if I missed it.
        // Row 182: frameworkId, userId...
        // It does NOT have organisationId. It relies on User.
        userId: userId,
        frameworkId: framework ? framework.id : null,
        assessmentName: 'General Risk Assessment',
        status: 'in_progress',
        type: 'general',
        description: 'Container for ad-hoc identified risks.',
    }).returning();

    return newAssessment;
}

export async function quickAddRisk(data: {
    organisationId: number;
    userId: number;
    title: string;
    description?: string;
    likelihood?: number;
    impact?: number;
    categoryId?: number;
    strategy?: string;
    status?: string;
    ownerUserId?: number;
    scope?: string;
    assetId?: number;
    processId?: number;
    assetIds?: number[];
    processIds?: number[];
}) {
    // 1. Ensure Assessment
    const assessment = await ensureGeneralRiskAssessment(data.organisationId, data.userId);

    // 2. Ensure Framework (for Universe)
    // Universe requires specific frameworkID. If assessment has one, use it.
    // If assessment has null framework (allowed), we still need frameworkId for Universe (NOT NULL).
    // We need a fallback framework "General Risks" or similar if real one is missing.
    let frameworkId = assessment.frameworkId;
    if (!frameworkId) {
        // Find or create "General Risks" framework
        let genFramework = await db.query.frameworks.findFirst({
            where: and(
                eq(frameworks.name, 'General Risks'),
                eq(frameworks.organisationId, data.organisationId)
            )
        });
        if (!genFramework) {
            [genFramework] = await db.insert(frameworks).values({
                organisationId: data.organisationId,
                name: 'General Risks',
                type: 'custom',
                description: 'Container for general risks'
            }).returning();
        }
        frameworkId = genFramework.id;
    }

    // 3. Ensure Control (Universe requires controlId).
    // This is getting deep. Universe links risk to a specific control.
    // Ad-hoc risks might not be linked to a control.
    // We need a "General Control" or null if schema allowed (it doesn't).
    // WORKAROUND: Create a "General Risk" control in the "General Risks" framework.
    let control = await db.query.controls.findFirst({
        where: and(
            eq(controls.code, 'GEN-01'),
            eq(controls.frameworkId, frameworkId!)
        )
    });

    if (!control) {
        // Need domain? Schema allows domainId to be null? Step 146: domainId nullable.
        [control] = await db.insert(controls).values({
            organisationId: data.organisationId,
            frameworkId: frameworkId!,
            code: 'GEN-01',
            name: 'General Risk Entry',
            description: 'Placeholder for ad-hoc risks',
            status: 'active'
        }).returning();
    }

    // 4. Create Universe Entry
    const [universeEntry] = await db.insert(riskUniverse).values({
        organisationId: data.organisationId,
        assessmentId: assessment.id,
        frameworkId: frameworkId!,
        frameworkName: 'General Risks', // or fetch name
        assessmentName: assessment.assessmentName,
        controlId: control.id,
        controlCode: control.code,
        controlName: control.name,
        riskDescription: data.title, // Universe mainly tracks description/title
        riskType: 'ad-hoc',
        status: 'identified',
        publishedByUserId: data.userId,
    }).returning();

    // 5. Add to Register
    return await addRiskToRegister({
        riskUniverseId: universeEntry.id,
        organisationId: data.organisationId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        likelihood: data.likelihood,
        impact: data.impact,
        categoryId: data.categoryId,
        strategy: data.strategy,
        status: data.status,
        ownerUserId: data.ownerUserId,
        scope: data.scope,
        assetId: data.assetId,
        processId: data.processId,
        assetIds: data.assetIds,
        processIds: data.processIds,
    });
}

export async function addRiskToRegister(data: {
    riskUniverseId: number;
    organisationId: number;
    userId: number; // Created by
    title?: string;
    type?: string;
    description?: string;
    severity?: string;
    likelihood?: number;
    impact?: number;
    categoryId?: number;
    ownerUserId?: number;
    reviewFrequency?: string;
    qualificationNotes?: string;
    strategy?: string;
    status?: string;
    scope?: string;
    assetId?: number; // Deprecated, keep for backward compat or single select
    processId?: number; // Deprecated
    assetIds?: number[];
    processIds?: number[];
}) {
    // Use uploaded risk score calc logic or default
    const riskScore = (data.likelihood || 1) * (data.impact || 1);

    const [entry] = await db.insert(riskRegister).values({
        riskUniverseId: data.riskUniverseId,
        organisationId: data.organisationId,
        createdByUserId: data.userId,
        riskName: data.title || 'Untitled Risk', // Fallback
        description: data.description,
        likelihood: data.likelihood,
        impact: data.impact,
        riskScore: riskScore,
        categoryId: data.categoryId,
        ownerUserId: data.ownerUserId,
        strategy: data.strategy || 'mitigate',
        status: data.status || 'open',
        scope: data.scope || 'system',
        assetId: data.assetId, // Keep for backward compat
        processId: data.processId, // Keep for backward compat
    }).returning();

    // Insert multiple assets
    if (data.assetIds && data.assetIds.length > 0) {
        await db.insert(riskAssets).values(
            data.assetIds.map(assetId => ({
                riskRegisterId: entry.id,
                assetId: assetId
            }))
        );
    }
    // Backward compat: if singular assetId provided but not in array, add it
    if (data.assetId && (!data.assetIds || !data.assetIds.includes(data.assetId))) {
        await db.insert(riskAssets).values({
            riskRegisterId: entry.id,
            assetId: data.assetId
        });
    }

    // Insert multiple processes
    if (data.processIds && data.processIds.length > 0) {
        await db.insert(riskProcesses).values(
            data.processIds.map(processId => ({
                riskRegisterId: entry.id,
                processId: processId
            }))
        );
    }
    // Backward compat
    if (data.processId && (!data.processIds || !data.processIds.includes(data.processId))) {
        await db.insert(riskProcesses).values({
            riskRegisterId: entry.id,
            processId: data.processId
        });
    }

    return entry.id;
}

export async function updateRiskInRegister(riskId: number, data: {
    title?: string;
    description?: string;
    likelihood?: number;
    impact?: number;
    categoryId?: number;
    strategy?: string;
    status?: string;
    ownerUserId?: number;
    scope?: string;
    assetId?: number;
    processId?: number;
    assetIds?: number[];
    processIds?: number[];
}) {
    // Calculate new score if L or I provided
    let riskScore;
    if (data.likelihood !== undefined || data.impact !== undefined) {
        // We might need to fetch existing if only one is provided, but simpler to expect both or handle it.
        // For atomic updates, usually we expect the form to send full L/I state.
        if (data.likelihood && data.impact) {
            riskScore = data.likelihood * data.impact;
        } else {
            // If partial update, we'd need to fetch existing. Let's assume full update or fetch-update logic.
            // Best to just update what's mapped.
        }
    }

    // Prepare update object
    const updateData: any = {};
    if (data.title) updateData.riskName = data.title;
    if (data.description) updateData.description = data.description;
    if (data.likelihood) updateData.likelihood = data.likelihood;
    if (data.impact) updateData.impact = data.impact;
    if (data.categoryId) updateData.categoryId = data.categoryId;
    if (data.strategy) updateData.strategy = data.strategy;
    if (data.status) updateData.status = data.status;
    if (data.ownerUserId) updateData.ownerUserId = data.ownerUserId;
    if (data.scope) updateData.scope = data.scope;
    if (data.assetId !== undefined) updateData.assetId = data.assetId; // allow nulling if passed null
    if (data.processId !== undefined) updateData.processId = data.processId;

    // Recalculate score if L and I are present in update or mixed (would require fetch).
    // Let's assume the action layer passes full L/I if either changes.
    if (updateData.likelihood && updateData.impact) {
        updateData.riskScore = updateData.likelihood * updateData.impact;
    }

    await db.update(riskRegister)
        .set({
            ...updateData,
            updatedAt: new Date()
        })
        .where(eq(riskRegister.id, riskId));

    // Handle Asset Junctions
    if (data.assetIds !== undefined) {
        // Delete existing
        await db.delete(riskAssets).where(eq(riskAssets.riskRegisterId, riskId));
        // Insert new
        if (data.assetIds.length > 0) {
            await db.insert(riskAssets).values(
                data.assetIds.map(id => ({
                    riskRegisterId: riskId,
                    assetId: id
                }))
            );
        }
    }

    // Handle Process Junctions
    if (data.processIds !== undefined) {
        // Delete existing
        await db.delete(riskProcesses).where(eq(riskProcesses.riskRegisterId, riskId));
        // Insert new
        if (data.processIds.length > 0) {
            await db.insert(riskProcesses).values(
                data.processIds.map(id => ({
                    riskRegisterId: riskId,
                    processId: id
                }))
            );
        }
    }

    return true;
}

export async function deleteRiskFromRegister(riskId: number, organisationId: number) {
    // Ensure we only delete for the correct organisation
    await db.delete(riskRegister)
        .where(and(
            eq(riskRegister.id, riskId),
            eq(riskRegister.organisationId, organisationId)
        ));
    return true;
}

export async function getRiskUniverse(organisationId: number) {
    return await db.query.riskUniverse.findMany({
        where: eq(riskUniverse.organisationId, organisationId),
        with: {
            framework: true,
        },
        orderBy: [desc(riskUniverse.id)]
    });
}

export async function getFrameworkById(frameworkId: number, userId: number) {
    // Check access
    const access = await db.query.userFrameworkAccess.findFirst({
        where: and(
            eq(userFrameworkAccess.userId, userId),
            eq(userFrameworkAccess.frameworkId, frameworkId)
        )
    });

    if (!access) return null;

    return await db.query.frameworks.findFirst({
        where: eq(frameworks.id, frameworkId),
        with: {
            domains: {
                orderBy: [domains.order]
            },
            controls: {
                orderBy: [controls.code],
                with: {
                    domain: true
                }
            }
        }
    });
}

export async function createAssessmentFromFramework(params: {
    userId: number;
    frameworkId: number;
    assessmentName: string;
    type?: string;
    description?: string;
    dueDate?: Date;
    domainIds?: number[];
    scope?: string;
    assetId?: number;
    processId?: number;
}): Promise<number> {
    const { userId, frameworkId, assessmentName, type, description, dueDate, domainIds, scope, assetId, processId } = params;

    // Verify framework exists and user has access
    const framework = await getFrameworkById(frameworkId, userId);
    if (!framework) {
        throw new Error('Framework not found or you do not have access to it');
    }

    // Create assessment
    const [assessment] = await db
        .insert(assessments)
        .values({
            assessmentName,
            type: type || null,
            description: description || null,
            frameworkId,
            userId,
            status: 'created',
            progress: 0,
            dueDate: dueDate || null,
            assignedDate: new Date(),
            scope: scope || 'organisation',
            assetId: assetId || null,
            processId: processId || null,
        })
        .returning();

    if (!assessment) {
        throw new Error('Failed to create assessment');
    }

    // Filter controls by selected domains
    // framework.controls is what we got from getFrameworkById
    let controlsToInclude = framework.controls || [];
    if (domainIds && domainIds.length > 0) {
        const domainIdsSet = new Set(domainIds);
        controlsToInclude = controlsToInclude.filter((control: any) => {
            // Include controls that belong to selected domains, or controls without a domain (domainId is null or 0)
            if (!control.domainId || control.domainId === 0) {
                return domainIdsSet.has(0);
            }
            return domainIdsSet.has(control.domainId);
        });
    }

    // Create assessment progress entries for selected controls
    if (controlsToInclude.length > 0) {
        const progressEntries = controlsToInclude.map((control: any) => ({
            assessmentId: assessment.id,
            domainId: control.domainId || 0,
            controlId: control.id,
            status: 'unanswered',
        }));

        // Insert in batches
        const batchSize = 100;
        for (let i = 0; i < progressEntries.length; i += batchSize) {
            const batch = progressEntries.slice(i, i + batchSize);
            await db.insert(assessmentProgress).values(batch);
        }
    }

    return assessment.id;
}

export async function getAssessmentById(assessmentId: number, userId?: number) {
    const assessment = await db.query.assessments.findFirst({
        where: eq(assessments.id, assessmentId),
        with: {
            framework: true,
            user: true,
            progress: {
                with: {
                    // @ts-ignore
                    control: true,
                    // @ts-ignore
                    domain: true,
                },
            },
            results: true,
        },
    });

    if (!assessment) return null;

    // Verify user access if userId provided
    if (userId && assessment.userId !== userId) {
        return null;
    }

    return assessment;
}

export async function getAssessmentProgress(assessmentId: number, userId?: number) {
    const assessment = await getAssessmentById(assessmentId, userId);
    if (!assessment) return null;

    // Calculate progress by domain
    const domainProgress = new Map<number, { completed: number; total: number }>();

    assessment.progress.forEach((progress: any) => {
        const domainId = progress.domainId || 0;
        if (!domainProgress.has(domainId)) {
            domainProgress.set(domainId, { completed: 0, total: 0 });
        }
        const stats = domainProgress.get(domainId)!;
        stats.total++;
        if (progress.status === 'completed' || progress.status === 'in_progress' || (progress.status === 'not_started' && !!progress.notes)) {
            stats.completed++;
        }
    });

    // Get domain details
    const domainIds = Array.from(domainProgress.keys()).filter((id: number) => id !== 0);
    const domainDetails = domainIds.length > 0
        ? await db
            .select()
            .from(domains)
            .where(inArray(domains.id, domainIds))
        : [];

    const domainMap = new Map<number, any>(domainDetails.map((d: any) => [d.id, d]));

    // Calculate overall progress from completed controls
    const totalControls = assessment.progress.length || 0;
    const completedControls = assessment.progress.filter((p: any) =>
        p.status === 'completed' || p.status === 'in_progress' || (p.status === 'not_started' && !!p.notes)
    ).length || 0;
    const overallProgressPercentage = totalControls > 0 ? Math.round((completedControls / totalControls) * 100) : 0;

    return {
        assessment_id: assessment.id,
        assessment_name: assessment.assessmentName,
        type: assessment.type || undefined,
        framework_id: assessment.frameworkId || 0,
        framework_name: assessment.framework?.name || '',
        status: assessment.status || 'pending',
        overall_progress: overallProgressPercentage,
        due_date: assessment.dueDate?.toISOString() || undefined,
        assigned_date: assessment.assignedDate?.toISOString() || '',
        domains: Array.from(domainProgress.entries()).map(([domainId, stats]: [number, { completed: number; total: number }]) => {
            const domain = domainMap.get(domainId);
            const domainControls = assessment.progress.filter((p: any) => p.domainId === domainId) || [];

            return {
                domain_id: domainId,
                domain_name: domain?.name || 'Unassigned',
                domain_code: undefined,
                progress: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
                controls_total: stats.total,
                controls_completed: stats.completed,
                controls: domainControls.map((progress: any) => ({
                    control_id: progress.controlId,
                    control_code: progress.control?.code || '',
                    control_name: progress.control?.name || '',
                    description: progress.control?.description || '',
                    status: progress.status || 'not_started',
                    completed_date: progress.completedDate?.toISOString() || undefined,
                    assigned_to_user_id: progress.assignedToUserId || undefined,
                    notes: progress.notes || undefined,
                })),
            };
        }),
    };
}

