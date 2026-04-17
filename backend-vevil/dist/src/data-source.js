"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const path_1 = require("path");
require('dotenv').config({ path: (0, path_1.join)(__dirname, '..', '..', '.env') });
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUsername = process.env.DB_USERNAME || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'admin';
const dbDatabase = process.env.DB_DATABASE || 'vevil_db';
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: dbHost,
    port: dbPort,
    username: dbUsername,
    password: dbPassword,
    database: dbDatabase,
    synchronize: false,
    logging: ['error', 'warn', 'migration'],
    entities: [
        (0, path_1.join)(__dirname, 'users', 'user.entity.js'),
        (0, path_1.join)(__dirname, 'products', 'product.entity.js'),
        (0, path_1.join)(__dirname, 'customers', 'customer.entity.js'),
        (0, path_1.join)(__dirname, 'invoices', 'invoice.entity.js'),
        (0, path_1.join)(__dirname, 'invoices', 'invoice-item.entity.js'),
        (0, path_1.join)(__dirname, 'invoices', 'payment.entity.js'),
        (0, path_1.join)(__dirname, 'suppliers', 'supplier.entity.js'),
    ],
    migrations: [(0, path_1.join)(__dirname, 'migrations', '*.js')],
    ssl: dbHost.includes('supabase.co')
        ? { rejectUnauthorized: false }
        : false,
});
//# sourceMappingURL=data-source.js.map