'use server';

import { db } from '@/lib/db/drizzle';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { quickAddRisk, getRiskCategories, updateRiskInRegister, deleteRiskFromRegister, getAssets, getBusinessProcesses, addRiskToRegister } from '@/lib/db/queries-grc';
import { organisationMembers, riskUniverse } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const createRiskSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    likelihood: z.coerce.number().min(1).max(5),
    impact: z.coerce.number().min(1).max(5),
    categoryId: z.coerce.number().optional(),
    strategy: z.string().optional(),
    status: z.string().optional(),
    scope: z.string().optional(),
    assetId: z.coerce.number().optional(),
    processId: z.coerce.number().optional(),
});

export async function createRiskAction(formData: FormData) {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) {
        return { error: 'Unauthorized' };
    }
    const userId = parseInt(user.id);

    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) {
        return { error: 'No organization found' };
    }

    const validated = createRiskSchema.safeParse({
        title: formData.get('title'),
        description: formData.get('description'),
        likelihood: formData.get('likelihood'),
        impact: formData.get('impact'),
        categoryId: formData.get('categoryId'),
        strategy: formData.get('strategy'),
        status: formData.get('status'),
        scope: formData.get('scope'),
        assetId: formData.get('assetId') ? Number(formData.get('assetId')) || undefined : undefined,
        processId: formData.get('processId') ? Number(formData.get('processId')) || undefined : undefined,
    });

    if (!validated.success) {
        return { error: 'Invalid input' };
    }

    try {
        await quickAddRisk({
            organisationId: member.organisationId,
            userId: userId,
            title: validated.data.title,
            description: validated.data.description,
            likelihood: validated.data.likelihood,
            impact: validated.data.impact,
            categoryId: validated.data.categoryId,
            strategy: validated.data.strategy,
            status: validated.data.status,
            ownerUserId: userId, // Default to creator as owner for now
            scope: validated.data.scope,
            assetId: validated.data.assetId,
            processId: validated.data.processId,
        });

        revalidatePath('/risk');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to create risk:', error);
        return { error: 'Failed to create risk: ' + error };
    }
}

export async function getCategoriesAction() {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return [];
    const userId = parseInt(user.id);

    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return [];

    return await getRiskCategories(member.organisationId);
}

export async function getAssetsAction() {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return [];
    const userId = parseInt(user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });
    if (!member) return [];
    return await getAssets(member.organisationId);
}

export async function getProcessesAction() {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return [];
    const userId = parseInt(user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });
    if (!member) return [];
    return await getBusinessProcesses(member.organisationId);
}

export async function updateRiskAction(riskId: number, formData: FormData) {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return { error: 'Unauthorized' };
    const userId = parseInt(user.id);

    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No organization found' };

    // We reuse create schema but make everything optional basically, or separate schema.
    // For simplicity, parsing fields manually.
    const title = formData.get('title') as string | undefined;
    const description = formData.get('description') as string | undefined;
    const likelihood = formData.get('likelihood') ? Number(formData.get('likelihood')) : undefined;
    const impact = formData.get('impact') ? Number(formData.get('impact')) : undefined;
    const categoryId = formData.get('categoryId') ? Number(formData.get('categoryId')) : undefined;
    const strategy = formData.get('strategy') as string | undefined;
    const status = formData.get('status') as string | undefined;
    const scope = formData.get('scope') as string | undefined;
    const assetId = formData.get('assetId') ? Number(formData.get('assetId')) || undefined : undefined;
    const processId = formData.get('processId') ? Number(formData.get('processId')) || undefined : undefined;

    try {
        await updateRiskInRegister(riskId, {
            title,
            description,
            likelihood,
            impact,
            categoryId,
            strategy,
            status,
            ownerUserId: userId,
            scope,
            assetId,
            processId,
        });

        revalidatePath('/risk');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to update risk:', error);
        return { error: 'Failed to update risk' };
    }
}

export async function deleteRiskAction(riskId: number) {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return { error: 'Unauthorized' };
    const userId = parseInt(user.id);

    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No organization found' };

    try {
        await deleteRiskFromRegister(riskId, member.organisationId);
        revalidatePath('/risk');
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Failed to delete risk:', error);
        return { error: 'Failed to delete risk' };
    }
}

export async function addFromUniverseAction(universeId: number) {
    const session = await auth();
    const user = session?.user;
    if (!user || !user.id) return { error: 'Unauthorized' };
    const userId = parseInt(user.id);

    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) return { error: 'No organization found' };

    try {
        const universeItem = await db.query.riskUniverse.findFirst({
            where: eq(riskUniverse.id, universeId)
        });

        if (!universeItem) return { error: 'Risk not found in universe' };

        await addRiskToRegister({
            riskUniverseId: universeId,
            organisationId: member.organisationId,
            userId: userId,
            title: universeItem.riskDescription,
            status: 'open',
            scope: 'system',
            strategy: 'mitigate',
            ownerUserId: userId
        });

        revalidatePath('/risk');
        return { success: true };
    } catch (error) {
        console.error('Failed to add from universe:', error);
        return { error: 'Failed to add risk' };
    }
}
