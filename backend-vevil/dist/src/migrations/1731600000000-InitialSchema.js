"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1731600000000 = void 0;
class InitialSchema1731600000000 {
    constructor() {
        this.name = 'InitialSchema1731600000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_role_enum" AS ENUM ('admin', 'user');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
        await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "name" character varying NOT NULL,
        "password" character varying,
        "avatar" character varying,
        "role" "user_role_enum" NOT NULL DEFAULT 'user',
        "hashedRefreshToken" character varying,
        "resetPasswordToken" character varying,
        "resetPasswordExpires" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_email" UNIQUE ("email"),
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "customer" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "phones" jsonb DEFAULT '[]',
        "address_street" character varying,
        "address_city" character varying,
        "address_province" character varying,
        "address_zip" character varying,
        "google_maps_link" character varying,
        "tax_id" character varying,
        CONSTRAINT "UQ_customer_email" UNIQUE ("email"),
        CONSTRAINT "PK_customer" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "product" (
        "id" SERIAL NOT NULL,
        "name" character varying NOT NULL,
        "type" character varying NOT NULL,
        "price" decimal(10,2) NOT NULL,
        "currency" character varying NOT NULL DEFAULT 'PYG',
        "stock" integer NOT NULL,
        "description" character varying,
        CONSTRAINT "PK_product" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "invoice" (
        "id" SERIAL NOT NULL,
        "customerId" integer NOT NULL,
        "date" TIMESTAMP NOT NULL DEFAULT now(),
        "total" decimal(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'PYG',
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        CONSTRAINT "PK_invoice" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoice_customer" FOREIGN KEY ("customerId") REFERENCES "customer"("id")
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "invoice_item" (
        "id" SERIAL NOT NULL,
        "quantity" integer NOT NULL,
        "priceAtSale" decimal(10,2) NOT NULL DEFAULT 0,
        "productId" integer NOT NULL,
        "invoiceId" integer NOT NULL,
        CONSTRAINT "PK_invoice_item" PRIMARY KEY ("id"),
        CONSTRAINT "FK_invoice_item_product" FOREIGN KEY ("productId") REFERENCES "product"("id"),
        CONSTRAINT "FK_invoice_item_invoice" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE
      )
    `);
        await queryRunner.query(`
      CREATE TABLE "payment" (
        "id" SERIAL NOT NULL,
        "invoiceId" integer NOT NULL,
        "amount" decimal(12,2) NOT NULL,
        "date" TIMESTAMP NOT NULL DEFAULT now(),
        "method" character varying(50),
        CONSTRAINT "PK_payment" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_invoice" FOREIGN KEY ("invoiceId") REFERENCES "invoice"("id") ON DELETE CASCADE
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TABLE "invoice_item"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
exports.InitialSchema1731600000000 = InitialSchema1731600000000;
//# sourceMappingURL=1731600000000-InitialSchema.js.map