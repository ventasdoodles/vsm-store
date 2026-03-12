-- Migración para sincronizar retroactivamente puntos de lealtad (V-Coins)
-- Esto recupera los puntos de órdenes que existían antes de la corrección de la RPC.

DO $$
DECLARE
    r RECORD;
    v_points INTEGER;
BEGIN
    FOR r IN 
        SELECT id, customer_id, order_number, total, created_at
        FROM orders
        WHERE customer_id IS NOT NULL
          AND id NOT IN (SELECT order_id FROM loyalty_points WHERE order_id IS NOT NULL AND transaction_type = 'earned')
    LOOP
        -- Calcular puntos (10% del total, redondeado hacia abajo)
        v_points := floor(r.total * 0.1);
        
        IF v_points > 0 THEN
            INSERT INTO loyalty_points (customer_id, points, transaction_type, description, order_id, created_at)
            VALUES (
                r.customer_id, 
                v_points, 
                'earned', 
                'Sincronización retroactiva: Compra #' || r.order_number, 
                r.id, 
                r.created_at
            );
        END IF;
    END LOOP;
END $$;
