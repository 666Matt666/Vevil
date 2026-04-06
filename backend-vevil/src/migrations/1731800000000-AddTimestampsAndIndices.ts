import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsAndIndices1731800000000 implements MigrationInterface {
  name = 'AddTimestampsAndIndices1731800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Products - add timestamps if not exist
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'created_at') THEN
          ALTER TABLE "product" ADD COLUMN "created_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'product' AND column_name = 'updated_at') THEN
          ALTER TABLE "product" ADD COLUMN "updated_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
      END $$
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_created_at" ON "product" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_name" ON "product" ("name")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_product_type" ON "product" ("type")`);

    // Customers - add timestamps
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer' AND column_name = 'created_at') THEN
          ALTER TABLE "customer" ADD COLUMN "created_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer' AND column_name = 'updated_at') THEN
          ALTER TABLE "customer" ADD COLUMN "updated_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
      END $$
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_customer_created_at" ON "customer" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_customer_name" ON "customer" ("name")`);

    // Invoices - add timestamps
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice' AND column_name = 'created_at') THEN
          ALTER TABLE "invoice" ADD COLUMN "created_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice' AND column_name = 'updated_at') THEN
          ALTER TABLE "invoice" ADD COLUMN "updated_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
      END $$
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_invoice_created_at" ON "invoice" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_invoice_date" ON "invoice" ("date")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_invoice_status" ON "invoice" ("status")`);

    // Invoice items - add timestamps
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_item' AND column_name = 'created_at') THEN
          ALTER TABLE "invoice_item" ADD COLUMN "created_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoice_item' AND column_name = 'updated_at') THEN
          ALTER TABLE "invoice_item" ADD COLUMN "updated_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
      END $$
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_invoice_item_created_at" ON "invoice_item" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_invoice_item_invoice_id" ON "invoice_item" ("invoiceId")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_invoice_item_product_id" ON "invoice_item" ("productId")`);

    // Payments - add timestamps
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment' AND column_name = 'created_at') THEN
          ALTER TABLE "payment" ADD COLUMN "created_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment' AND column_name = 'updated_at') THEN
          ALTER TABLE "payment" ADD COLUMN "updated_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
      END $$
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_payment_created_at" ON "payment" ("created_at")`);

    // Stock movements - add timestamps
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_movement' AND column_name = 'created_at') THEN
          ALTER TABLE "stock_movement" ADD COLUMN "created_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_movement' AND column_name = 'updated_at') THEN
          ALTER TABLE "stock_movement" ADD COLUMN "updated_at" TIMESTAMPTZ DEFAULT NOW();
        END IF;
      END $$
    `);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_created_at" ON "stock_movement" ("created_at")`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_stock_movement_product_id" ON "stock_movement" ("productId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_stock_movement_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_stock_movement_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payment_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_item_product_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_item_invoice_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_item_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_invoice_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_customer_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_name"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_product_created_at"`);
  }
}