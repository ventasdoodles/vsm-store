-- ============================================================
-- VSM Store - Fix Loyalty Module
-- Fecha: 06 marzo 2026
-- ============================================================

-- 1. Actualizar la restricción CHECK de loyalty_points
-- Primero eliminamos la antigua si existe (buscando el nombre por defecto o similar)
-- Nota: En Supabase a veces el nombre es auto-generado. Intentamos identificarla.
DO $$ 
BEGIN 
    ALTER TABLE loyalty_points DROP CONSTRAINT IF EXISTS loyalty_points_transaction_type_check;
EXCEPTION 
    WHEN undefined_object THEN NULL; 
END $$;

ALTER TABLE loyalty_points 
ADD CONSTRAINT loyalty_points_transaction_type_check 
CHECK (transaction_type IN ('earned', 'spent', 'redeemed', 'expired', 'adjustment'));

COMMENT ON COLUMN loyalty_points.transaction_type IS 'earned, spent, redeemed (canjeado en checkout), expired, adjustment (admin)';

-- 2. Actualizar la función de balance para incluir nuevos tipos
CREATE OR REPLACE FUNCTION get_customer_points_balance(p_customer_id UUID)
RETURNS INTEGER AS $$
DECLARE
    balance INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        CASE
            WHEN transaction_type = 'earned' THEN points
            WHEN transaction_type = 'adjustment' THEN points -- Puede ser positivo o negativo
            WHEN transaction_type = 'spent' THEN -ABS(points)
            WHEN transaction_type = 'redeemed' THEN -ABS(points)
            WHEN transaction_type = 'expired' THEN -ABS(points)
            ELSE 0
        END
    ), 0)
    INTO balance
    FROM loyalty_points
    WHERE customer_id = p_customer_id;

    RETURN balance;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Asegurar que los puntos negativos se guarden correctamente
-- No hay cambios necesarios en la estructura, pero esto confirma el soporte.
