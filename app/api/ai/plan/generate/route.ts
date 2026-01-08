import { NextRequest, NextResponse } from 'next/server';
import { generateRunbookSteps, PlanGenerationRequest } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
    try {
        const body: PlanGenerationRequest = await req.json();

        if (!body.runbookName) {
            return NextResponse.json(
                { error: 'Missing required field: runbookName' },
                { status: 400 }
            );
        }

        const steps = await generateRunbookSteps(body);
        return NextResponse.json({ steps });
    } catch (error) {
        console.error('Error in AI plan generation:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
