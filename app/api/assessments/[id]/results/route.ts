import { NextRequest, NextResponse } from 'next/server';
import { getAssessmentById } from '@/lib/db/queries-grc';
import { getUser } from '@/lib/db/queries';

export async function GET(
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
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        const assessment = await getAssessmentById(assessmentId, user.id);

        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        if (!assessment.results) {
            return NextResponse.json({ error: 'Results not found for this assessment' }, { status: 404 });
        }

        return NextResponse.json(assessment.results);
    } catch (error) {
        console.error('Error fetching assessment results:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
