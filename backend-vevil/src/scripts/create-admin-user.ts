/**
 * Script para dar de alta un usuario con perfil admin.
 * Uso: npx ts-node -r tsconfig-paths/register src/scripts/create-admin-user.ts
 *
 * Usuario creado:
 *   Email: veritovillalbavet@gmail.com
 *   Password: admin123
 *   Role: admin
 */
import * as path from 'path';
import { config } from 'dotenv';
import { Client } from 'pg';
import * as bcrypt from 'bcryptjs';

config({ path: path.join(__dirname, '../../.env') });

const EMAIL = 'veritovillalbavet@gmail.com';
const PASSWORD = 'admin123';
const NAME = 'Verito Villalba';
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

  const hashedPassword = await bcrypt.hash(PASSWORD, 10);

  await client.query(
    `INSERT INTO "user" (id, email, name, password, role, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4::"user_role_enum", NOW(), NOW())`,
    [EMAIL, NAME, hashedPassword, ROLE]
  );

  console.log('\n✅ Usuario admin creado correctamente:\n');
  console.log(`   Email:    ${EMAIL}`);
  console.log(`   Password: ${PASSWORD}`);
  console.log(`   Nombre:  ${NAME}`);
  console.log(`   Rol:     ${ROLE}\n`);

  await client.end();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
