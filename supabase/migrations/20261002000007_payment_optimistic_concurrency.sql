-- ============================================================================
-- Migración: Optimistic Concurrency para Creación de Pagos (Tier 2)
--
-- Objetivos:
--   Evitar que una doble-petición en el frontend genere dos preferencias de
--   pago en Mercado Pago y sobreescriba la orden de forma concurrente,
--   lo que podría hacer que el cliente pague dos veces.
-- ============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.assign_mp_preference(
    p_order_id UUID,
    p_old_preference_id TEXT,
    p_new_preference_id TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_updated BOOLEAN;
BEGIN
    UPDATE public.orders
    SET mp_preference_id = p_new_preference_id,
        payment_method = 'mercadopago',
        updated_at = now()
    WHERE id = p_order_id
      AND mp_preference_id IS NOT DISTINCT FROM p_old_preference_id
      AND payment_status = 'pending'
      AND status != 'cancelled';

    v_updated := FOUND;
    RETURN v_updated;
END;
$$;

REVOKE ALL ON FUNCTION public.assign_mp_preference(UUID, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assign_mp_preference(UUID, TEXT, TEXT) TO service_role;

COMMIT;
