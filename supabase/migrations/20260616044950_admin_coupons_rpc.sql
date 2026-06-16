-- 1. Añadir columna customer_id a coupons para cupones dedicados
ALTER TABLE public.coupons ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE;

-- Comentario
COMMENT ON COLUMN public.coupons.customer_id IS 'Si se establece, el cupón solo puede ser usado por este cliente específico (cupón dedicado).';

-- 2. Crear función RPC para generar un cupón dedicado
CREATE OR REPLACE FUNCTION public.admin_generate_dedicated_coupon(
    p_customer_id UUID,
    p_discount_value NUMERIC,
    p_discount_type TEXT DEFAULT 'percentage',
    p_min_purchase NUMERIC DEFAULT 0,
    p_valid_days INTEGER DEFAULT 30
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_admin_check BOOLEAN;
    v_coupon_code TEXT;
    v_coupon_record RECORD;
BEGIN
    -- Verificar si el caller es Admin
    SELECT EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    ) INTO v_admin_check;

    IF NOT v_admin_check THEN
        RAISE EXCEPTION 'Acceso denegado: solo los administradores pueden generar cupones dedicados.';
    END IF;

    -- Generar código único (ej. VIP-A9B2-3F)
    v_coupon_code := 'VIP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 4));

    -- Insertar el cupón
    INSERT INTO public.coupons (
        code,
        description,
        discount_type,
        discount_value,
        min_purchase,
        max_uses,
        is_active,
        valid_from,
        valid_until,
        customer_id
    ) VALUES (
        v_coupon_code,
        'Cupón dedicado de lealtad / soporte',
        p_discount_type,
        p_discount_value,
        p_min_purchase,
        1,
        true,
        NOW(),
        NOW() + (p_valid_days || ' days')::INTERVAL,
        p_customer_id
    ) RETURNING * INTO v_coupon_record;

    RETURN to_jsonb(v_coupon_record);
END;
$$;
