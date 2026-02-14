-- Agregar campos de pago a tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'whatsapp' 
  CHECK (payment_method IN ('whatsapp', 'mercadopago', 'cash', 'transfer')),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' 
  CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
ADD COLUMN IF NOT EXISTS mp_preference_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS mp_payment_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS mp_payment_data JSONB; -- guardar respuesta completa por debugging

-- Índice para búsquedas rápidas en webhook
CREATE INDEX IF NOT EXISTS idx_orders_mp_preference ON orders(mp_preference_id) 
WHERE mp_preference_id IS NOT NULL;

-- Comentarios para documentación
COMMENT ON COLUMN orders.payment_method IS 'Método de pago elegido por el usuario';
COMMENT ON COLUMN orders.payment_status IS 'Estado del pago (actualizado por webhook)';
COMMENT ON COLUMN orders.mp_preference_id IS 'ID de preferencia de Mercado Pago';
COMMENT ON COLUMN orders.mp_payment_id IS 'ID del pago confirmado (del webhook)';
