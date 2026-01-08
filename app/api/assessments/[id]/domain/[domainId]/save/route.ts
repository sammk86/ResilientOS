import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getAssessmentById } from '@/lib/db/queries-grc';
import { assessmentProgress, assessments } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { z } from 'zod';

const saveDomainControlsSchema = z.object({
    controls: z.array(
        z.object({
            control_id: z.number().int(),
            status: z.enum(['not_started', 'in_progress', 'completed']),
            notes: z.string().optional(),
        })
    ),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; domainId: string }> }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, domainId } = await params;
        const assessmentId = parseInt(id, 10);
        const domainIdNum = parseInt(domainId, 10);

        if (isNaN(assessmentId) || isNaN(domainIdNum)) {
            return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
        }

        const assessment = await getAssessmentById(assessmentId, user.id);
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        const body = await request.json();
        const validated = saveDomainControlsSchema.parse(body);

        // Save all controls in batch
        for (const controlData of validated.controls) {
            await db
                .insert(assessmentProgress)
                .values({
                    assessmentId,
                    domainId: domainIdNum,
                    controlId: controlData.control_id,
                    status: controlData.status,
                    notes: controlData.notes || null,
                    completedDate: controlData.status === 'completed' ? new Date() : null,
                    assignedToUserId: user.id
                })
                .onConflictDoUpdate({
                    target: [assessmentProgress.assessmentId, assessmentProgress.domainId, assessmentProgress.controlId],
                    set: {
                        status: controlData.status,
                        notes: controlData.notes || null,
                        completedDate: controlData.status === 'completed' ? new Date() : null,
                    },
                });
        }

        // Update assessment progress percentage and status
        const allProgress = await db
            .select()
            .from(assessmentProgress)
            .where(eq(assessmentProgress.assessmentId, assessmentId));

        // Calculate overall progress from completed controls
        const totalControls = assessment.progress.length || 0;
        // We can't rely just on allProgress.length if we haven't created entries for all, 
        // but the create wizard logic supposedly created initial entries. 
        // Let's assume assessment.progress has the full list from getAssessmentById (which fetches all progress entries)
        // Wait, getAssessmentById does fetch all progress entries.
        // However, db.select().from(assessmentProgress) is also correct.

        const completedControls = allProgress.filter((p: typeof allProgress[number]) => p.status === 'completed').length;
        // const totalControls = allProgress.length; // This usually should match.
        // To be safe, rely on the count of controls assigned to the assessment which should be in assessmentProgress 
        // if initialized correctly.

        const progressPercentage = totalControls > 0 ? Math.round((completedControls / totalControls) * 100) : 0;

        // Get current assessment to check status
        const currentAssessment = await db
            .select()
            .from(assessments)
            .where(eq(assessments.id, assessmentId))
            .limit(1);

        let newStatus = currentAssessment[0]?.status || 'created';

        // If status is 'created' and we have progress, change to 'in_progress'
        if (newStatus === 'created' && validated.controls.some(c => c.status !== 'not_started')) {
            newStatus = 'in_progress';
            // Set started_date if not already set
            if (!currentAssessment[0]?.startedDate) {
                await db
                    .update(assessments)
                    .set({
                        startedDate: new Date(),
                    })
                    .where(eq(assessments.id, assessmentId));
            }
        }

        await db
            .update(assessments)
            .set({
                progress: progressPercentage,
                status: newStatus,
                updatedAt: new Date(),
            })
            .where(eq(assessments.id, assessmentId));

        return NextResponse.json({
            message: 'Domain controls saved successfully',
            saved: validated.controls.length,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.errors },
                { status: 400 }
            );
        }

        console.error('Error saving domain controls:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
