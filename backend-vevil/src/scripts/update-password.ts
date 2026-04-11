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

const hashedPassword = '$2b$10$kxnFD5UUo1aMiYWFnkeISO5X3vRcUF.RU7fjOvA7otEEQKGfy6pmS';

async function run() {
  const client = new Client(REMOTE);
  await client.connect();
  
  await client.query('UPDATE "user" SET password = $1 WHERE email = $2', [hashedPassword, 'nachodibella@gmail.com']);
  console.log('Updated password hash for nachodibella@gmail.com');
  console.log('Password: admin123');
  
  await client.end();
}

run().catch(e => console.error(e));