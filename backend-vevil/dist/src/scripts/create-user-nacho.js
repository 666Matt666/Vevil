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
const bcrypt = __importStar(require("bcryptjs"));
(0, dotenv_1.config)({ path: path.join(__dirname, '../../.env') });
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
    const client = new pg_1.Client({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword,
        database: dbName,
        ssl: dbHost.includes('supabase.co') ? { rejectUnauthorized: false } : false,
    });
    await client.connect();
    const existing = await client.query('SELECT id FROM "user" WHERE LOWER(TRIM(email)) = $1', [EMAIL.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
        console.log(`\n⚠️  El usuario ${EMAIL} ya existe en la base de datos.\n`);
        await client.end();
        process.exit(0);
        return;
    }
    const hashedPassword = await bcrypt.hash(PASSWORD, 10);
    await client.query(`INSERT INTO "user" (id, email, name, password, role, "createdAt", "updatedAt")
     VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())`, [EMAIL, NAME, hashedPassword, ROLE]);
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
//# sourceMappingURL=create-user-nacho.js.map