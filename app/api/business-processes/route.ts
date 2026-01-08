import { NextRequest, NextResponse } from 'next/server';
import { getUser, getUserWithOrganisation } from '@/lib/db/queries';
import { getBusinessProcesses } from '@/lib/db/queries-grc';

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userWithOrg = await getUserWithOrganisation(user.id);
        if (!userWithOrg?.organisationId) {
            return NextResponse.json({ processes: [] });
        }

        const processes = await getBusinessProcesses(userWithOrg.organisationId);
        return NextResponse.json({ processes });
    } catch (error) {
        console.error('Error fetching processes:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
