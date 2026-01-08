import 'dotenv/config';
import { db } from './drizzle';
import { frameworks, domains, controls, userFrameworkAccess, userSettings } from './schema';
import { controls as oldControls, organisations, users } from './schema';
import { eq, and } from 'drizzle-orm';

// ISO 22301 Definitions
const isoDomains = [
    { code: '4', name: 'Context of the organization', description: 'Understanding the organization and its context.' },
    { code: '5', name: 'Leadership', description: 'Leadership and commitment, policy, roles, responsibilities and authorities.' },
    { code: '6', name: 'Planning', description: 'Actions to address risks and opportunities, BC objectives.' },
    { code: '7', name: 'Support', description: 'Resources, competence, awareness, communication, documented information.' },
    { code: '8', name: 'Operation', description: 'Operational planning, BIA, risk assessment, strategies, plans, exercises.' },
    { code: '9', name: 'Performance evaluation', description: 'Monitoring, measurement, analysis, evaluation, internal audit, management review.' },
    { code: '10', name: 'Improvement', description: 'Nonconformity and corrective action, continual improvement.' },
];

const isoControls = [
    {
        code: '4.1',
        name: 'Understanding the organization and its context',
        description: 'The organization shall determine external and internal issues that are relevant to its purpose and that affect its ability to achieve the intended outcomes of its BCMS.',
        domainCode: '4'
    },
    {
        code: '4.2',
        name: 'Understanding the needs and expectations of interested parties',
        description: 'The organization shall determine the interested parties that are relevant to the BCMS and their requirements.',
        domainCode: '4'
    },
    {
        code: '4.3',
        name: 'Determining the scope of the business continuity management system',
        description: 'The organization shall determine the boundaries and applicability of the BCMS to establish its scope.',
        domainCode: '4'
    },
    {
        code: '5.1',
        name: 'Leadership and commitment',
        description: 'Top management shall demonstrate leadership and commitment with respect to the BCMS.',
        domainCode: '5'
    },
    {
        code: '5.2',
        name: 'Policy',
        description: 'Top management shall establish a business continuity policy that is appropriate to the purpose of the organization.',
        domainCode: '5'
    },
    {
        code: '6.1',
        name: 'Actions to address risks and opportunities',
        description: 'When planning for the BCMS, the organization shall consider the issues referred to in 4.1 and the requirements referred to in 4.2 and determine the risks and opportunities that need to be addressed.',
        domainCode: '6'
    },
    {
        code: '6.2',
        name: 'Business continuity objectives and planning to achieve them',
        description: 'The organization shall establish business continuity objectives at relevant functions and levels.',
        domainCode: '6'
    },
    {
        code: '7.1',
        name: 'Resources',
        description: 'The organization shall determine and provide the resources needed for the establishment, implementation, maintenance and continual improvement of the BCMS.',
        domainCode: '7'
    },
    {
        code: '7.2',
        name: 'Competence',
        description: 'The organization shall ensure that persons doing work under its control are competent on the basis of appropriate education, training or experience.',
        domainCode: '7'
    },
    {
        code: '7.3',
        name: 'Awareness',
        description: 'Persons doing work under the organization’s control shall be aware of the business continuity policy and their contribution to the effectiveness of the BCMS.',
        domainCode: '7'
    },
    {
        code: '7.4',
        name: 'Communication',
        description: 'The organization shall determine the internal and external communications relevant to the BCMS.',
        domainCode: '7'
    },
    {
        code: '7.5',
        name: 'Documented information',
        description: 'The BCMS shall include documented information required by this International Standard and determined by the organization as necessary for effectiveness.',
        domainCode: '7'
    },
    {
        code: '8.1',
        name: 'Operational planning and control',
        description: 'The organization shall plan, implement and control the processes needed to meet requirements, and to implement the actions determined in 6.1.',
        domainCode: '8'
    },
    {
        code: '8.2',
        name: 'Business impact analysis and risk assessment',
        description: 'The organization shall verify and establish the context, define the criteria and evaluate the potential impact of a disruption.',
        domainCode: '8'
    },
    {
        code: '8.3',
        name: 'Business continuity strategies and solutions',
        description: 'The organization shall identify and select business continuity strategies based on the outputs of the business impact analysis and risk assessment.',
        domainCode: '8'
    },
    {
        code: '8.4',
        name: 'Business continuity plans and procedures',
        description: 'The organization shall establish, implement and maintain business continuity plans and procedures to manage a disruptive incident and continue its activities.',
        domainCode: '8'
    },
    {
        code: '8.5',
        name: 'Exercise programme',
        description: 'The organization shall implement and maintain a programme of exercises and testing to validate the effectiveness of its business continuity strategies and solutions.',
        domainCode: '8'
    },
    {
        code: '8.6',
        name: 'Evaluation of business continuity documentation and capabilities',
        description: 'The organization shall evaluate the suitability, adequacy and effectiveness of its business continuity documentation and capabilities.',
        domainCode: '8'
    },
    {
        code: '9.1',
        name: 'Monitoring, measurement, analysis and evaluation',
        description: 'The organization shall determine what needs to be monitored and measured, the methods for monitoring, measurement, analysis and evaluation.',
        domainCode: '9'
    },
    {
        code: '9.2',
        name: 'Internal audit',
        description: 'The organization shall conduct internal audits at planned intervals to provide information on whether the BCMS conforms to requirements.',
        domainCode: '9'
    },
    {
        code: '9.3',
        name: 'Management review',
        description: 'Top management shall review the organization’s BCMS at planned intervals to ensure its continuing suitability, adequacy and effectiveness.',
        domainCode: '9'
    },
    {
        code: '10.1',
        name: 'Nonconformity and corrective action',
        description: 'When nonconformity occurs, the organization shall react to the nonconformity and take action to control and correct it.',
        domainCode: '10'
    },
    {
        code: '10.2',
        name: 'Continual improvement',
        description: 'The organization shall continually improve the suitability, adequacy and effectiveness of the BCMS.',
        domainCode: '10'
    },
];

async function seed() {
    console.log('Seeding ISO 22301 framework...');

    // Get the first organisation and user
    const orgs = await db.select().from(organisations).limit(1);
    const usersList = await db.select().from(users).limit(1);

    if (orgs.length === 0 || usersList.length === 0) {
        console.error('No organisation or user found. Run db:seed first.');
        return;
    }
    const orgId = orgs[0].id;
    const userId = usersList[0].id;

    // 1. Ensure Framework exists
    let frameworkId: number;
    const existingFramework = await db.query.frameworks.findFirst({
        where: and(
            eq(frameworks.name, 'ISO 22301'),
            eq(frameworks.organisationId, orgId)
        )
    });

    if (existingFramework) {
        frameworkId = existingFramework.id;
        console.log('ISO 22301 framework already exists, updating...');
        // Optionally update description/version
    } else {
        const [newFramework] = await db.insert(frameworks).values({
            organisationId: orgId,
            name: 'ISO 22301',
            version: '2019',
            description: 'Security and resilience — Business continuity management systems — Requirements',
            type: 'standard'
        }).returning();
        frameworkId = newFramework.id;
        console.log('Created ISO 22301 framework');
    }

    // 2. Grant Access
    const existingAccess = await db.query.userFrameworkAccess.findFirst({
        where: and(
            eq(userFrameworkAccess.userId, userId),
            eq(userFrameworkAccess.frameworkId, frameworkId)
        )
    });

    if (!existingAccess) {
        await db.insert(userFrameworkAccess).values({
            userId: userId,
            frameworkId: frameworkId,
            isActive: true
        });
        console.log('Granted user access to framework');
    }

    // 3. Ensure Domains Exist
    const domainMap = new Map<string, number>(); // code -> id

    for (const d of isoDomains) {
        let domainId: number;
        const existingDomain = await db.query.domains.findFirst({
            where: and(
                eq(domains.name, d.name),
                eq(domains.frameworkId, frameworkId)
            )
        });

        if (existingDomain) {
            domainId = existingDomain.id;
        } else {
            const [newDomain] = await db.insert(domains).values({
                frameworkId: frameworkId,
                name: d.name,
                description: d.description,
                order: parseInt(d.code)
            }).returning();
            domainId = newDomain.id;
        }
        domainMap.set(d.code, domainId);
    }
    console.log('Domains seeded');

    // 4. Ensure Controls Exist
    for (const c of isoControls) {
        const domainId = domainMap.get(c.domainCode);

        // Find existing control
        const existingControl = await db.query.controls.findFirst({
            where: and(
                eq(controls.code, c.code),
                eq(controls.frameworkId, frameworkId)
            )
        });

        if (existingControl) {
            await db.update(controls)
                .set({
                    description: c.description,
                    name: c.name,
                    domainId: domainId
                })
                .where(eq(controls.id, existingControl.id));
        } else {
            await db.insert(controls).values({
                organisationId: orgId,
                frameworkId: frameworkId,
                code: c.code,
                name: c.name,
                description: c.description,
                domainId: domainId,
                status: 'active'
            });
        }
    }

    console.log('ISO 22301 controls seeded/updated.');

    // Ensure User Settings exist
    const settings = await db.query.userSettings.findFirst({
        where: eq(userSettings.userId, userId)
    });
    if (!settings) {
        await db.insert(userSettings).values({ userId: userId });
        console.log('User settings initialized');
    }

    process.exit(0);
}

seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
