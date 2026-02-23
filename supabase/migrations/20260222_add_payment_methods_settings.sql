-- Agregar columna de métodos de pago a la tabla store_settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '{"transfer": true, "mercadopago": false, "cash": false}';

COMMENT ON COLUMN store_settings.payment_methods IS 'Configuración de métodos de pago habilitados en la tienda';
