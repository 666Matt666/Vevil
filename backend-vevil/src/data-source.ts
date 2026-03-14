import { DataSource } from 'typeorm';
import { join } from 'path';

// Cargar .env desde la raíz del proyecto (al correr migraciones, __dirname = dist/src)
require('dotenv').config({ path: join(__dirname, '..', '..', '.env') });

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUsername = process.env.DB_USERNAME || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'admin';
const dbDatabase = process.env.DB_DATABASE || 'vevil_db';

export default new DataSource({
  type: 'postgres',
  host: dbHost,
  port: dbPort,
  username: dbUsername,
  password: dbPassword,
  database: dbDatabase,
  synchronize: false,
  logging: ['error', 'warn', 'migration'],
  entities: [
    join(__dirname, 'users', 'user.entity.js'),
    join(__dirname, 'products', 'product.entity.js'),
    join(__dirname, 'customers', 'customer.entity.js'),
    join(__dirname, 'invoices', 'invoice.entity.js'),
    join(__dirname, 'invoices', 'invoice-item.entity.js'),
    join(__dirname, 'invoices', 'payment.entity.js'),
  ],
  migrations: [join(__dirname, 'migrations', '*.js')],
  ssl: dbHost.includes('supabase.co')
    ? { rejectUnauthorized: false }
    : false,
});
