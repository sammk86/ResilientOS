import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { frameworks, userFrameworkAccess } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { auth } from '@/lib/auth'; // Adjust auth import based on project
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get frameworks enabled for user
        const access = await db.query.userFrameworkAccess.findMany({
            where: eq(userFrameworkAccess.userId, user.id),
            with: {
                framework: true
            }
        });


        const userFrameworks = access.map((a: any) => ({
            framework_id: a.framework.id,
            framework_name: a.framework.name, // Mapping 'name' to 'framework_name'
            framework_type: a.framework.type, // Mapping 'type' to 'framework_type'
            description: a.framework.description,
            // Add other fields if needed by `Framework` interface in frontend
            controls_count: 0 // Placeholder or needs a join/aggregation if strictly required by UI
        }));

        // Also get any frameworks owned by the organisation directly if not covered (or maybe just rely on access)
        // For now, return what they have access to.

        return NextResponse.json({ frameworks: userFrameworks });
    } catch (error) {
        console.error('Error fetching frameworks:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
