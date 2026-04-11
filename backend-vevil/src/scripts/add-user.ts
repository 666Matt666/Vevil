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

// bcrypt hash for 'admin123'
const hashedPassword = '$2a$10$rkUJFW7GThcKEGt1N5fyIO4qd7kFCJSpmDuiqM.p4KDddXYPgmbdyW';

async function run() {
  const client = new Client(REMOTE);
  await client.connect();
  
  // Delete old admin user and create nacho
  await client.query('DELETE FROM "user"');
  console.log('Deleted old users');
  
  await client.query('INSERT INTO "user" (id, email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)',
    ['1ce22f13-ed8a-43d3-a946-47dd07213584', 'nachodibella@gmail.com', 'Nacho', hashedPassword, 'admin', new Date(), new Date()]);
  console.log('Created user nachodibella@gmail.com with password: admin123');
  
  await client.end();
}

run().catch(e => console.error(e));