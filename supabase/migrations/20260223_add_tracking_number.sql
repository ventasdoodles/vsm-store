-- Agregar columna para número de guía a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

COMMENT ON COLUMN orders.tracking_number IS 'Número de guía o rastreo del paquete';
