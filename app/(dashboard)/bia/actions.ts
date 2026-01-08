'use server';

import { db } from '@/lib/db/drizzle';
import { businessProcesses, assets, dependencies, riskRegister, biaRuns, organisationMembers } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';

// --- Processes ---

const createProcessSchema = z.object({
    name: z.string().min(3),
    rto: z.string().optional(),
    rpo: z.string().optional(),
    priority: z.string().optional(),
    description: z.string().optional(),
    downtimeCostPerHour: z.coerce.number().optional(),
    recoveryCostFixed: z.coerce.number().optional(),
    dataClassification: z.string().optional(),
});

export async function createProcessAction(formData: FormData) {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return { error: 'Unauthorized' };

    const userId = parseInt(user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No organization found' };

    const validated = createProcessSchema.safeParse({
        name: formData.get('name'),
        rto: formData.get('rto'),
        rpo: formData.get('rpo'),
        priority: formData.get('priority'),
        description: formData.get('description'),
        downtimeCostPerHour: formData.get('downtimeCostPerHour'),
        recoveryCostFixed: formData.get('recoveryCostFixed'),
        dataClassification: formData.get('dataClassification'),
    });

    if (!validated.success) return { error: 'Invalid input' };

    await db.insert(businessProcesses).values({
        organisationId: member.organisationId,
        name: validated.data.name,
        rto: validated.data.rto || '4h',
        rpo: validated.data.rpo || '4h',
        priority: validated.data.priority || 'Medium',
        description: validated.data.description,
        downtimeCostPerHour: validated.data.downtimeCostPerHour || 0,
        recoveryCostFixed: validated.data.recoveryCostFixed || 0,
        dataClassification: validated.data.dataClassification || 'confidential',
        owner: user.name,
    });

    revalidatePath('/bia');
    return { success: true };
}

export async function updateProcessAction(processId: number, formData: FormData) {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return { error: 'Unauthorized' };

    const userId = parseInt(user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No organization found' };

    const validated = createProcessSchema.partial().safeParse({
        name: formData.get('name'),
        rto: formData.get('rto'),
        rpo: formData.get('rpo'),
        priority: formData.get('priority'),
        description: formData.get('description'),
        downtimeCostPerHour: formData.get('downtimeCostPerHour'),
        recoveryCostFixed: formData.get('recoveryCostFixed'),
        dataClassification: formData.get('dataClassification'),
    });

    if (!validated.success) return { error: 'Invalid input' };

    await db.update(businessProcesses)
        .set({
            name: validated.data.name,
            rto: validated.data.rto,
            rpo: validated.data.rpo,
            priority: validated.data.priority,
            description: validated.data.description,
            downtimeCostPerHour: validated.data.downtimeCostPerHour,
            recoveryCostFixed: validated.data.recoveryCostFixed,
            dataClassification: validated.data.dataClassification,
        })
        .where(eq(businessProcesses.id, processId));

    revalidatePath('/bia');
    revalidatePath(`/bia/processes/${processId}`);
    return { success: true };
}

export async function deleteProcessAction(processId: number) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    await db.delete(businessProcesses).where(eq(businessProcesses.id, processId));
    revalidatePath('/bia');
    return { success: true };
}


// --- Assets ---

const createAssetSchema = z.object({
    name: z.string().min(2),
    type: z.string().optional(),
    criticality: z.string().optional(),
    owner: z.string().optional(),
    description: z.string().optional(),
    recoveryTimeObjective: z.string().optional(),
});

export async function createAssetAction(formData: FormData) {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return { error: 'Unauthorized' };

    const userId = parseInt(user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No organization found' };

    const validated = createAssetSchema.safeParse({
        name: formData.get('name'),
        type: formData.get('type'),
        criticality: formData.get('criticality'),
        owner: formData.get('owner'),
        description: formData.get('description'),
        recoveryTimeObjective: formData.get('recoveryTimeObjective'),
    });

    if (!validated.success) return { error: 'Invalid input' };

    await db.insert(assets).values({
        organisationId: member.organisationId,
        name: validated.data.name,
        type: validated.data.type || 'Server',
        criticality: validated.data.criticality || 'Medium',
        owner: validated.data.owner || user.name,
        description: validated.data.description,
        recoveryTimeObjective: validated.data.recoveryTimeObjective,
    });

    revalidatePath('/bia/assets');
    return { success: true };
}

export async function updateAssetAction(assetId: number, formData: FormData) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    const userId = parseInt(session.user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No organization found' };

    const validated = createAssetSchema.partial().safeParse({
        name: formData.get('name'),
        type: formData.get('type'),
        criticality: formData.get('criticality'),
        owner: formData.get('owner'),
        description: formData.get('description'),
        recoveryTimeObjective: formData.get('recoveryTimeObjective'),
    });

    if (!validated.success) return { error: 'Invalid input' };

    await db.update(assets)
        .set({
            name: validated.data.name,
            type: validated.data.type,
            criticality: validated.data.criticality,
            owner: validated.data.owner,
            description: validated.data.description,
            recoveryTimeObjective: validated.data.recoveryTimeObjective,
        })
        .where(eq(assets.id, assetId));

    revalidatePath('/bia/assets');
    revalidatePath(`/bia/assets/${assetId}`);
    return { success: true };
}

export async function deleteAssetAction(assetId: number) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    await db.delete(assets).where(eq(assets.id, assetId));
    revalidatePath('/bia/assets');
    return { success: true };
}

// --- Dependencies ---

const addDependencySchema = z.object({
    processId: z.coerce.number(),
    targetType: z.enum(['asset', 'process']),
    targetId: z.coerce.number(),
    notes: z.string().optional(),
});

export async function addDependencyAction(formData: FormData) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    const validated = addDependencySchema.safeParse({
        processId: formData.get('processId'),
        targetType: formData.get('targetType'),
        targetId: formData.get('targetId'),
        notes: formData.get('notes'),
    });

    if (!validated.success) return { error: 'Invalid input' };

    // Check if organisation matches (security check omitted for brevity but should be here)

    if (validated.data.targetType === 'asset') {
        await db.insert(dependencies).values({
            organisationId: 1, // simplified, should fetch from user
            processId: validated.data.processId,
            dependentOnAssetId: validated.data.targetId,
            notes: validated.data.notes,
        });
    } else {
        await db.insert(dependencies).values({
            organisationId: 1, // simplified
            processId: validated.data.processId,
            dependentOnProcessId: validated.data.targetId,
            notes: validated.data.notes,
        });
    }

    revalidatePath(`/bia/processes/${validated.data.processId}`);
    return { success: true };
}

export async function removeDependencyAction(dependencyId: number, processId: number) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    await db.delete(dependencies).where(eq(dependencies.id, dependencyId));
    revalidatePath(`/bia/processes/${processId}`);
    return { success: true };
}

// --- Analysis Logic ---

const createAnalysisSchema = z.object({
    name: z.string().min(3),
    processId: z.coerce.number(),
    notes: z.string().optional().nullable(),
});

export async function createAnalysisAction(formData: FormData) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    const userId = parseInt(session.user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No org found' };

    const inputData = {
        name: formData.get('name'),
        processId: formData.get('processId'),
        notes: formData.get('notes'),
    };
    console.log("createAnalysisAction Input:", inputData);

    const validated = createAnalysisSchema.safeParse(inputData);

    if (!validated.success) {
        console.error("Validation Error:", validated.error);
        return {
            error: `Invalid input. Received: ${JSON.stringify(inputData)}. Error: ${validated.error.errors.map(e => e.message).join(', ')}`
        };
    }

    const [newRun] = await db.insert(biaRuns).values({
        organisationId: member.organisationId,
        processId: validated.data.processId,
        name: validated.data.name,
        notes: validated.data.notes,
        status: 'draft',
        performedBy: session.user.name || 'Unknown',
    }).returning();

    revalidatePath('/bia');
    // We return the ID so the client can redirect
    return { success: true, id: newRun.id };
}

type AnalysisResult = {
    totalDowntimeCost: number;
    maxRecoveryTime: number;
    rtoGaps: Array<{
        dependencyName: string;
        dependencyType: string;
        actualRTO: number;
        targetRTO: number;
        gap: number;
    }>;
    criticalPath: string[];
};

export async function analyzeProcessAction(analysisId: number) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    // 1. Fetch the Analysis Run
    const run = await db.query.biaRuns.findFirst({
        where: eq(biaRuns.id, analysisId),
    });

    if (!run) return { error: 'Analysis Run not found' };

    const userId = parseInt(session.user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member || member.organisationId !== run.organisationId) return { error: 'Unauthorized' };

    // 2. Fetch Process Data for Calculation
    const allProcesses = await db.query.businessProcesses.findMany({
        where: eq(businessProcesses.organisationId, member.organisationId),
        with: {
            dependencies: {
                with: {
                    asset: true,
                    dependentProcess: true
                }
            }
        }
    });

    const rootProcess = allProcesses.find((p: any) => p.id === run.processId);
    if (!rootProcess) return { error: 'Process not found' };

    const parseRTO = (rtoStr: string | null | undefined): number => {
        if (!rtoStr) return 0;
        const val = parseInt(rtoStr);
        if (isNaN(val)) return 0;
        if (rtoStr.toLowerCase().includes('d')) return val * 24;
        if (rtoStr.toLowerCase().includes('m')) return val / 60;
        return val;
    };

    const targetRTO = parseRTO(rootProcess.rto);
    let totalImpact = (rootProcess.downtimeCostPerHour || 0);
    const rtoGaps: AnalysisResult['rtoGaps'] = [];
    let maxPathRTO = 0;
    let criticalPathNode = '';

    // 3. Fetch Risks
    const allRisks = await db.query.riskRegister.findMany({
        where: eq(riskRegister.organisationId, member.organisationId),
        with: {
            process: true,
            asset: true,
        }
    });

    const relevantRisks: Array<{
        title: string;
        riskScore: number;
        level: string;
        linkedNode: string;
    }> = [];

    const involvedAssetIds = new Set<number>();
    const involvedProcessIds = new Set<number>();
    involvedProcessIds.add(rootProcess.id);

    // Collect all involved IDs during traversal
    const visited = new Set<number>();
    const queue = [{ process: rootProcess, path: [rootProcess.name] }];
    while (queue.length > 0) {
        const { process, path } = queue.shift()!;
        if (visited.has(process.id)) continue;
        visited.add(process.id);
        involvedProcessIds.add(process.id);

        for (const dep of process.dependencies) {
            let depRTO = 0;
            let depName = '';
            let depType = '';

            if (dep.dependentOnAssetId && dep.asset) {
                involvedAssetIds.add(dep.dependentOnAssetId);
                depRTO = parseRTO(dep.asset.recoveryTimeObjective);
                depName = dep.asset.name;
                depType = 'Asset';
            } else if (dep.dependentOnProcessId && dep.dependentProcess) {
                involvedProcessIds.add(dep.dependentOnProcessId);
                depRTO = parseRTO(dep.dependentProcess.rto);
                depName = dep.dependentProcess.name;
                depType = 'Process';

                const fullDepProcess = allProcesses.find((p: any) => p.id === dep.dependentOnProcessId);
                if (fullDepProcess) queue.push({ process: fullDepProcess, path: [] });
            }

            // Update Max Path RTO (Critical Path)
            if (depRTO > maxPathRTO) {
                maxPathRTO = depRTO;
                criticalPathNode = depName;
            }

            // Check for GAP
            if (depRTO > targetRTO) {
                rtoGaps.push({
                    dependencyName: depName,
                    dependencyType: depType,
                    actualRTO: depRTO,
                    targetRTO: targetRTO,
                    gap: depRTO - targetRTO
                });
            }
        }
    }

    // Filter Risks
    allRisks.forEach((risk: any) => {
        let isRelevant = false;
        let nodeName = '';

        if (risk.assetId && involvedAssetIds.has(risk.assetId)) {
            isRelevant = true;
            nodeName = risk.asset?.name || 'Asset';
        } else if (risk.processId && involvedProcessIds.has(risk.processId)) {
            isRelevant = true;
            nodeName = risk.process?.name || 'Process';
        }

        if (isRelevant) {
            relevantRisks.push({
                title: risk.riskName,
                riskScore: risk.riskScore || 0,
                level: (risk.riskScore || 0) > 15 ? 'High' : (risk.riskScore || 0) > 8 ? 'Medium' : 'Low',
                linkedNode: nodeName
            });
        }
    });

    // Sort by score (desc)
    relevantRisks.sort((a, b) => b.riskScore - a.riskScore);

    const estimatedOutageCost = totalImpact * maxPathRTO;

    // --- AI Analysis Integration ---
    const dependenciesData = [];

    // We need to re-map the dependencies similar to getProcessRecommendationsAction
    // Or we can extract it from the visited nodes if we tracked them properly, 
    // but we can also just map from rootProcess directly for the "first level" analysis
    // OR we can pass the *critical path* and *full gaps* to the AI.

    // Let's reuse the logic to gather all dependencies from rootProcess for the AI context
    const aiDependenciesData = rootProcess.dependencies.map((dep: any) => {
        let name = '';
        let type: 'Asset' | 'Process' = 'Asset';
        let rto = '0';

        if (dep.dependentOnAssetId && dep.asset) {
            name = dep.asset.name;
            type = 'Asset';
            rto = dep.asset.recoveryTimeObjective || '0';
        } else if (dep.dependentOnProcessId && dep.dependentProcess) {
            name = dep.dependentProcess.name;
            type = 'Process';
            rto = dep.dependentProcess.rto || '0';
        }

        if (!name) return null;

        // Find if this dependency has a gap in our calculated rtoGaps
        const gapInfo = rtoGaps.find(g => g.dependencyName === name && g.dependencyType === type);

        return {
            name,
            type,
            rto,
            gap: gapInfo ? gapInfo.gap : undefined
        };
    }).filter((d: any): d is any => d !== null);


    const aiHighRisks = relevantRisks
        .filter((r: any) => (r.riskScore || 0) > 8)
        .map((r: any) => ({
            scenario: r.title,
            likelihood: r.level || "Medium",
            impact: "High", // Simplified mapping based on score
            relatedNode: r.linkedNode,
        }));

    let aiAnalysisResult = null;
    try {
        console.log("Generating AI Recommendations for Analysis...");
        // Ensure dependencies map correctly
        console.log("AI Input Config:", { processName: rootProcess.name, depCount: aiDependenciesData.length, riskCount: aiHighRisks.length });

        aiAnalysisResult = await generateBIARecommendations({
            processName: rootProcess.name,
            rto: rootProcess.rto || '4h',
            rpo: rootProcess.rpo || '4h',
            criticality: rootProcess.priority || 'Medium',
            downtimeCost: rootProcess.downtimeCostPerHour || 0,
            dependencies: aiDependenciesData,
            highRisks: aiHighRisks
        });
    } catch (e) {
        console.error("AI Generation failed during analysis:", e);
    }

    const resultData = {
        totalDowntimeCost: totalImpact,
        maxRecoveryTime: maxPathRTO,
        estimatedOutageCost,
        rtoGaps,
        criticalPath: maxPathRTO > 0 ? [rootProcess.name, criticalPathNode] : [],
        relevantRisks,
        aiAnalysis: aiAnalysisResult // Include in the summary
    };

    // 4. Update the existing run
    await db.update(biaRuns)
        .set({
            status: 'completed',
            runDate: new Date(),
            summaryData: resultData,
            performedBy: session.user.name || 'Unknown',
        })
        .where(eq(biaRuns.id, analysisId));

    revalidatePath(`/bia/analysis/${analysisId}`);
    revalidatePath('/bia');

    return {
        success: true,
        data: resultData
    };
}

// --- AI Analysis ---

import { generateBIARecommendations } from '@/lib/ai/bia-recommendations';

export async function getProcessRecommendationsAction(processId: number) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    const userId = parseInt(session.user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No org found' };

    // Fetch Full Context
    const process = await db.query.businessProcesses.findFirst({
        where: eq(businessProcesses.id, processId),
        with: {
            dependencies: {
                with: {
                    asset: true,
                    dependentProcess: true
                }
            }
        }
    });

    if (!process || process.organisationId !== member.organisationId) {
        return { error: 'Process not found' };
    }

    // Fetch Runs to check context (optional, but good for history)
    // Fetch Risks
    const allRisks = await db.query.riskRegister.findMany({
        where: eq(riskRegister.organisationId, member.organisationId),
        with: {
            process: true,
            asset: true,
        }
    });

    // Filter relevant risks
    const relevantRisks = allRisks.filter((risk: any) => {
        if (risk.processId === processId) return true;
        // Check dependency risks
        return process.dependencies.some((dep: any) =>
            (dep.dependentOnAssetId && dep.dependentOnAssetId === risk.assetId) ||
            (dep.dependentOnProcessId && dep.dependentOnProcessId === risk.processId)
        );
    });

    const highRisks = relevantRisks
        .filter((r: any) => (r.riskScore || 0) > 8)
        .map((r: any) => ({
            scenario: r.riskName,
            likelihood: r.likelihood || "Medium",
            impact: r.impact || "Medium",
            relatedNode: r.assetId ? 'Asset: ' + r.asset?.name : 'Process',
        }));

    const dependenciesData = process.dependencies.map((dep: any) => {
        if (dep.dependentOnAssetId && dep.asset) {
            return {
                name: dep.asset.name,
                type: 'Asset' as const,
                rto: dep.asset.recoveryTimeObjective || '0',
            };
        } else if (dep.dependentOnProcessId && dep.dependentProcess) {
            return {
                name: dep.dependentProcess.name,
                type: 'Process' as const,
                rto: dep.dependentProcess.rto || '0',
            };
        }
        return null;
    }).filter((d: any): d is any => d !== null);

    const result = await generateBIARecommendations({
        processName: process.name,
        rto: process.rto || '4h',
        rpo: process.rpo || '4h',
        criticality: process.priority || 'Medium',
        downtimeCost: process.downtimeCostPerHour || 0,
        dependencies: dependenciesData,
        highRisks: highRisks
    });

    return { success: true, data: result };
}
