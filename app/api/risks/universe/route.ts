import { auth } from '@/lib/auth';
import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { organisationMembers } from '@/lib/db/schema';
import { getRiskUniverse } from '@/lib/db/queries-grc';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const member = await db.query.organisationMembers.findFirst({
        where: eq(organisationMembers.userId, userId)
    });

    if (!member) {
        return new NextResponse("Organization not found", { status: 404 });
    }

    try {
        const universe = await getRiskUniverse(member.organisationId);
        return NextResponse.json({ riskUniverse: universe });
    } catch (error) {
        console.error("Error fetching risk universe:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
