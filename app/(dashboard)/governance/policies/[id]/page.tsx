import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { policies, policySections, policyReviews, users } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { PolicyEditor } from '@/components/governance/policy-editor';

async function getPolicy(id: number) {
    const policy = await db.query.policies.findFirst({
        where: eq(policies.id, id),
        with: {
            sections: {
                orderBy: [policySections.order]
            },
            reviews: {
                with: {
                    reviewer: true
                }
            }
        }
    });
    return policy;
}

async function getUsers() {
    return await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
        // In real app, filter by organization
    });
}

export default async function PolicyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const policyId = parseInt(id);
    if (isNaN(policyId)) notFound();

    const policy = await getPolicy(policyId);
    const allUsers = await getUsers();

    if (!policy) notFound();

    // Filter possible reviewers (exclude author if needed, or just allow anyone in org)
    const reviewers = allUsers.map((u: any) => ({ id: u.id, name: u.name, email: u.email }));

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PolicyEditor policy={policy} potentialReviewers={reviewers} />
        </div>
    );
}
