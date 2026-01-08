import 'dotenv/config';
import { db } from './drizzle';
import { riskCategories, organisations } from './schema';
import { eq, and } from 'drizzle-orm';

const categories = [
    { name: 'Strategic', description: 'Risks that affect the high-level goals and direction of the organization.', color: '#EF4444' }, // Red-ish
    { name: 'Operational', description: 'Risks arising from internal processes, people, and systems.', color: '#F97316' }, // Orange
    { name: 'Financial', description: 'Risks related to financial loss or instability.', color: '#EAB308' }, // Yellow
    { name: 'Compliance', description: 'Risks of legal or regulatory penalties.', color: '#3B82F6' }, // Blue
    { name: 'Reputational', description: 'Risks to the brand and public image.', color: '#8B5CF6' }, // Purple
    { name: 'Cybersecurity', description: 'Risks related to information security and cyber threats.', color: '#10B981' }, // Green
];

async function seedRisks() {
    console.log('Seeding Risk Categories...');

    // Get the first organisation
    const orgs = await db.select().from(organisations).limit(1);

    if (orgs.length === 0) {
        console.error('No organisation found. Run db:seed first.');
        process.exit(1);
    }
    const orgId = orgs[0].id;

    for (const cat of categories) {
        const existing = await db.query.riskCategories.findFirst({
            where: and(
                eq(riskCategories.name, cat.name),
                eq(riskCategories.organisationId, orgId)
            )
        });

        if (!existing) {
            await db.insert(riskCategories).values({
                organisationId: orgId,
                name: cat.name,
                description: cat.description,
                color: cat.color
            });
            console.log(`Created category: ${cat.name}`);
        } else {
            console.log(`Category exists: ${cat.name}`);
        }
    }

    console.log('Risk Categories seeded.');
    process.exit(0);
}

seedRisks().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
