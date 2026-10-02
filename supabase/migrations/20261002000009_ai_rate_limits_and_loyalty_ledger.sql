-- ============================================================================
-- Migración: Rate Limiting de IA y Ledger de Lealtad Estricto (Tier 2 Final)
--
-- Objetivos:
--   1. Crear tabla y RPC para limitar el consumo de IA por usuario y evitar
--      ataques de agotamiento de saldo (Financial DDoS) hacia Gemini.
--   2. Blindar el Ledger de Lealtad: asegurar que un usuario no pueda gastar
--      puntos que no tiene (evitando balances negativos) mediante locks en la 
--      tabla de clientes para serializar el cálculo del balance.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. AI RATE LIMITING
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
    customer_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tokens_used INT NOT NULL DEFAULT 0,
    last_reset TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS en la tabla (nadie la lee ni escribe directamente desde el cliente)
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;

-- RPC para consumir cuota de IA.
-- Por defecto, un usuario puede consumir 100 "unidades" por hora.
CREATE OR REPLACE FUNCTION public.consume_ai_quota(
    p_customer_id UUID,
    p_cost INT DEFAULT 1,
    p_max_quota INT DEFAULT 100,
    p_window_minutes INT DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_current_used INT;
    v_last_reset TIMESTAMPTZ;
BEGIN
    -- Bloquear o crear la fila del usuario
    INSERT INTO public.ai_rate_limits (customer_id, tokens_used, last_reset)
    VALUES (p_customer_id, 0, now())
    ON CONFLICT (customer_id) DO UPDATE
    SET customer_id = EXCLUDED.customer_id
    RETURNING tokens_used, last_reset INTO v_current_used, v_last_reset;

    -- Si ya pasó la ventana de tiempo, resetear el contador
    IF now() > v_last_reset + (p_window_minutes || ' minutes')::INTERVAL THEN
        v_current_used := 0;
        v_last_reset := now();
    END IF;

    -- Si se excede el límite, rechazar
    IF v_current_used + p_cost > p_max_quota THEN
        RETURN FALSE;
    END IF;

    -- Consumir y actualizar
    UPDATE public.ai_rate_limits
    SET tokens_used = v_current_used + p_cost,
        last_reset = v_last_reset
    WHERE customer_id = p_customer_id;

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_ai_quota(UUID, INT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(UUID, INT, INT, INT) TO service_role;


-- ----------------------------------------------------------------------------
-- 2. LOYALTY LEDGER STRICT VALIDATION
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.process_loyalty_points(
    p_user_id UUID,
    p_amount INT,
    p_type VARCHAR,
    p_description TEXT,
    p_order_id UUID DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_current_balance INT;
BEGIN
    -- Prevención de IDOR y Fraude: si no es el service_role, solo puede afectar sus propios puntos y solo para GASTAR
    IF current_setting('role') != 'service_role' THEN
        IF auth.uid() != p_user_id THEN
            RAISE EXCEPTION 'Access denied. You can only process your own loyalty points.';
        END IF;
        IF p_type != 'spent' THEN
            RAISE EXCEPTION 'Access denied. Users can only spend points, not earn them manually.';
        END IF;
    END IF;

    -- Validación de input base
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'p_amount must be greater than 0';
    END IF;

    -- Adquirimos un lock sobre el perfil del cliente para serializar peticiones
    -- concurrentes y evitar el doble-gasto (race conditions).
    PERFORM id FROM public.customer_profiles WHERE id = p_user_id FOR UPDATE;

    -- Calcular balance actual (la función get_customer_points_balance lee 
    -- de loyalty_points, que no está alterado aún en esta transacción).
    v_current_balance := public.get_customer_points_balance(p_user_id);

    -- Si es un gasto ('spent'), validar que tenga suficientes puntos
    IF p_type = 'spent' THEN
        IF v_current_balance < p_amount THEN
            RAISE EXCEPTION 'Insufficient loyalty points. Balance: %, Requested: %', v_current_balance, p_amount;
        END IF;
    END IF;

    -- Insertar el registro contable inmutable
    INSERT INTO public.loyalty_points (customer_id, points, transaction_type, description, order_id, created_at)
    VALUES (p_user_id, p_amount, p_type, p_description, p_order_id, NOW());

END;
$$;

-- Restablecer permisos seguros (solo autenticados)
REVOKE ALL ON FUNCTION public.process_loyalty_points(UUID, INT, VARCHAR, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.process_loyalty_points(UUID, INT, VARCHAR, TEXT, UUID) TO authenticated, service_role;

COMMIT;
