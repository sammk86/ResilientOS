import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getFrameworkById } from '@/lib/db/queries-grc';
import type { FrameworkDetail } from '@/types/framework';

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

        // Transform to FrameworkDetail type
        const frameworkDetail: FrameworkDetail = {
            framework_id: framework.id,
            framework_name: framework.name, // Corrected from frameworkName to name
            framework_type: (framework as any).type || (framework as any).frameworkType || 'standard',
            description: framework.description || '',
            logo: (framework as any).logoUrl || undefined,
            status: 'active', //(framework.status as 'active' | 'inactive') || 'active',
            version: framework.version || undefined,
            last_updated: framework.updatedAt?.toISOString() || framework.createdAt?.toISOString() || '',
            controls: framework.controls?.map((control: any) => ({
                control_id: control.id,
                control_code: control.controlCode || control.code,
                control_name: control.controlName || control.name,
                category: control.category || '',
                description: control.description || undefined,
                status: control.status || 'active',
                framework_id: framework.id,
                domain_id: control.domainId || undefined,
                domain_name: control.domain?.name || undefined,
            })) || [],
        };

        // Add domain names to controls and include domains in response
        if (framework.domains) {
            const domainMap = new Map<number, string>(framework.domains.map((d: any) => [d.id, d.name]));

            // Update controls with domain info from Map if not already present
            frameworkDetail.controls = frameworkDetail.controls.map((control: any) => ({
                ...control,
                domain_name: control.domain_name || (control.domain_id ? domainMap.get(control.domain_id) : undefined),
            }));

            // Add domains array to frameworkDetail
            (frameworkDetail as any).domains = framework.domains.map((domain: any) => ({
                id: domain.id,
                domain_name: domain.name,
                domain_code: domain.code || (domain as any).domainCode,
                description: domain.description,
                order: domain.order,
            }));
        }

        return NextResponse.json(frameworkDetail);
    } catch (error) {
        console.error('Error fetching framework:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
