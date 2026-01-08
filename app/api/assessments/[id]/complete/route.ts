import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getAssessmentById } from '@/lib/db/queries-grc';
import { assessments, assessmentResults, assessmentProgress, controls, domains } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import type { Risk, Remediation } from '@/types/assessment';
import { analyzeDomainWithAI } from '@/lib/ai/analyze-domain';
import { aiConfig } from '@/lib/ai/config';
import { calculateRiskBasedScore } from '@/lib/assessment/score-calculator';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const assessmentId = parseInt(id, 10);

        if (isNaN(assessmentId)) {
            return NextResponse.json({ error: 'Invalid assessment ID' }, { status: 400 });
        }

        const assessment = await getAssessmentById(assessmentId, user.id);
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        if (assessment.status === 'completed') {
            return NextResponse.json(
                { error: 'Assessment already completed' },
                { status: 400 }
            );
        }

        // Get all progress records
        const allProgress = await db
            .select()
            .from(assessmentProgress)
            .where(eq(assessmentProgress.assessmentId, assessmentId));

        const totalControls = allProgress.length;

        // Get unique domains (filter out 0 or null)
        const domainIds: number[] = Array.from(new Set(allProgress.map((p: any) => p.domainId).filter((id: any): id is number => id !== null && id !== 0)));
        const totalDomains = domainIds.length;

        // Get all controls data
        const controlIds = [...new Set(allProgress.map((p: any) => p.controlId))] as number[];

        // Fetch controls if we have any
        let controlMap = new Map<number, any>();
        if (controlIds.length > 0) {
            const allControlsData = await db
                .select()
                .from(controls)
                .where(inArray(controls.id, controlIds));
            controlMap = new Map(allControlsData.map((c: any) => [c.id, c]));
        }

        // Get all domains data if we have any
        let domainMap = new Map<number, any>();
        if (domainIds.length > 0) {
            const allDomainsData = await db
                .select()
                .from(domains)
                .where(inArray(domains.id, domainIds));
            domainMap = new Map(allDomainsData.map((d: any) => [d.id, d]));
        }

        // Initialize arrays for AI-generated risks and remediations
        const risks: Risk[] = [];
        const remediations: Remediation[] = [];
        let riskIdCounter = 1;
        let remediationIdCounter = 1;

        // Try AI analysis for each domain (process sequentially to avoid context limits)
        let aiAnalysisSuccessful = false;
        const aiErrors: string[] = [];

        if (aiConfig.enabled && domainIds.length > 0) {
            for (const domainId of domainIds) {
                try {
                    // Get domain info
                    const domain = domainMap.get(domainId);
                    if (!domain) continue;

                    // Get all controls for this domain
                    const domainProgress = allProgress.filter((p: any) => p.domainId === domainId);
                    const domainControls = domainProgress
                        .map((p: any) => {
                            const control = controlMap.get(p.controlId);
                            if (!control) return null;
                            return {
                                controlId: control.id,
                                controlCode: control.controlCode || control.code, // Handle both naming conventions if referencing mismatch
                                controlName: control.controlName || control.name,
                                description: control.description || undefined,
                                status: p.status as 'not_started' | 'in_progress' | 'completed',
                                notes: p.notes || undefined,
                            };
                        })
                        .filter((c: any): c is NonNullable<typeof c> => c !== null);

                    if (domainControls.length === 0) continue;

                    // Call AI analysis for this domain
                    const aiResult = await analyzeDomainWithAI({
                        domainName: domain.domainName || domain.name,
                        domainCode: domain.domainCode || undefined,
                        domainDescription: domain.description || undefined,
                        controls: domainControls,
                    });

                    // Process risks from AI
                    for (const aiRisk of aiResult.risks) {
                        const risk: Risk = {
                            risk_id: riskIdCounter++,
                            control_id: aiRisk.control_id,
                            control_name: aiRisk.control_name,
                            severity: aiRisk.severity,
                            description: aiRisk.description,
                            domain_id: domainId,
                        };
                        risks.push(risk);
                    }

                    // Process remediations from AI
                    const riskMapByControlId = new Map<number, Risk>();
                    risks.forEach((risk) => {
                        if (!riskMapByControlId.has(risk.control_id)) {
                            riskMapByControlId.set(risk.control_id, risk);
                        }
                    });

                    for (const aiRemediation of aiResult.remediations) {
                        const relatedRisk = riskMapByControlId.get(aiRemediation.control_id);
                        if (relatedRisk) {
                            const remediation: Remediation = {
                                remediation_id: remediationIdCounter++,
                                risk_id: relatedRisk.risk_id,
                                title: aiRemediation.title,
                                description: aiRemediation.description,
                                priority: aiRemediation.priority,
                            };
                            remediations.push(remediation);
                        }
                    }

                    aiAnalysisSuccessful = true;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`AI analysis failed for domain ${domainId}:`, errorMessage);
                    aiErrors.push(`Domain ${domainId}: ${errorMessage}`);
                }
            }
        }

        // Fallback to simple risk generation if AI analysis failed or is not available
        if (!aiAnalysisSuccessful || risks.length === 0) {
            console.log('Using fallback risk generation logic');
            // If AI partially succeeded, we might want to keep those risks? 
            // For simplicity, if risks array is empty, run fallback.

            if (risks.length === 0) {
                riskIdCounter = 1;
                remediationIdCounter = 1;

                for (const progress of allProgress) {
                    const control = controlMap.get(progress.controlId);
                    if (!control) continue;

                    let riskSeverity: 'low' | 'medium' | 'high' = 'low';
                    let riskDescription = '';

                    const controlName = control.controlName || control.name;
                    const controlCode = control.controlCode || control.code;

                    if (progress.status === 'not_started') {
                        riskSeverity = 'high';
                        riskDescription = `Control ${controlCode} (${controlName}) has not been started. This represents a significant gap in compliance.`;
                    } else if (progress.status === 'in_progress') {
                        riskSeverity = 'medium';
                        riskDescription = `Control ${controlCode} (${controlName}) is in progress but not completed.`;
                    } else if (!progress.notes || progress.notes.trim().length === 0) {
                        riskSeverity = 'low';
                        riskDescription = `Control ${controlCode} (${controlName}) is marked as completed but lacks documentation.`;
                    }

                    if (riskSeverity !== 'low' || progress.status !== 'completed' || !progress.notes) {
                        const risk: Risk = {
                            risk_id: riskIdCounter++,
                            control_id: control.id,
                            control_name: controlName,
                            severity: riskSeverity,
                            description: riskDescription || `Control ${controlCode} requires attention.`,
                            domain_id: progress.domainId !== 0 ? progress.domainId : undefined,
                        };
                        risks.push(risk);

                        const remediation: Remediation = {
                            remediation_id: remediationIdCounter++,
                            risk_id: risk.risk_id,
                            title: `Address ${controlCode}`,
                            description: progress.status === 'not_started'
                                ? `Complete the assessment for control ${controlCode}.`
                                : `Add documentation/evidence for control ${controlCode}.`,
                            priority: riskSeverity,
                        };
                        remediations.push(remediation);
                    }
                }
            }
        }

        // Calculate risk-based score
        const scoreCalculation = calculateRiskBasedScore(totalControls, risks);
        const overallScore = scoreCalculation.overallScore;
        const overallCompliance = scoreCalculation.overallCompliance;

        // Update assessment status
        await db
            .update(assessments)
            .set({
                status: 'completed',
                completedDate: new Date(),
                progress: 100,
                updatedAt: new Date(),
            })
            .where(eq(assessments.id, assessmentId));

        // Create or update results record
        await db
            .insert(assessmentResults)
            .values({
                assessmentId,
                overallScore,
                overallCompliance,
                totalDomains,
                totalControls,
                resultsData: {
                    risks,
                    remediations,
                    scoreCalculation: {
                        riskBreakdown: scoreCalculation.riskBreakdown,
                        calculationFormula: scoreCalculation.calculationFormula,
                    },
                },
            })
            .onConflictDoUpdate({
                target: [assessmentResults.assessmentId],
                set: {
                    overallScore,
                    overallCompliance,
                    totalDomains,
                    totalControls,
                    resultsData: {
                        risks,
                        remediations,
                        scoreCalculation: {
                            riskBreakdown: scoreCalculation.riskBreakdown,
                            calculationFormula: scoreCalculation.calculationFormula,
                        },
                    },
                },
            });

        return NextResponse.json({
            message: 'Assessment completed successfully',
            assessment_id: assessmentId,
        });
    } catch (error) {
        console.error('Error completing assessment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
