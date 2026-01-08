import { db } from './drizzle';
import { policies, risks, businessProcesses, runbooks, runbookSteps, organisations, controls } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
    console.log('Seeding Energy Sector Demo Data...');

    // Get Org
    const orgs = await db.select().from(organisations).limit(1);
    if (orgs.length === 0) {
        console.error('No organisation found.');
        return;
    }
    const orgId = orgs[0].id;

    // 1. Policies
    const demoPolicies = [
        { title: 'Critical Infrastructure Protection Policy', description: 'Mandates specific security controls for OT/ICS environments.', status: 'published' },
        { title: 'HSE & Environmental Safety Policy', description: 'Guidelines for hazardous material handling and field safety.', status: 'published' },
        { title: 'Supply Chain Continuity Standard', description: 'Requirements for fuel and parts suppliers.', status: 'draft' }
    ];

    for (const p of demoPolicies) {
        const existing = await db.query.policies.findFirst({
            where: (policies: any, { eq, and }: any) => and(eq(policies.title, p.title), eq(policies.organisationId, orgId))
        });
        if (!existing) {
            await db.insert(policies).values({
                organisationId: orgId,
                title: p.title,
                description: p.description,
                status: p.status,
                content: '# Policy Content\n\nThis is a demo policy.'
            });
        }
    }

    // 2. Risks (Financial, Operational, etc.)
    const demoRisks = [
        { description: 'Grid Cyber Attack (Ransomware on SCADA)', impact: 5, likelihood: 4, status: 'open' },
        { description: 'Extreme Weather (Hurricane/Flood) Impacting Grid', impact: 5, likelihood: 3, status: 'open' },
        { description: 'Regulatory Fine (NERC CIP Non-Compliance)', impact: 4, likelihood: 2, status: 'open' }, // Financial/Compliance
        { description: 'Supply Chain Disruption (Turbine Spare Parts)', impact: 3, likelihood: 4, status: 'mitigated' }
    ];

    for (const r of demoRisks) {
        // Simple check to avoid duplicates on multiple runs
        const existing = await db.query.risks.findFirst({
            where: (risks: any, { eq, and }: any) => and(eq(risks.description, r.description), eq(risks.organisationId, orgId))
        });
        if (!existing) {
            await db.insert(risks).values({
                organisationId: orgId,
                ...r
            });
        }
    }

    // 3. BIA Processes
    const demoProcesses = [
        { name: 'Power Generation Operations', rto: '15m', priority: 'Critical' },
        { name: 'Grid Distribution Control', rto: '5m', priority: 'Critical' },
        { name: 'Customer Billing & Metering', rto: '24h', priority: 'Medium' },
        { name: 'Emergency Dispatch Center', rto: '1m', priority: 'Critical' }
    ];

    for (const bp of demoProcesses) {
        const existing = await db.query.businessProcesses.findFirst({
            where: (proc: any, { eq, and }: any) => and(eq(proc.name, bp.name), eq(proc.organisationId, orgId))
        });
        if (!existing) {
            await db.insert(businessProcesses).values({
                organisationId: orgId,
                ...bp
            });
        }
    }

    // 4. Runbooks
    const demoRunbooks = [
        { title: 'Black Start Procedure (Grid Restoration)', type: 'Operational', status: 'published' },
        { title: 'Cyber Incident Response Plan (ICS/OT)', type: 'Cyber', status: 'published' },
        { title: 'Severe Weather Emergency Plan', type: 'Physical', status: 'draft' }
    ];

    for (const rb of demoRunbooks) {
        const existing = await db.query.runbooks.findFirst({
            where: (book: any, { eq, and }: any) => and(eq(book.title, rb.title), eq(book.organisationId, orgId))
        });
        if (!existing) {
            const [newRb] = await db.insert(runbooks).values({
                organisationId: orgId,
                ...rb
            }).returning();

            // Add steps for Black Start if it's that one
            if (rb.title.includes('Black Start')) {
                await db.insert(runbookSteps).values([
                    { runbookId: newRb.id, title: 'Isolate Grid Segments', order: 1, role: 'Grid Operator', estimatedTime: '10m' },
                    { runbookId: newRb.id, title: 'Start Diesel Generators', order: 2, role: 'Plant Manager', estimatedTime: '15m' },
                    { runbookId: newRb.id, title: 'Sync to Island Mode', order: 3, role: 'Systems Engineer', estimatedTime: '5m' }
                ]);
            }
        }
    }

    console.log('Energy Sector Demo Data Seeded.');
    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
