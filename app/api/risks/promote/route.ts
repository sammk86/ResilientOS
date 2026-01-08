import { NextRequest, NextResponse } from 'next/server';
import { getUser, getOrganisationForUser } from '@/lib/db/queries';
import { getAssessmentById } from '@/lib/db/queries-grc';
import { riskUniverse, controls } from '@/lib/db/schema';
import { db } from '@/lib/db/drizzle';

export async function POST(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const organisation = await getOrganisationForUser();
        if (!organisation) {
            return NextResponse.json({ error: 'Organization not found' }, { status: 400 });
        }

        const body = await request.json();
        const { assessmentId, risk } = body;

        if (!assessmentId || !risk) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // specific check for duplicate promotion? 
        // Maybe we just allow it and let them manage it?
        // Or check if same (assessmentId, controlId) already exists in universe?
        // For now, let's just insert.

        const assessment = await getAssessmentById(assessmentId, user.id);
        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        // Insert into Risk Universe
        const result = await db.insert(riskUniverse).values({
            organisationId: organisation.id,
            assessmentId: assessment.id,
            frameworkId: assessment.frameworkId!, // Assuming valid assessment has framework
            frameworkName: assessment.framework?.name || 'Unknown Framework',
            assessmentName: assessment.assessmentName,
            controlId: risk.control_id,
            controlCode: risk.control_code || "N/A", // Risk object might not have code directly if it came from AI result, need to verify
            controlName: risk.control_name,
            domainId: risk.domain_id,
            riskDescription: risk.description,
            riskType: 'compliance_gap', // Default type
            status: 'identified',
            publishedByUserId: user.id,
        }).returning();

        return NextResponse.json({ message: 'Risk promoted successfully', riskUniverseId: result[0].id });

    } catch (error) {
        console.error('Error promoting risk:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
