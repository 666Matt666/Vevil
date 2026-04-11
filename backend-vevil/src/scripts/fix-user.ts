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

const hashedPassword = '$2a$10$rkUJFW7GThcKEGt1N5fyIO4qd7kFCJSpmDuiqM.p4KDddXYPgmbdyW';

async function run() {
  const client = new Client(REMOTE);
  await client.connect();
  
  await client.query('DELETE FROM "user"');
  await client.query('INSERT INTO "user" (id, email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
    ['1ce22f13-ed8a-43d3-a946-47dd07213584', 'nachodibella@gmail.com', 'Nacho', hashedPassword, 'admin', new Date(), new Date()]);
  
  console.log('Updated password for nachodibella@gmail.com');
  console.log('Password: admin123');
  
  await client.end();
}

run().catch(e => console.error(e));