-- ============================================================
-- VSM Store - Reverse Lifecycle Integrity
-- Migración: 20260512000001_reverse_lifecycle_integrity.sql
-- ============================================================

-- 1. Patch `trg_update_customer_stats` to recalculate stats on reversal
CREATE OR REPLACE FUNCTION trg_update_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
    new_total_orders INTEGER;
    new_total_spent DECIMAL(10,2);
    new_tier TEXT;
    recalculate BOOLEAN := false;
BEGIN
    -- Determinar si debemos recalcular
    IF TG_OP = 'INSERT' THEN
        recalculate := true;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Recalcular si entra a 'delivered'
        IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
            recalculate := true;
        -- Recalcular si sale de 'delivered' (ej. a 'cancelled' o 'refunded')
        ELSIF OLD.status = 'delivered' AND NEW.status <> 'delivered' THEN
            recalculate := true;
        END IF;
    END IF;

    IF recalculate AND NEW.customer_id IS NOT NULL THEN
        SELECT
            COUNT(*),
            COALESCE(SUM(total), 0)
        INTO new_total_orders, new_total_spent
        FROM orders
        WHERE customer_id = NEW.customer_id
          AND status = 'delivered';

        new_tier := calculate_tier(new_total_spent);

        UPDATE customer_profiles SET
            total_orders = new_total_orders,
            total_spent = new_total_spent,
            customer_tier = new_tier
        WHERE id = NEW.customer_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Loyalty/Referral Reversal Logic
CREATE OR REPLACE FUNCTION process_referral_reversal(p_order_id UUID, p_customer_id UUID)
RETURNS VOID AS $$
DECLARE
    earned_points RECORD;
BEGIN
    -- Para evitar duplicados en la reversión (Idempotency), verificamos si ya existe
    -- un ajuste de expiración con prefijo [Reverso] para la misma orden.
    IF EXISTS (
        SELECT 1 FROM loyalty_points 
        WHERE order_id = p_order_id 
          AND transaction_type = 'expired' 
          AND description LIKE '[Reverso] %'
    ) THEN
        RETURN;
    END IF;

    -- Iterar sobre los puntos 'earned' otorgados por esta orden
    FOR earned_points IN 
        SELECT customer_id, points, description 
        FROM loyalty_points 
        WHERE order_id = p_order_id 
          AND transaction_type = 'earned'
    LOOP
        -- Insertar el reverso de puntos en el libro mayor como 'expired' (deducción)
        INSERT INTO loyalty_points (customer_id, points, transaction_type, description, order_id)
        VALUES (
            earned_points.customer_id, 
            earned_points.points, 
            'expired', 
            '[Reverso] ' || earned_points.description, 
            p_order_id
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger para reversos de ordenes (cuando cambian a cancelled o refunded)
CREATE OR REPLACE FUNCTION trg_on_order_refund_reversal()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.status = 'cancelled' AND OLD.status <> 'cancelled') OR
       (NEW.payment_status = 'refunded' AND OLD.payment_status <> 'refunded') THEN
        PERFORM process_referral_reversal(NEW.id, NEW.customer_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_order_refund_reversal ON orders;
CREATE TRIGGER tr_order_refund_reversal
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trg_on_order_refund_reversal();
