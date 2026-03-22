import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsActiveToUsers1731800000000 implements MigrationInterface {
  name = 'AddIsActiveToUsers1731800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agregar columna isActive a la tabla users con valor por defecto true
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "isActive" boolean NOT NULL DEFAULT true
    `);
    
    // Crear índice para búsquedas de usuarios activos
    await queryRunner.query(`
      CREATE INDEX "IDX_user_isActive" ON "user" ("isActive")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_user_isActive"`);
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isActive"`);
  }
}
