import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Habilita Row Level Security (RLS) en todas las tablas.
 * Así Supabase Security Advisor deja de marcar "RLS Disabled in Public".
 * Sin políticas, el acceso vía PostgREST (anon key) no devuelve filas.
 * El backend NestJS se conecta con el usuario postgres y bypasea RLS.
 */
export class EnableRLS1731600000001 implements MigrationInterface {
  name = 'EnableRLS1731600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['user', 'customer', 'product', 'invoice', 'invoice_item', 'payment'];
    for (const table of tables) {
      await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['user', 'customer', 'product', 'invoice', 'invoice_item', 'payment'];
    for (const table of tables) {
      await queryRunner.query(`ALTER TABLE "${table}" DISABLE ROW LEVEL SECURITY`);
    }
  }
}
