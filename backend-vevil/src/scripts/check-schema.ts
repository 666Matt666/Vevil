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
  const r = await client.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'user\'');
  console.log('Supabase user columns:', r.rows.map(x => x.column_name).join(', '));
  
  const user = await client.query('SELECT * FROM "user" LIMIT 1');
  console.log('Sample row:', JSON.stringify(user.rows[0], null, 2));
  await client.end();
}

run().catch(e => console.error(e));