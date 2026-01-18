import { getDb } from './server/db.ts';
import { decisionTrees } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const db = await getDb();
const result = await db.select().from(decisionTrees).where(eq(decisionTrees.id, 1));

console.log('Decision Tree ID 1:');
console.log('Name:', result[0]?.name);
console.log('DSL Content:');
console.log(result[0]?.dslContent);
console.log('\n---\n');

process.exit(0);
