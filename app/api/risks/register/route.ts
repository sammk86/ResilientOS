import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getOrganisationForUser } from '@/lib/db/queries'; // Adjust import if getOrganisationForUser is elsewhere
import { getRiskRegister, addRiskToRegister, getRiskCategories } from '@/lib/db/queries-grc';

// Helper to handle API errors
const handleApiError = (error: unknown) => {
    console.error('API Error:', error);
    return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Internal server error' },
        { status: 500 }
    );
};

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Assuming getOrganisationForUser returns the org for the user
        // We might need to fetch org ID if multiple supported
        const organisation = await getOrganisationForUser();
        if (!organisation) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
        }

        const searchParams = request.nextUrl.searchParams;
        const filters = {
            status: searchParams.get('status') || undefined,
            severity: searchParams.get('severity') as 'low' | 'medium' | 'high' | undefined,
            categoryId: searchParams.get('category_id') ? parseInt(searchParams.get('category_id')!, 10) : undefined,
            ownerUserId: searchParams.get('owner_user_id') ? parseInt(searchParams.get('owner_user_id')!, 10) : undefined,
        };

        const registerEntries = await getRiskRegister(organisation.id, filters);

        return NextResponse.json({ riskRegister: registerEntries });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organisation = await getOrganisationForUser();
        if (!organisation) {
            // Fallback: fetch org from query/db if not in session helper?
            // Assuming single org for now as per schema
            return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
        }

        const body = await request.json();
        const {
            risk_universe_id,
            title,
            type,
            description,
            severity,
            likelihood,
            impact,
            category_id,
            owner_user_id,
            review_frequency,
            qualification_notes,
        } = body;

        // We allow custom Risks (Universe ID might be null? Schema says not null. 
        // If creating custom risk, we might need a "Custom Risk" entry in Universe or create one on fly.
        // However, user said "Heatmap will only use risk register item", implying we create register items...
        // But schema says RiskRegister references RiskUniverse.
        // So for a purely custom risk, we probably need a "Custom" Framework/Universe entry.
        // For now, assume we are adding from Universe or providing a universe ID.

        if (!risk_universe_id) {
            // If we want to support ad-hoc risks not in universe, we'd need to adjust schema or logic.
            // Returning error for now to enforce structure as requested.
            return NextResponse.json({ error: 'risk_universe_id is required' }, { status: 400 });
        }

        const registerId = await addRiskToRegister({
            riskUniverseId: risk_universe_id,
            organisationId: organisation.id,
            userId: user.id,
            title,
            type,
            description,
            severity,
            likelihood,
            impact,
            categoryId: category_id,
            ownerUserId: owner_user_id,
            reviewFrequency: review_frequency,
            qualificationNotes: qualification_notes,
        });

        return NextResponse.json({
            success: true,
            id: registerId,
            message: 'Risk added to register successfully',
        });
    } catch (error) {
        return handleApiError(error);
    }
}
