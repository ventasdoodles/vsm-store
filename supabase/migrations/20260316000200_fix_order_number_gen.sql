-- ============================================================
-- VSM Store - Fix Order Number Generation
-- Migración: 20260316_fix_order_number_gen.sql
-- Proposito: Evitar error 22P02 (Integer Syntax) al ignorar sufijos no numéricos.
-- ============================================================

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        CASE 
            WHEN substring(order_number FROM 5) ~ '^[0-9]+$' 
            THEN CAST(substring(order_number FROM 5) AS INTEGER)
            ELSE 0 
        END
    ), 0) + 1
    INTO next_num
    FROM orders;

    RETURN 'VSM-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number() IS 'Genera números de orden secuenciales ignorando registros con sufijos alfanuméricos (Rescue/Manual)';
