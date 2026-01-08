import type { DomainAnalysisData } from './analyze-domain';

/**
 * Builds a comprehensive prompt for AI analysis
 * 
 * @param domainData - Data needed to construct the analysis prompt
 * @returns The formatted prompt string
 */
export function buildAnalysisPrompt(domainData: DomainAnalysisData): string {
    const controlsText = domainData.controls
        .map((control, index) => {
            const answerText = control.notes
                ? `Answer/Notes: "${control.notes}"`
                : 'Answer/Notes: (No answer provided)';

            return `
Control ${index + 1}:
- Code: ${control.controlCode}
- Name: ${control.controlName}
${control.description ? `- Description: ${control.description}` : ''}
- Status: ${control.status}
- ${answerText}`;
        })
        .join('\n');

    return `You are analyzing a GRC (Governance, Risk, and Compliance) assessment domain.

DOMAIN INFORMATION:
- Domain Name: ${domainData.domainName}
${domainData.domainCode ? `- Domain Code: ${domainData.domainCode}` : ''}
${domainData.domainDescription ? `- Description: ${domainData.domainDescription}` : ''}

CONTROLS AND ANSWERS:
${controlsText}

ANALYSIS INSTRUCTIONS:

1. Answer Format Detection:
   You need to intelligently detect and analyze different answer formats:
   
   a) NUMERIC SCALES (1-5):
      - Look for numeric values 1-5 in the answer/notes
      - Scores 1-2: HIGH risk (inadequate compliance)
      - Score 3: MEDIUM risk (partial compliance)
      - Scores 4-5: LOW risk (good compliance, but still verify completeness)
   
   b) YES/NO ANSWERS:
      - Detect yes/no, true/false, y/n patterns (case-insensitive)
      - "No", "False", "N", "no", "false", "n": HIGH risk
      - "Yes", "True", "Y", "yes", "true", "y": LOW risk (but check for completeness)
   
   c) STATUS-BASED:
      - Use the status field provided:
        - "not_started": HIGH risk (control not addressed)
        - "in_progress": MEDIUM risk (partially addressed)
        - "completed": Lower risk (but verify answer quality and completeness)
   
   d) FREE-TEXT NOTES:
      - Analyze content quality:
        - Completeness: Detailed vs vague responses
        - Quality: Specific evidence vs generic statements
        - Gaps: Missing information, unanswered questions
      - Vague or incomplete answers indicate MEDIUM to HIGH risk
      - Detailed, specific answers with evidence indicate LOW risk

2. Risk Identification:
   For each control, identify risks based on:
   - Answer value/quality (low scores, "no" answers, incomplete status)
   - Answer completeness (missing answers, vague responses)
   - Answer consistency with control requirements
   - Control importance and domain context
   
   Assign severity:
   - HIGH: Critical gaps, missing controls, negative answers, very low scores (1-2)
   - MEDIUM: Partial compliance, incomplete answers, in-progress status, medium scores (3)
   - LOW: Minor gaps, missing documentation, good answers but could be improved

3. Remediation Generation:
   For each identified risk, generate:
   - A clear, actionable title
   - Specific remediation steps tailored to the risk and answer type
   - Priority matching the risk severity
   - Clear guidance on how to improve compliance

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "risks": [
    {
      "control_code": "string (matching one of the control codes above)",
      "control_name": "string",
      "severity": "low" | "medium" | "high",
      "description": "Detailed description of the risk identified"
    }
  ],
  "remediations": [
    {
      "control_code": "string (matching the control code of the related risk)",
      "title": "Short, actionable title",
      "description": "Detailed remediation steps and guidance",
      "priority": "low" | "medium" | "high" (should match the related risk's severity)
    }
  ]
}

IMPORTANT:
- Analyze ALL controls, including those with "not_started" or "in_progress" status
- Generate at least one risk for controls with issues (not_started, in_progress, poor answers, missing answers)
- Generate corresponding remediations for each risk
- Be specific and actionable in your recommendations
- Consider the domain context when assessing severity

Now analyze the domain and provide your assessment in the JSON format specified above.`;
}
