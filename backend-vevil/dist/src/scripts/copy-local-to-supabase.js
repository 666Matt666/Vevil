"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const path_1 = require("path");
const dotenv = __importStar(require("dotenv"));
dotenv.config({ path: (0, path_1.join)(__dirname, '..', '..', '.env') });
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
const TABLES_DELETE_ORDER = [
    { name: 'payment', columns: ['id', 'invoiceId', 'amount', 'date', 'method'] },
    { name: 'invoice_item', columns: ['id', 'quantity', 'priceAtSale', 'productId', 'invoiceId'] },
    { name: 'invoice', columns: ['id', 'customerId', 'date', 'total', 'currency', 'status'] },
    { name: 'customer', columns: ['id', 'name', 'email', 'phones', 'address_street', 'address_city', 'address_province', 'address_zip', 'google_maps_link', 'tax_id'], jsonbCols: ['phones'] },
    { name: 'product', columns: ['id', 'name', 'type', 'price', 'currency', 'stock', 'description'] },
    { name: 'user', columns: ['id', 'email', 'name', 'password', 'avatar', 'role', 'hashedRefreshToken', 'resetPasswordToken', 'resetPasswordExpires', 'createdAt', 'updatedAt'] },
];
const TABLES_INSERT_ORDER = [
    { name: 'user', columns: ['id', 'email', 'name', 'password', 'avatar', 'role', 'hashedRefreshToken', 'resetPasswordToken', 'resetPasswordExpires', 'createdAt', 'updatedAt'] },
    { name: 'customer', columns: ['id', 'name', 'email', 'phones', 'address_street', 'address_city', 'address_province', 'address_zip', 'google_maps_link', 'tax_id'], jsonbCols: ['phones'] },
    { name: 'product', columns: ['id', 'name', 'type', 'price', 'currency', 'stock', 'description'] },
    { name: 'invoice', columns: ['id', 'customerId', 'date', 'total', 'currency', 'status'] },
    { name: 'invoice_item', columns: ['id', 'quantity', 'priceAtSale', 'productId', 'invoiceId'] },
    { name: 'payment', columns: ['id', 'invoiceId', 'amount', 'date', 'method'] },
];
const TABLES = TABLES_DELETE_ORDER;
async function run() {
    if (!REMOTE.host || !REMOTE.password) {
        console.error('Falta configurar DB_HOST y DB_PASSWORD en .env (destino Supabase).');
        process.exit(1);
    }
    const localClient = new pg_1.Client({
        ...LOCAL,
        ssl: false,
    });
    console.log('Creating local client with:', { host: LOCAL.host, port: LOCAL.port, user: LOCAL.user, database: LOCAL.database });
    const remoteClient = new pg_1.Client(REMOTE);
    try {
        console.log('Attempting local connect...');
        await localClient.connect();
        console.log('Conectado a BD local:', LOCAL.host, LOCAL.database);
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
            const placeholderForCol = (col) => {
                const isJsonb = jsonbCols.includes(col);
                return isJsonb ? `$${paramIndex++}::jsonb` : `$${paramIndex++}`;
            };
            const placeholders = rows
                .map(() => `(${columns.map(placeholderForCol).join(', ')})`)
                .join(', ');
            const toVal = (r, col) => {
                const v = r[col] ?? null;
                if (v === null || v === undefined)
                    return null;
                if (jsonbCols.includes(col)) {
                    const parsed = typeof v === 'string' ? (() => { try {
                        return JSON.parse(v);
                    }
                    catch {
                        return [];
                    } })() : v;
                    return typeof parsed === 'object' && parsed !== null ? JSON.stringify(parsed) : '[]';
                }
                return v;
            };
            const values = rows.flatMap((r) => columns.map((col) => toVal(r, col)));
            if (rows.length > 0) {
                try {
                    await remoteClient.query(`DELETE FROM "${name}"`);
                    console.log(`  [${name}] ${rows.length} eliminada(s).`);
                }
                catch (e) {
                    console.log(`  [${name}] error al eliminar: ${e.message.split('\n')[0]}`);
                }
            }
        }
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
            const placeholderForCol = (col) => {
                const isJsonb = jsonbCols.includes(col);
                return isJsonb ? `$${paramIndex++}::jsonb` : `$${paramIndex++}`;
            };
            const placeholders = rows
                .map(() => `(${columns.map(placeholderForCol).join(', ')})`)
                .join(', ');
            const toVal = (r, col) => {
                const v = r[col] ?? null;
                if (v === null || v === undefined)
                    return null;
                if (jsonbCols.includes(col)) {
                    const parsed = typeof v === 'string' ? (() => { try {
                        return JSON.parse(v);
                    }
                    catch {
                        return [];
                    } })() : v;
                    return typeof parsed === 'object' && parsed !== null ? JSON.stringify(parsed) : '[]';
                }
                return v;
            };
            const values = rows.flatMap((r) => columns.map((col) => toVal(r, col)));
            try {
                await remoteClient.query(`INSERT INTO "${name}" (${quotedCols}) VALUES ${placeholders}`, values);
                console.log(`  [${name}] ${rows.length} fila(s) insertada(s).`);
            }
            catch (e) {
                console.log(`  [${name}] error: ${e.message.split('\n')[0]}`);
            }
        }
        const sequences = ['customer', 'product', 'invoice', 'invoice_item', 'payment'];
        for (const table of sequences) {
            await remoteClient.query(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM "${table}"), 0), 1))`);
        }
        console.log('Secuencias actualizadas.');
        console.log('\nListo: datos locales copiados a Supabase.');
    }
    catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
    finally {
        await localClient.end();
        await remoteClient.end();
    }
}
run();
//# sourceMappingURL=copy-local-to-supabase.js.map