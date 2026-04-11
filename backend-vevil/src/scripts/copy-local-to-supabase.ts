/**
 * Copia los datos de la base PostgreSQL local (Docker: vevil_db) a la BD en Supabase.
 *
 * Requisitos:
 * - Base local corriendo (docker-compose up -d postgres o el contenedor vevil_postgres_db).
 * - .env del backend con DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE apuntando a Supabase.
 *
 * Uso: npm run db:copy-local-to-supabase
 */

import { Client } from 'pg';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Cargar .env desde la raíz del backend
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const LOCAL = {
  host: process.env.DB_LOCAL_HOST || 'localhost',
  port: parseInt(process.env.DB_LOCAL_PORT || '5432', 10),
  user: process.env.DB_LOCAL_USERNAME || 'postgres',
  password: process.env.DB_LOCAL_PASSWORD || 'admin',
  database: process.env.DB_LOCAL_DATABASE || 'vevil_db',
};

const REMOTE = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'postgres',
  ssl: process.env.DB_HOST?.includes('supabase.co') ? { rejectUnauthorized: false } : false,
};

// Columnas para SELECT/INSERT. "jsonbCols" son enviadas como string JSON y casteadas a ::jsonb en el INSERT.
// ORDEN para BORRAR: child tables primero (para evitar foreign key constraints)
// stock_movement se maneja manualmente por diferencias de esquema
const TABLES_DELETE_ORDER: { name: string; columns: string[]; jsonbCols?: string[] }[] = [
  { name: 'payment', columns: ['id', 'invoiceId', 'amount', 'date', 'method'] },
  { name: 'invoice_item', columns: ['id', 'quantity', 'priceAtSale', 'productId', 'invoiceId'] },
  { name: 'invoice', columns: ['id', 'customerId', 'date', 'total', 'currency', 'status'] },
  { name: 'customer', columns: ['id', 'name', 'email', 'phones', 'address_street', 'address_city', 'address_province', 'address_zip', 'google_maps_link', 'tax_id'], jsonbCols: ['phones'] },
  { name: 'product', columns: ['id', 'name', 'type', 'price', 'currency', 'stock', 'description'] },
  { name: 'user', columns: ['id', 'email', 'name', 'password', 'avatar', 'role', 'hashedRefreshToken', 'resetPasswordToken', 'resetPasswordExpires', 'createdAt', 'updatedAt'] },
];

// ORDEN para INSERTAR: parent tables primero (para evitar foreign key constraints)
const TABLES_INSERT_ORDER: { name: string; columns: string[]; jsonbCols?: string[] }[] = [
  { name: 'user', columns: ['id', 'email', 'name', 'password', 'avatar', 'role', 'hashedRefreshToken', 'resetPasswordToken', 'resetPasswordExpires', 'createdAt', 'updatedAt'] },
  { name: 'customer', columns: ['id', 'name', 'email', 'phones', 'address_street', 'address_city', 'address_province', 'address_zip', 'google_maps_link', 'tax_id'], jsonbCols: ['phones'] },
  { name: 'product', columns: ['id', 'name', 'type', 'price', 'currency', 'stock', 'description'] },
  { name: 'invoice', columns: ['id', 'customerId', 'date', 'total', 'currency', 'status'] },
  { name: 'invoice_item', columns: ['id', 'quantity', 'priceAtSale', 'productId', 'invoiceId'] },
  { name: 'payment', columns: ['id', 'invoiceId', 'amount', 'date', 'method'] },
];

const TABLES = TABLES_DELETE_ORDER;

async function run(): Promise<void> {
  if (!REMOTE.host || !REMOTE.password) {
    console.error('Falta configurar DB_HOST y DB_PASSWORD en .env (destino Supabase).');
    process.exit(1);
  }

  const localClient = new Client({
    ...LOCAL,
    ssl: false,
  });
  console.log('Creating local client with:', { host: LOCAL.host, port: LOCAL.port, user: LOCAL.user, database: LOCAL.database });
  
  const remoteClient = new Client(REMOTE);

  try {
    console.log('Attempting local connect...');
    await localClient.connect();
    console.log('Conectado a BD local:', LOCAL.host, LOCAL.database);
    
    // Test query
    const testRes = await localClient.query('SELECT 1 as test');
    console.log('Local query test:', testRes.rows);

    console.log('Attempting remote connect...');
    await remoteClient.connect();
    console.log('Conectado a BD remota (Supabase):', REMOTE.host);

    for (const { name, columns, jsonbCols = [] } of TABLES) {
      const quotedCols = columns.map((c) => `"${c}"`).join(', ');
      const res = await localClient.query(`SELECT ${quotedCols} FROM "${name}"`);
      const rows = res.rows;
      if (rows.length === 0) {
        console.log(`  [${name}] 0 filas, omitido.`);
        continue;
      }

      const nCols = columns.length;
      let paramIndex = 1;
      const placeholderForCol = (col: string) => {
        const isJsonb = jsonbCols.includes(col);
        return isJsonb ? `$${paramIndex++}::jsonb` : `$${paramIndex++}`;
      };
      const placeholders = rows
        .map(() => `(${columns.map(placeholderForCol).join(', ')})`)
        .join(', ');
      const toVal = (r: Record<string, unknown>, col: string): unknown => {
        const v = r[col] ?? null;
        if (v === null || v === undefined) return null;
        if (jsonbCols.includes(col)) {
          const parsed = typeof v === 'string' ? (() => { try { return JSON.parse(v); } catch { return []; } })() : v;
          return typeof parsed === 'object' && parsed !== null ? JSON.stringify(parsed) : '[]';
        }
        return v;
      };
      const values = rows.flatMap((r) => columns.map((col) => toVal(r, col)));

      // Eliminar datos existentes en Supabase primero
      if (rows.length > 0) {
        try {
          await remoteClient.query(`DELETE FROM "${name}"`);
          console.log(`  [${name}] ${rows.length} eliminada(s).`);
        } catch (e: any) {
          console.log(`  [${name}] error al eliminar: ${e.message.split('\n')[0]}`);
        }
      }
    }

    // Segundo paso: insertar datos (en orden padre→hijo)
    for (const { name, columns, jsonbCols = [] } of TABLES_INSERT_ORDER) {
      const quotedCols = columns.map((c) => `"${c}"`).join(', ');
      const res = await localClient.query(`SELECT ${quotedCols} FROM "${name}"`);
      const rows = res.rows;
      if (rows.length === 0) {
        console.log(`  [${name}] 0 filas, omitido.`);
        continue;
      }

      const nCols = columns.length;
      let paramIndex = 1;
      const placeholderForCol = (col: string) => {
        const isJsonb = jsonbCols.includes(col);
        return isJsonb ? `$${paramIndex++}::jsonb` : `$${paramIndex++}`;
      };
      const placeholders = rows
        .map(() => `(${columns.map(placeholderForCol).join(', ')})`)
        .join(', ');
      const toVal = (r: Record<string, unknown>, col: string): unknown => {
        const v = r[col] ?? null;
        if (v === null || v === undefined) return null;
        if (jsonbCols.includes(col)) {
          const parsed = typeof v === 'string' ? (() => { try { return JSON.parse(v); } catch { return []; } })() : v;
          return typeof parsed === 'object' && parsed !== null ? JSON.stringify(parsed) : '[]';
        }
        return v;
      };
      const values = rows.flatMap((r) => columns.map((col) => toVal(r, col)));

      try {
        await remoteClient.query(
          `INSERT INTO "${name}" (${quotedCols}) VALUES ${placeholders}`,
          values,
        );
        console.log(`  [${name}] ${rows.length} fila(s) insertada(s).`);
      } catch (e: any) {
        console.log(`  [${name}] error: ${e.message.split('\n')[0]}`);
      }
    }

    // Ajustar secuencias para que los próximos INSERT obtengan IDs correctos
    const sequences = ['customer', 'product', 'invoice', 'invoice_item', 'payment'];
    for (const table of sequences) {
      await remoteClient.query(
        `SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM "${table}"), 0), 1))`,
      );
    }
    console.log('Secuencias actualizadas.');

    console.log('\nListo: datos locales copiados a Supabase.');
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  } finally {
    await localClient.end();
    await remoteClient.end();
  }
}

run();
