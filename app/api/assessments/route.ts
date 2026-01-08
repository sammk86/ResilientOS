import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { assessments, frameworks } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { __user, ...userWithoutPassword } = user as any;

        // Fetch assessments for the user
        // Note: Assuming we want assessments user Created or is Assigned to?
        // For now, get all for user.
        const userAssessments = await db.query.assessments.findMany({
            where: eq(assessments.userId, user.id),
            with: {
                framework: true,
                // results: true
            },
            orderBy: [desc(assessments.createdAt)]
        });

        return NextResponse.json({ assessments: userAssessments });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { assessment_name, name, framework_id, frameworkId, description, type, domain_ids, scope, asset_id, process_id } = body;

        // Support both naming conventions
        const resolvedName = assessment_name || name;
        const resolvedFrameworkId = framework_id || frameworkId;

        if (!resolvedName || !resolvedFrameworkId) {
            return NextResponse.json({ error: 'Name and Framework are required' }, { status: 400 });
        }

        const { createAssessmentFromFramework } = await import('@/lib/db/queries-grc');

        const assessmentId = await createAssessmentFromFramework({
            userId: user.id,
            frameworkId: resolvedFrameworkId,
            assessmentName: resolvedName,
            type: type || 'self_assessment',
            description: description,
            domainIds: domain_ids,
            dueDate: body.due_date ? new Date(body.due_date) : undefined,
            scope: scope,
            assetId: asset_id,
            processId: process_id
        });

        // We need to return the full object or just ID? Previous implementation returned object. 
        // Let's return object by fetching it or constructing checks.
        // For compatibility with Wizard which expects { assessment_id: ... }
        return NextResponse.json({
            assessment_id: assessmentId,
            id: assessmentId,
            message: 'Assessment created successfully'
        });
    } catch (error) {
        console.error('Error creating assessment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
