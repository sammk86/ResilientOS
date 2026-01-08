import { groq } from './groq';
import { aiConfig } from './config';
import { buildAnalysisPrompt } from './prompts';
import type { Risk, Remediation } from '@/types/assessment';

export interface DomainAnalysisData {
    domainName: string;
    domainCode?: string;
    domainDescription?: string;
    controls: Array<{
        controlId: number;
        controlCode: string;
        controlName: string;
        description?: string;
        status: 'not_started' | 'in_progress' | 'completed';
        notes?: string;
    }>;
}

export interface DomainAnalysisResult {
    risks: Omit<Risk, 'risk_id'>[];
    remediations: Array<Omit<Remediation, 'remediation_id' | 'risk_id'> & { control_id: number }>; // control_id used to match with risk_id
}

/**
 * Analyzes a single domain's controls using Groq AI to identify risks and generate remediations.
 * This function processes ONE domain at a time to avoid context window limits.
 */
export async function analyzeDomainWithAI(
    domainData: DomainAnalysisData
): Promise<DomainAnalysisResult> {
    // Check if API key is available
    if (!aiConfig.enabled) {
        throw new Error('GROQ_API_KEY is not configured');
    }

    // Build the prompt
    const prompt = buildAnalysisPrompt(domainData);

    try {
        // Call Groq API
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `You are an expert GRC (Governance, Risk, and Compliance) analyst. Your task is to analyze assessment controls and identify risks with appropriate severity levels, then provide actionable remediation steps.`,
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            model: aiConfig.groq.model,
            temperature: aiConfig.groq.temperature,
            response_format: { type: 'json_object' },
        });

        const responseContent = completion.choices[0]?.message?.content;
        if (!responseContent) {
            throw new Error('Empty response from Groq API');
        }

        // Parse JSON response
        let parsedResponse: {
            risks?: Array<{
                control_code: string;
                control_name: string;
                severity: 'low' | 'medium' | 'high';
                description: string;
            }>;
            remediations?: Array<{
                control_code: string;
                title: string;
                description: string;
                priority: 'low' | 'medium' | 'high';
            }>;
        };

        try {
            parsedResponse = JSON.parse(responseContent);
        } catch (parseError) {
            console.error('Failed to parse AI response:', responseContent);
            throw new Error('Invalid JSON response from AI');
        }

        // Map AI response to our types
        const risks: Omit<Risk, 'risk_id'>[] = [];
        const remediations: Array<Omit<Remediation, 'remediation_id' | 'risk_id'> & { control_id: number }> = [];

        // Create a map of control codes to control data for matching
        const controlMap = new Map(
            domainData.controls.map((c) => [c.controlCode, c])
        );

        // Process risks
        if (parsedResponse.risks && Array.isArray(parsedResponse.risks)) {
            for (const aiRisk of parsedResponse.risks) {
                const control = controlMap.get(aiRisk.control_code);
                if (control) {
                    risks.push({
                        control_id: control.controlId,
                        control_name: aiRisk.control_name || control.controlName,
                        severity: aiRisk.severity,
                        description: aiRisk.description,
                    });
                }
            }
        }

        // Process remediations - match with risks by control code
        // Create a map of control_id to risk for matching
        const riskMapByControlId = new Map<number, Omit<Risk, 'risk_id'>>();
        risks.forEach((risk) => {
            riskMapByControlId.set(risk.control_id, risk);
        });

        if (parsedResponse.remediations && Array.isArray(parsedResponse.remediations)) {
            for (const aiRemediation of parsedResponse.remediations) {
                const control = controlMap.get(aiRemediation.control_code);
                if (control) {
                    // Find the matching risk for this control
                    const matchingRisk = riskMapByControlId.get(control.controlId);

                    // Create remediation with control_id for caller to match with risk_id
                    remediations.push({
                        title: aiRemediation.title,
                        description: aiRemediation.description,
                        priority: aiRemediation.priority,
                        control_id: control.controlId, // Store control_id for matching in caller
                    });
                }
            }
        }

        return { risks, remediations };
    } catch (error) {
        console.error('Error in AI domain analysis:', error);
        throw error;
    }
}
