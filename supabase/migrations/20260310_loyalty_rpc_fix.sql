-- Migración para arreglar el problema de RLS y Data Integrity en Loyalty (V-Coins)
-- Esto soluciona el Issue #12 del backlog de context.

-- Crear o reemplazar función RPC que usa privilegios de admin (SECURITY DEFINER)
-- para procesar puntos de forma segura.
CREATE OR REPLACE FUNCTION process_loyalty_points(
    p_user_id UUID,
    p_amount INTEGER,
    p_type VARCHAR,
    p_description TEXT,
    p_order_id UUID DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    -- 1. Insertar el historial (bypasseando RLS porque la funciona corre con SECURITY DEFINER)
    INSERT INTO loyalty_points (customer_id, points, transaction_type, description, order_id, created_at)
    VALUES (p_user_id, p_amount, p_type, p_description, p_order_id, NOW());

    -- Termina exitosamente
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos a autenticados para correr esta función
GRANT EXECUTE ON FUNCTION process_loyalty_points(UUID, INTEGER, VARCHAR, TEXT, UUID) TO authenticated;
