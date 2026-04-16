import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1776370086554 implements MigrationInterface {
    name = 'Initial1776370086554'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" ADD "creditBalance" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "creditBalance"`);
    }

}
