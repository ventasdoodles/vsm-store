-- 20260310: Corregir RPC de Cupones
-- Propósito: Alinear la función de incremento con el esquema real (code y used_count)

CREATE OR REPLACE FUNCTION increment_coupon_uses(target_coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE code = target_coupon_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION increment_coupon_uses IS 'Incrementa atómicamente el contador de usos de un cupón usando su código.';
