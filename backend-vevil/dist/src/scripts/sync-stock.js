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
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const REMOTE = {
    host: process.env.DB_HOST || 'aws-1-us-east-2.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'postgres.tplcbrhlubahvuknwyjw',
    password: process.env.DB_PASSWORD || '46613634Mathias',
    database: process.env.DB_DATABASE || 'postgres',
    ssl: { rejectUnauthorized: false },
};
const rows = [
    { id: 1, productId: 1, type: 'out', quantity: 1, reason: 'sale', note: null, invoiceId: 9, createdAt: '2026-04-05T21:29:40.616Z', updatedAt: '2026-04-05T21:29:40.616Z', created_at: '2026-04-05T21:29:40.616Z' },
    { id: 2, productId: 6, type: 'out', quantity: 1, reason: 'sale', note: null, invoiceId: 10, createdAt: '2026-04-05T21:29:40.616Z', updatedAt: '2026-04-05T21:29:40.616Z', created_at: '2026-04-05T21:29:40.616Z' },
    { id: 3, productId: 1, type: 'out', quantity: 1, reason: 'sale', note: null, invoiceId: 11, createdAt: '2026-04-05T21:29:40.616Z', updatedAt: '2026-04-05T21:29:40.616Z', created_at: '2026-04-05T21:29:40.616Z' },
    { id: 4, productId: 1, type: 'out', quantity: 1, reason: 'sale', note: null, invoiceId: 12, createdAt: '2026-04-05T21:29:40.616Z', updatedAt: '2026-04-05T21:29:40.616Z', created_at: '2026-04-05T21:29:40.616Z' },
    { id: 5, productId: 1, type: 'out', quantity: 10, reason: 'sale', note: null, invoiceId: 13, createdAt: '2026-04-05T21:29:40.616Z', updatedAt: '2026-04-05T21:29:40.616Z', created_at: '2026-04-05T21:29:40.616Z' },
];
async function run() {
    const client = new pg_1.Client(REMOTE);
    await client.connect();
    await client.query('DELETE FROM stock_movement');
    console.log('Cleared stock_movement');
    for (const r of rows) {
        await client.query('INSERT INTO "stock_movement" (id, "productId", type, quantity, reason, note, "invoiceId", "createdAt", created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [r.id, r.productId, r.type, r.quantity, r.reason, r.note, r.invoiceId, r.createdAt, r.created_at, r.updatedAt]);
        console.log(`Inserted row ${r.id}`);
    }
    console.log(`Done: ${rows.length} rows inserted`);
    await client.end();
}
run().catch(e => { console.error(e); process.exit(1); });
//# sourceMappingURL=sync-stock.js.map