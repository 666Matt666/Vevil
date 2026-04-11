import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const REMOTE = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'postgres',
  ssl: { rejectUnauthorized: false } as any,
};

async function run() {
  const client = new Client(REMOTE);
  await client.connect();
  const r = await client.query('SELECT email, name FROM "user"');
  console.log('Users in Supabase:');
  r.rows.forEach(u => console.log('  - ' + u.email + ' (' + u.name + ')'));
  await client.end();
}

run().catch(e => console.error(e));