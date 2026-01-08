import Groq from 'groq-sdk';

const GROQ_API_KEY = process.env.GROQ_API_KEY;

export const groq = new Groq({
    apiKey: GROQ_API_KEY || '',
});

export interface RiskAnalysisRequest {
    assetName: string;
    assetType: string;
    criticality: string;
}

export interface RiskAnalysisResponse {
    risks: {
        scenario: string;
        threatCategory: string;
        likelihood: number;
        impact: number;
        mitigationSuggestion: string;
    }[];
}

export async function generateRiskAssessment(data: RiskAnalysisRequest): Promise<RiskAnalysisResponse> {
    if (!GROQ_API_KEY) {
        console.warn("GROQ_API_KEY is not set. Returning mock data.");
        return getMockRiskData(data);
    }

    const prompt = `
    Analyze the following asset for business continuity risks:
    Asset Name: ${data.assetName}
    Type: ${data.assetType}
    Criticality: ${data.criticality}

    Generate 3 specific risk scenarios relevant to this asset.
    For each, provide:
    1. Risk Scenario Description
    2. Threat Category (Cyber, Physical, Financial, Supply Chain, etc.)
    3. Likelihood (1-5, where 5 is highest)
    4. Impact (1-5, where 5 is highest)
    5. A concise mitigation suggestion.

    Return the result as a valid JSON object with the key "risks" containing an array of objects.
  `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile", // Using Llama 3 on Groq or env var
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.statusText}`);
        }

        const json = await response.json();
        return JSON.parse(json.choices[0].message.content);

    } catch (error) {
        console.error("Failed to generate risk assessment:", error);
        return getMockRiskData(data);
    }
}

function getMockRiskData(data: RiskAnalysisRequest): RiskAnalysisResponse {
    return {
        risks: [
            {
                scenario: `Partial failure of ${data.assetName} due to misconfiguration`,
                threatCategory: "Operational",
                likelihood: 3,
                impact: 4,
                mitigationSuggestion: "Implement automated configuration management and peer review."
            },
            {
                scenario: `Unavailability of ${data.assetName} due to cyber attack`,
                threatCategory: "Cyber",
                likelihood: 2,
                impact: 5,
                mitigationSuggestion: "Enable MFA and regular vulnerability scanning."
            },
            {
                scenario: `Performance degradation of ${data.assetName} during peak load`,
                threatCategory: "Technical",
                likelihood: 4,
                impact: 3,
                mitigationSuggestion: "Implement auto-scaling and load balancing."
            }
        ]
    }
}
const MOCK_POLICY_CONTENT = `
## Purpose
The purpose of this policy is to establish a framework for business continuity management.

## Scope
This policy applies to all critical business functions and supporting infrastructure.

## Responsibilities
- **Senior Management**: Approve the policy and provide resources.
- **BCM Coordinator**: Maintain the BCM program.
- **All Employees**: Comply with BCM requirements.
`;

export async function generatePolicyOutline(title: string, description: string): Promise<string[]> {
    if (!GROQ_API_KEY) {
        return ["Purpose", "Scope", "Responsibilities", "Policy Statements", "Compliance", "Definitions"];
    }

    const prompt = `
    You are an expert in GRC. Create a list of 5-8 standard policy section titles for a policy titled "${title}".
    Description: "${description}"
    
    Return ONLY a JSON array of strings. Example: ["Purpose", "Scope", ...]. Do not include any other text.
    `;

    const validModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const requestBody = {
        model: validModel,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
    };

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        const result = JSON.parse(json.choices[0].message.content);
        // Handle if result is { "sections": [...] } or just [...]
        return Array.isArray(result) ? result : (result.sections || result.titles || []);
    } catch (e) {
        console.error("Failed to generate outline", e);
        return ["Purpose", "Scope", "Responsibilities", "Policy Statements"];
    }
}

export interface PolicyContentRequest {
    title: string;
    sectionTitle: string;
    description?: string;
    context?: string;
    currentContent?: string;
}

export async function generatePolicySectionContent(data: PolicyContentRequest): Promise<string> {
    if (!GROQ_API_KEY) {
        console.warn("GROQ_API_KEY is not set. Returning mock policy content.");
        return MOCK_POLICY_CONTENT;
    }

    let prompt = `
    You are an expert in Governance, Risk, and Compliance (GRC).
    Draft a professional policy section content for the following:

    Policy Title: ${data.title}
    Section Title: ${data.sectionTitle}
    Description: ${data.description || "N/A"}
    Context: ${data.context || "General Business Continuity Best Practices"}
    `;

    if (data.currentContent) {
        prompt += `
        
        EXISTING CONTENT (The user has already provided this draft. Your PRIMARY TASK is to refine, polish, and expand upon this specific content. Do NOT ignore it. Maintain the key points but make it professional GRC language):
        "${data.currentContent}"
        `;
    } else {
        prompt += `
        Generate a comprehensive policy section based on the title and context.
        `;
    }

    prompt += `
    The content should be professional, clear, and actionable.
    Format the output as clean GitHub Flavored Markdown (GFM).
    - Use standard GFM table syntax:
      | Header 1 | Header 2 |
      | -------- | -------- |
      | Cell 1   | Cell 2   |
    - Ensure tables have header rows and separator rows.
    - Do NOT include the "Policy Title" or "Section Title" in the output, just the body content.
    `;

    const validModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const requestBody = {
        model: validModel,
        messages: [{ role: "user", content: prompt.trim() }],
    };
    console.log("[Groq API Debug] Sending request:", JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Groq API error: ${response.statusText} Body: ${errorBody}`);
        }

        const json = await response.json();
        return json.choices[0].message.content;

    } catch (error) {
        console.error("Failed to generate policy content:", error);
        // Fallback to existing content if available, otherwise mock data
        return data.currentContent ? data.currentContent : MOCK_POLICY_CONTENT;
    }
}

export interface PlanGenerationRequest {
    runbookName: string;
    description?: string;
    risks?: string[];
    biaContext?: {
        rto?: string;
        criticality?: string;
        dependencies?: number;
    };
}

export async function generateRunbookSteps(data: PlanGenerationRequest): Promise<{ title: string; description: string; estimatedTime: string }[]> {
    if (!GROQ_API_KEY) {
        return [
            { title: "Initial Assessment", description: "Assess the situation and verify the incident.", estimatedTime: "10m" },
            { title: "Activate Team", description: "Notify and assemble the crisis response team.", estimatedTime: "15m" },
            { title: "Mitigate Immediate Risks", description: "Take steps to contain the incident.", estimatedTime: "30m" }
        ];
    }

    const prompt = `
    You are an expert in Business Continuity and Disaster Response.
    Create a procedural runbook (list of steps) for the following scenario:

    Runbook Name: ${data.runbookName}
    Description: ${data.description || "General recovery plan"}
    Context:
    - Criticality: ${data.biaContext?.criticality || "Unknown"}
    - RTO: ${data.biaContext?.rto || "Unknown"}
    - Addressed Risks: ${data.risks?.join(", ") || "None specified"}

    Generate 5-10 actionable, chronological steps.
    For each step, provide:
    1. Title
    2. Description (one sentence)
    3. Estimated Time (e.g., "15m", "1h")

    Return ONLY a JSON array of objects with keys: "title", "description", "estimatedTime".
    `;

    const validModel = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const requestBody = {
        model: validModel,
        messages: [{ role: "user", content: prompt.trim() }],
        response_format: { type: "json_object" },
    };

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) throw new Error(response.statusText);
        const json = await response.json();
        const result = JSON.parse(json.choices[0].message.content);
        return Array.isArray(result) ? result : (result.steps || []);
    } catch (e) {
        console.error("Failed to generate runbook steps", e);
        return [
            { title: "Error Generating Steps", description: "Please check AI configuration.", estimatedTime: "0m" }
        ];
    }
}

