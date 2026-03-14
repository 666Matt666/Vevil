-- ============================================================
-- Resetear el esquema público para volver a correr migraciones
-- Ejecutar en Supabase: SQL Editor → New query → pegar y Run
-- ============================================================
-- Orden: borrar tablas que dependen de otras primero, luego la tabla
-- de migraciones de TypeORM para que "migration:run" vuelva a aplicarlas.

DROP TABLE IF EXISTS "migrations" CASCADE;
DROP TABLE IF EXISTS "payment" CASCADE;
DROP TABLE IF EXISTS "invoice_item" CASCADE;
DROP TABLE IF EXISTS "invoice" CASCADE;
DROP TABLE IF EXISTS "product" CASCADE;
DROP TABLE IF EXISTS "customer" CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TYPE IF EXISTS "user_role_enum" CASCADE;
