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
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'postgres',
    ssl: { rejectUnauthorized: false },
};
const hashedPassword = '$2a$10$rkUJFW7GThcKEGt1N5fyIO4qd7kFCJSpmDuiqM.p4KDddXYPgmbdyW';
async function run() {
    const client = new pg_1.Client(REMOTE);
    await client.connect();
    await client.query('DELETE FROM "user"');
    console.log('Deleted old users');
    await client.query('INSERT INTO "user" (id, email, name, password, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7)', ['1ce22f13-ed8a-43d3-a946-47dd07213584', 'nachodibella@gmail.com', 'Nacho', hashedPassword, 'admin', new Date(), new Date()]);
    console.log('Created user nachodibella@gmail.com with password: admin123');
    await client.end();
}
run().catch(e => console.error(e));
//# sourceMappingURL=add-user.js.map