/**
 * Script para contar usuarios en la BD y listar emails.
 * Uso: npx ts-node -r tsconfig-paths/register src/scripts/count-users.ts
 */
import * as path from 'path';
import { config } from 'dotenv';
import { Client } from 'pg';

config({ path: path.join(__dirname, '../../.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USERNAME || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'admin';
const dbName = process.env.DB_DATABASE || 'vevil_db';

async function bootstrap() {
  const client = new Client({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: dbHost.includes('supabase.co') ? { rejectUnauthorized: false } : false,
  });

  await client.connect();

  const res = await client.query(
    'SELECT id, email, name, role FROM users ORDER BY email ASC'
  );
  const users = res.rows;
  const total = users.length;

  console.log('\n📊 Usuarios en la base de datos:\n');
  console.log(`   Total de cuentas: ${total}`);
  console.log('\n   Emails registrados:');
  users.forEach((u: { email: string; role: string }) => console.log(`   - ${u.email} (${u.role})`));

  const withoutAdmin = users.filter((u: { email: string }) => u.email.toLowerCase() !== 'admin@vevil.com');
  console.log(`\n   Cuentas además de admin@vevil.com: ${withoutAdmin.length}`);
  if (withoutAdmin.length > 0) {
    console.log('   Lista:');
    withoutAdmin.forEach((u: { email: string }) => console.log(`   - ${u.email}`));
  }
  console.log('');

  await client.end();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
