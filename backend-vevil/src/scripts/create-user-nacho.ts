/**
 * Script para dar de alta un usuario específico.
 * Uso: npx ts-node -r tsconfig-paths/register src/scripts/create-user-nacho.ts
 *
 * Usuario a crear:
 *   Email: nachodibella@gmail.com
 *   Password: admin123
 *   Role: admin
 */
import * as path from 'path';
import { config } from 'dotenv';
import { Client } from 'pg';
import * as bcrypt from 'bcryptjs';

config({ path: path.join(__dirname, '../../.env') });

const EMAIL = 'nachodibella@gmail.com';
const PASSWORD = 'admin123';
const NAME = 'Nacho';
const ROLE = 'admin';

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

  // Comprobar si ya existe
  const existing = await client.query(
    'SELECT id FROM "user" WHERE LOWER(TRIM(email)) = $1',
    [EMAIL.toLowerCase().trim()]
  );

  if (existing.rows.length > 0) {
    console.log(`\n⚠️  El usuario ${EMAIL} ya existe en la base de datos.\n`);
    await client.end();
    process.exit(0);
    return;
  }

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  // Insertar usuario
  await client.query(
    `INSERT INTO "user" (id, email, name, password, role, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`,
    [EMAIL, NAME, hashedPassword, ROLE]
  );

  console.log(`\n✅ Usuario creado exitosamente:`);
  console.log(`   Email: ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log(`   Role: ${ROLE}\n`);

  await client.end();
}

bootstrap().catch((err) => {
  console.error('❌ Error al crear usuario:', err);
  process.exit(1);
});
