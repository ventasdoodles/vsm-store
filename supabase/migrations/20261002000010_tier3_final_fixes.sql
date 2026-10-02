-- ============================================================================
-- Migración: Tier 3 Final Fixes (Wheel of Fortune & Narrow Data Exposure)
--
-- Objetivos:
--   1. Destruir `apply_wheel_prize_points` (CRITICAL-04) que permitía inyectar
--      puntos infinitos.
--   2. Crear `spin_wheel()` atómico: calcula el premio con `random()`, verifica
--      el cooldown, y otorga el premio de forma segura (sin confiar en el cliente).
--   3. Narrow Data Exposure: Remover `GRANT ALL` inseguros que quedaron
--      en tablas misceláneas como `store_settings` y `wheel_config`.
-- ============================================================================

BEGIN;

-- 1. Destruir el vector de fraude original
DROP FUNCTION IF EXISTS public.apply_wheel_prize_points(UUID, INTEGER, TEXT);

-- 2. Crear la función atómica de ruleta
CREATE OR REPLACE FUNCTION public.spin_wheel() 
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_last_spin TIMESTAMPTZ;
    v_rnd DOUBLE PRECISION;
    v_cumulative DOUBLE PRECISION := 0;
    v_prize RECORD;
    v_prize_found BOOLEAN := false;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required to spin the wheel.';
    END IF;

    -- Lock the customer profile briefly to prevent concurrent spins
    PERFORM id FROM public.customer_profiles WHERE id = v_user_id FOR UPDATE;

    -- Verificar el cooldown (1 giro por día)
    SELECT created_at INTO v_last_spin
    FROM public.wheel_attempts
    WHERE customer_id = v_user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_last_spin IS NOT NULL AND v_last_spin > now() - INTERVAL '24 hours' THEN
        RAISE EXCEPTION 'You must wait 24 hours between spins.';
    END IF;

    -- Calcular el premio basado en probabilidades (0.0 to 1.0)
    v_rnd := random();
    
    FOR v_prize IN 
        SELECT id, label, type, value, probability 
        FROM public.wheel_config 
        WHERE is_active = true 
        ORDER BY probability ASC
    LOOP
        v_cumulative := v_cumulative + v_prize.probability;
        IF v_rnd <= v_cumulative THEN
            v_prize_found := true;
            EXIT;
        END IF;
    END LOOP;

    -- Si no se encontró (suma de prob < 1), o falla el random, asignar premio vacío (si existe)
    IF NOT v_prize_found THEN
        SELECT id, label, type, value INTO v_prize 
        FROM public.wheel_config 
        WHERE is_active = true AND type = 'none' LIMIT 1;
    END IF;

    -- Insertar el intento
    INSERT INTO public.wheel_attempts (customer_id, prize_id, created_at)
    VALUES (v_user_id, v_prize.id, now());

    -- Otorgar el premio si aplica
    IF v_prize.type = 'points' AND v_prize.value->>'points' IS NOT NULL THEN
        -- Bypassear el chequeo de "solo gastar" usando la función internamente como bypass
        -- Como process_loyalty_points asume current_setting('role') != 'service_role' prohíbe ganar,
        -- lo insertaremos directo en la tabla para no violar la regla que pusimos en Tier 2.
        INSERT INTO public.loyalty_points (customer_id, points, transaction_type, description, created_at)
        VALUES (v_user_id, (v_prize.value->>'points')::INT, 'earned', 'Wheel Prize: ' || v_prize.label, NOW());
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'prize_id', v_prize.id,
        'label', v_prize.label,
        'type', v_prize.type,
        'value', v_prize.value
    );
END;
$$;

REVOKE ALL ON FUNCTION public.spin_wheel() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.spin_wheel() TO authenticated;

-- 3. Narrow Data Exposure (Limpiar permisos heredados peligrosos)
-- Evitar que los usuarios modifiquen configuraciones del sistema si hubo un GRANT excesivo.
REVOKE ALL ON TABLE public.store_settings FROM anon, authenticated;
GRANT SELECT ON TABLE public.store_settings TO anon, authenticated;

REVOKE ALL ON TABLE public.wheel_config FROM anon, authenticated;
GRANT SELECT ON TABLE public.wheel_config TO anon, authenticated;

-- El cliente solo puede insertar en wheel_attempts indirectamente vía la función spin_wheel.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.wheel_attempts FROM anon, authenticated;
GRANT SELECT ON TABLE public.wheel_attempts TO authenticated;

COMMIT;
