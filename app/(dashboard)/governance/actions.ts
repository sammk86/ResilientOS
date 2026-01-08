'use server';

import { db } from '@/lib/db/drizzle';
import { policies, policyControls, policySections, policyReviews, users, organisationMembers } from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { generatePolicySectionContent, generatePolicyOutline } from '@/lib/ai/groq';
import { redirect } from 'next/navigation';

const createPolicySchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
});

export async function createPolicyAction(formData: FormData) {
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
        return { error: 'No organization found for user' };
    }

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    const validated = createPolicySchema.safeParse({ title, description });

    if (!validated.success) {
        return { error: 'Invalid input' };
    }

    const [newPolicy] = await db.insert(policies).values({
        organisationId: member.organisationId,
        authorId: userId,
        title: validated.data.title,
        description: validated.data.description,
        status: 'draft',
        version: '0.1',
        content: ''
    }).returning({ insertedId: policies.id });

    revalidatePath('/governance');
    return { success: true, policyId: newPolicy.insertedId };
}

export async function createPolicySectionAction(policyId: number, title: string) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    // Get current max order
    const existingSections = await db.query.policySections.findMany({
        where: eq(policySections.policyId, policyId),
        columns: { order: true }
    });
    const maxOrder = existingSections.reduce((max: number, s: { order: number }) => Math.max(max, s.order), -1);

    await db.insert(policySections).values({
        policyId,
        title,
        order: maxOrder + 1,
        content: ''
    });

    revalidatePath(`/governance/policies/${policyId}`);
    return { success: true };
}

export async function updatePolicySectionAction(sectionId: number, content: string) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    await db.update(policySections)
        .set({ content, updatedAt: new Date() })
        .where(eq(policySections.id, sectionId));

    const section = await db.query.policySections.findFirst({
        where: eq(policySections.id, sectionId),
        columns: { policyId: true }
    });

    if (section) {
        revalidatePath(`/governance/policies/${section.policyId}`);
    }

    return { success: true };
}

export async function generatePolicyOutlineAction(policyId: number) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    const policy = await db.query.policies.findFirst({
        where: eq(policies.id, policyId)
    });
    if (!policy) return { error: 'Policy not found' };

    const outlines = await generatePolicyOutline(policy.title, policy.description || '');

    // Get max order
    const existingSections = await db.query.policySections.findMany({
        where: eq(policySections.policyId, policyId),
        columns: { order: true }
    });
    let maxOrder = existingSections.reduce((max: number, s: { order: number }) => Math.max(max, s.order), -1);

    for (const title of outlines) {
        maxOrder++;
        await db.insert(policySections).values({
            policyId,
            title,
            order: maxOrder,
            content: ''
        });
    }

    revalidatePath(`/governance/policies/${policyId}`);
    return { success: true };
}

export async function generateSectionContentAction(sectionId: number, context?: string, currentContent?: string) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    const section = await db.query.policySections.findFirst({
        where: eq(policySections.id, sectionId),
        with: {
            policy: true
        }
    });

    if (!section) return { error: 'Section not found' };

    const content = await generatePolicySectionContent({
        title: section.policy.title,
        sectionTitle: section.title,
        description: section.policy.description || undefined,
        context,
        currentContent
    });

    await db.update(policySections)
        .set({ content, updatedAt: new Date() })
        .where(eq(policySections.id, sectionId));

    revalidatePath(`/governance/policies/${section.policyId}`);
    return { success: true, content };
}

export async function requestPolicyReviewAction(policyId: number, reviewerIds: number[]) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    // Update policy status
    await db.update(policies)
        .set({ status: 'review', updatedAt: new Date() })
        .where(eq(policies.id, policyId));

    // Create review entries
    for (const reviewerId of reviewerIds) {
        await db.insert(policyReviews).values({
            policyId,
            reviewerId,
            status: 'pending'
        });
    }

    revalidatePath(`/governance/policies/${policyId}`);
    return { success: true };
}

export async function submitPolicyReviewAction(policyId: number, status: 'approved' | 'rejected', comments?: string) {
    const session = await auth();
    if (!session?.user || !session.user.id) return { error: 'Unauthorized' };
    const userId = parseInt(session.user.id);

    // Find the review request
    const review = await db.query.policyReviews.findFirst({
        where: and(
            eq(policyReviews.policyId, policyId),
            eq(policyReviews.reviewerId, userId),
            eq(policyReviews.status, 'pending')
        )
    });

    if (!review) return { error: 'No pending review found' };

    await db.update(policyReviews)
        .set({ status, comments, respondedAt: new Date() })
        .where(eq(policyReviews.id, review.id));

    // Check if all reviews are approved -> update policy to approved
    if (status === 'approved') {
        const allReviews = await db.query.policyReviews.findMany({
            where: eq(policyReviews.policyId, policyId)
        });

        const allApproved = allReviews.every((r: { status: string }) => r.status === 'approved');
        if (allApproved) {
            await db.update(policies)
                .set({ status: 'approved', updatedAt: new Date() })
                .where(eq(policies.id, policyId));
        }
    } else {
        // If rejected, maybe move policy back to draft?
        await db.update(policies)
            .set({ status: 'draft', updatedAt: new Date() })
            .where(eq(policies.id, policyId));
    }

    revalidatePath(`/governance/policies/${policyId}`);
    return { success: true };
}

export async function mapPolicyToControlAction(policyId: number, controlId: number) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    const existing = await db.query.policyControls.findFirst({
        where: and(
            eq(policyControls.policyId, policyId),
            eq(policyControls.controlId, controlId)
        )
    });

    if (existing) return { success: true };

    await db.insert(policyControls).values({
        policyId,
        controlId
    });

    revalidatePath('/governance');
    return { success: true };
}

export async function unmapPolicyFromControlAction(policyId: number, controlId: number) {
    const session = await auth();
    if (!session?.user) return { error: 'Unauthorized' };

    await db.delete(policyControls)
        .where(and(
            eq(policyControls.policyId, policyId),
            eq(policyControls.controlId, controlId)
        ));

    revalidatePath('/governance');
    return { success: true };
}
