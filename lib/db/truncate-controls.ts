import 'dotenv/config';
import { db } from './drizzle';
import { controls, policy_controls } from './schema';

import { sql } from 'drizzle-orm';

async function main() {
    console.log('Truncating controls table with CASCADE...');
    try {
        await db.execute(sql`DROP TABLE IF EXISTS policy_controls, controls, "__drizzle_migrations" CASCADE`);
        console.log('Successfully dropped tables and migration history.');
    } catch (e) {
        console.error('Error truncating:', e);
    }
    process.exit(0);
}

main();
