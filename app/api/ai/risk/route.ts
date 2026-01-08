import { NextRequest, NextResponse } from 'next/server';
import { generateRiskAssessment, RiskAnalysisRequest } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
    try {
        const body: RiskAnalysisRequest = await req.json();

        if (!body.assetName || !body.criticality) {
            return NextResponse.json(
                { error: 'Missing required fields: assetName, criticality' },
                { status: 400 }
            );
        }

        const result = await generateRiskAssessment(body);
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error in AI risk generation:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
