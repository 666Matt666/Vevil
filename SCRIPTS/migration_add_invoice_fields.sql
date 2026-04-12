-- Agregar columnas faltantes para facturas mejoradas
-- Ejecutar en Supabase (PostgreSQL)

-- 1. Agregar campos a la tabla invoice
ALTER TABLE invoice ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE invoice ADD COLUMN IF NOT EXISTS discountPercent DECIMAL(5,2) DEFAULT 0;
ALTER TABLE invoice ADD COLUMN IF NOT EXISTS dueDate DATE;

-- 2. Agregar campo discountPercent a invoice_item
ALTER TABLE invoice_item ADD COLUMN IF NOT EXISTS discountPercent DECIMAL(5,2) DEFAULT 0;

-- Verificar que se agregaron correctamente
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoice' AND column_name IN ('notes', 'discountPercent', 'dueDate');
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoice_item' AND column_name = 'discountPercent';