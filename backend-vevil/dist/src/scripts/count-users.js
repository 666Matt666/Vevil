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
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const pg_1 = require("pg");
(0, dotenv_1.config)({ path: path.join(__dirname, '../../.env') });
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USERNAME || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'admin';
const dbName = process.env.DB_DATABASE || 'vevil_db';
async function bootstrap() {
    const client = new pg_1.Client({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        ssl: dbHost.includes('supabase.co') ? { rejectUnauthorized: false } : false,
    });
    await client.connect();
    const res = await client.query('SELECT id, email, name, role FROM users ORDER BY email ASC');
    const users = res.rows;
    const total = users.length;
    console.log('\n📊 Usuarios en la base de datos:\n');
    console.log(`   Total de cuentas: ${total}`);
    console.log('\n   Emails registrados:');
    users.forEach((u) => console.log(`   - ${u.email} (${u.role})`));
    const withoutAdmin = users.filter((u) => u.email.toLowerCase() !== 'admin@vevil.com');
    console.log(`\n   Cuentas además de admin@vevil.com: ${withoutAdmin.length}`);
    if (withoutAdmin.length > 0) {
        console.log('   Lista:');
        withoutAdmin.forEach((u) => console.log(`   - ${u.email}`));
    }
    console.log('');
    await client.end();
    process.exit(0);
}
bootstrap().catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
});
//# sourceMappingURL=count-users.js.map