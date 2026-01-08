import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getFrameworkById } from '@/lib/db/queries-grc';

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
        const frameworkId = parseInt(id, 10);

        if (isNaN(frameworkId)) {
            return NextResponse.json({ error: 'Invalid framework ID' }, { status: 400 });
        }

        const framework = await getFrameworkById(frameworkId, user.id);

        if (!framework) {
            return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
        }

        if (!framework.domains) {
            return NextResponse.json({ domains: [] });
        }

        // Map domains to response format
        const domainsList = framework.domains.map((domain: any) => ({
            domain_id: domain.id,
            domain_name: domain.name,
            domain_code: domain.code || (domain as any).domainCode,
            control_count: framework.controls.filter((c: any) => c.domainId === domain.id).length
        }));

        return NextResponse.json({ domains: domainsList });

    } catch (error) {
        console.error('Error fetching framework domains:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
