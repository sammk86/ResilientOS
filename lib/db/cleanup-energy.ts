import { db } from './drizzle';
import { policies, risks, businessProcesses, runbooks, runbookSteps } from './schema';
import { eq, inArray, like } from 'drizzle-orm';

async function cleanup() {
    console.log('Cleaning up Energy Sector Demo Data...');

    // 1. Runbooks & Steps
    const demoRunbooks = await db.query.runbooks.findMany({
        where: inArray(runbooks.title, [
            'Black Start Procedure (Grid Restoration)',
            'Cyber Incident Response Plan (ICS/OT)',
            'Severe Weather Emergency Plan'
        ])
    });

    const rbIds = demoRunbooks.map((rb: any) => rb.id);
    if (rbIds.length > 0) {
        await db.delete(runbookSteps).where(inArray(runbookSteps.runbookId, rbIds));
        await db.delete(runbooks).where(inArray(runbooks.id, rbIds));
    }

    // 2. BIA Processes
    await db.delete(businessProcesses).where(inArray(businessProcesses.name, [
        'Power Generation Operations',
        'Grid Distribution Control',
        'Customer Billing & Metering',
        'Emergency Dispatch Center'
    ]));

    // 3. Risks
    await db.delete(risks).where(inArray(risks.description, [
        'Grid Cyber Attack (Ransomware on SCADA)',
        'Extreme Weather (Hurricane/Flood) Impacting Grid',
        'Regulatory Fine (NERC CIP Non-Compliance)',
        'Supply Chain Disruption (Turbine Spare Parts)'
    ]));

    // 4. Policies
    await db.delete(policies).where(inArray(policies.title, [
        'Critical Infrastructure Protection Policy',
        'HSE & Environmental Safety Policy',
        'Supply Chain Continuity Standard'
    ]));

    console.log('Energy Sector Demo Data Removed.');
    process.exit(0);
}

cleanup().catch((err) => {
    console.error('Cleanup failed:', err);
    process.exit(1);
});
