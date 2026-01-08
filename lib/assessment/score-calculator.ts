import type { Risk } from '@/types/assessment';

export interface ScoreCalculationConfig {
    highRiskPenalty: number; // Penalty for high risk (default: 1.0)
    mediumRiskPenalty: number; // Penalty for medium risk (default: 0.5)
    lowRiskPenalty: number; // Penalty for low risk (default: 0.0)
}

export interface ScoreCalculationResult {
    overallScore: number; // 0-100
    overallCompliance: number; // 0-100 (same as score for now)
    riskBreakdown: {
        high: number;
        medium: number;
        low: number;
        total: number;
    };
    calculationFormula: string;
}

/**
 * Calculates assessment score based on risk levels
 * 
 * Formula: (total_controls - high_risks * high_penalty - medium_risks * medium_penalty - low_risks * low_penalty) / total_controls * 100
 * 
 * Default penalties:
 * - High risk: 1.0 (full penalty)
 * - Medium risk: 0.5 (half penalty)
 * - Low risk: 0.0 (no penalty)
 * 
 * @param totalControls Total number of controls in the assessment
 * @param risks Array of identified risks
 * @param config Optional configuration to customize penalties
 * @returns Score calculation result
 */
export function calculateRiskBasedScore(
    totalControls: number,
    risks: Risk[],
    config?: Partial<ScoreCalculationConfig>
): ScoreCalculationResult {
    const defaultConfig: ScoreCalculationConfig = {
        highRiskPenalty: 1.0,
        mediumRiskPenalty: 0.5,
        lowRiskPenalty: 0.0,
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Count risks by severity
    const riskBreakdown = {
        high: risks.filter((r) => r.severity === 'high').length,
        medium: risks.filter((r) => r.severity === 'medium').length,
        low: risks.filter((r) => r.severity === 'low').length,
        total: risks.length,
    };

    // Calculate penalty points
    const penaltyPoints =
        riskBreakdown.high * finalConfig.highRiskPenalty +
        riskBreakdown.medium * finalConfig.mediumRiskPenalty +
        riskBreakdown.low * finalConfig.lowRiskPenalty;

    // Calculate score: (total - penalties) / total * 100
    // Ensure we don't go below 0
    const rawScore = Math.max(0, (totalControls - penaltyPoints) / totalControls) * 100;
    const overallScore = Math.round(rawScore);
    const overallCompliance = overallScore; // Compliance equals score for now

    // Generate formula description
    const calculationFormula = `(${totalControls} - ${riskBreakdown.high}×${finalConfig.highRiskPenalty} - ${riskBreakdown.medium}×${finalConfig.mediumRiskPenalty} - ${riskBreakdown.low}×${finalConfig.lowRiskPenalty}) / ${totalControls} × 100 = ${overallScore}%`;

    return {
        overallScore,
        overallCompliance,
        riskBreakdown,
        calculationFormula,
    };
}
