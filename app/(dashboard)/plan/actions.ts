'use server';

import { db } from '@/lib/db/drizzle';
import { runbooks, runbookSteps, businessProcesses, organisationMembers } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createRunbookSchema = z.object({
    title: z.string().min(3),
    type: z.string().optional(),
    processId: z.coerce.number().optional(), // Coerce from string form data
});

export async function getProcessesAction() {
    const session = await auth();
    if (!session?.user) return [];

    // Simple fetch for dropdown
    const processes = await db.select({
        id: businessProcesses.id,
        name: businessProcesses.name
    }).from(businessProcesses);

    return processes;
}

export async function createRunbookAction(formData: FormData) {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return { error: 'Unauthorized' };

    const userId = parseInt(user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No organization found' };

    const validated = createRunbookSchema.safeParse({
        title: formData.get('title'),
        type: formData.get('type'),
        processId: formData.get('processId'),
    });

    if (!validated.success) return { error: 'Invalid input' };

    await db.insert(runbooks).values({
        organisationId: member.organisationId,
        title: validated.data.title,
        status: 'draft',
        version: '0.1',
        processId: validated.data.processId,
        type: validated.data.type,
    });

    revalidatePath('/plan');
    revalidatePath('/dashboard');
    return { success: true };
}

export async function addRunbookStep(runbookId: string | number, data: { title: string; description: string; estimatedTime: string }) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const rId = typeof runbookId === 'string' ? parseInt(runbookId) : runbookId;

    const [step] = await db.insert(runbookSteps).values({
        runbookId: rId,
        title: data.title,
        description: data.description || '',
        status: 'pending',
        estimatedTime: data.estimatedTime || '15m',
        order: 0, // Simplified ordering for now
    }).returning();

    revalidatePath('/plan');
    return step;
}

export async function deleteRunbookStep(stepId: string | number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const sId = typeof stepId === 'string' ? parseInt(stepId) : stepId;

    await db.delete(runbookSteps).where(eq(runbookSteps.id, sId));
    revalidatePath('/plan');
}
