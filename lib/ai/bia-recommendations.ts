import { groq } from './groq';

export interface BIARecommendationRequest {
    processName: string;
    rto: string;
    rpo: string;
    criticality: string;
    downtimeCost: number;
    dependencies: {
        name: string;
        type: 'Asset' | 'Process';
        rto: string;
        gap?: number;
    }[];
    highRisks: {
        scenario: string;
        likelihood: string; // "High", "Medium", "Low" or number
        impact: string;
        relatedNode: string;
    }[];
}

export interface BIARecommendationResponse {
    analysis: string[]; // Sequential thinking steps
    recommendations: {
        title: string;
        description: string;
        priority: 'Critical' | 'High' | 'Medium' | 'Low';
        category: 'Resilience' | 'Compliance' | 'Cost-Optimization';
    }[];
}

export async function generateBIARecommendations(data: BIARecommendationRequest): Promise<BIARecommendationResponse> {
    if (!process.env.GROQ_API_KEY) {
        return getMockBIARecommendations(data);
    }

    const prompt = `
    You are an expert in Business Continuity Management (BCM) and Organizational Resilience.
    Perform a "Sequential Thinking" analysis to provide actionable recommendations for the following Business Process:

    PROCESS CONTEXT:
    - Name: ${data.processName}
    - Target RTO: ${data.rto}
    - Target RPO: ${data.rpo}
    - Criticality: ${data.criticality}
    - Estimated Downtime Cost: $${data.downtimeCost}/hr

    DEPENDENCIES (Upstream):
    ${data.dependencies.map(d => `- ${d.name} (${d.type}): RTO=${d.rto} ${d.gap && d.gap > 0 ? `[GAP: +${d.gap}h]` : '[OK]'}`).join('\n')}

    ASSOCIATED HIGH RISKS:
    ${data.highRisks.map(r => `- [${r.likelihood}/${r.impact}] ${r.scenario} (Related to: ${r.relatedNode})`).join('\n')}

    --------------------------------------------------------
    INSTRUCTIONS:

    Apply Sequential Thinking to analyze this data in steps:
    1. **Metric Alignment**: Analyze the RTO/RPO alignment. Are dependencies recoverable within the process's RTO? Highlight specific gaps.
    2. **Risk Correlation**: specific risks are linked to the process or its dependencies. specific weaknesses.
    3. **Impact Analysis**: Consider the downtime cost. Is the current resilience level justified by the cost of failure?
    4. **Synthesis**: Formulate specific, actionable recommendations.

    OUTPUT FORMAT:
    Return a valid JSON object with detailed content:
    {
      "analysis": [
        "Step 1: [Analysis of RTO gaps...]",
        "Step 2: [Analysis of risks...]",
        "Step 3: [Financial impact...]"
      ],
      "recommendations": [
        {
          "title": "Short actionable title",
          "description": "Detailed reasoning and specific action.",
          "priority": "Critical" | "High" | "Medium" | "Low",
          "category": "Resilience" | "Compliance" | "Cost-Optimization"
        }
      ]
    }
    `;

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
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
        console.error("Failed to generate BIA recommendations:", error);
        return getMockBIARecommendations(data);
    }
}

function getMockBIARecommendations(data: BIARecommendationRequest): BIARecommendationResponse {
    return {
        analysis: [
            "Step 1: Analyzed RTO alignment. Found potential gaps in upstream dependencies.",
            "Step 2: Reviewed high risks. supply chain vulnerability identified.",
            "Step 3: Financial impact suggests investment in redundancy is justified."
        ],
        recommendations: [
            {
                title: "Reduce Dependency RTO",
                description: "The upstream asset has an RTO higher than the process requires. Consider upgrading SLA.",
                priority: "High",
                category: "Resilience"
            },
            {
                title: "Mitigate Supply Chain Risk",
                description: "Implement multi-vendor strategy for critical dependencies.",
                priority: "Medium",
                category: "Resilience"
            }
        ]
    };
}
