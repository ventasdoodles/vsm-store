-- Migration: vw_ai_proactive_insights
-- Proposito: Exponer datos de recompra (replenishment) y hardware (kitting) a la IA.

CREATE OR REPLACE VIEW public.vw_ai_proactive_insights AS
WITH expanded_orders AS (
    SELECT 
        o.customer_id,
        o.created_at as order_date,
        item->>'id' AS product_id,
        item->>'name' AS product_name,
        item->>'section' AS section,
        item->>'quantity' AS quantity
    FROM 
        public.orders o,
        jsonb_array_elements(o.items) AS item
    WHERE 
        o.payment_status = 'paid'
        OR o.status = 'delivered'
),
replenishment_candidates AS (
    -- Liquidos comprados hace más de 15 días y menos de 60 días
    SELECT 
        customer_id,
        json_agg(json_build_object(
            'product_name', product_name,
            'days_since_purchase', EXTRACT(DAY FROM (now() - order_date))
        )) as items_due_for_replenishment
    FROM expanded_orders
    WHERE 
        section IN ('liquidos', 'desechables', 'sales')
        AND order_date < now() - interval '15 days'
        AND order_date > now() - interval '60 days'
    GROUP BY customer_id
),
hardware_owned AS (
    -- Hardware comprado en los ultimos 365 días
    SELECT 
        customer_id,
        json_agg(DISTINCT product_name) as owned_hardware_models
    FROM expanded_orders
    WHERE 
        section IN ('equipos', 'pods')
        AND order_date > now() - interval '365 days'
    GROUP BY customer_id
)
SELECT 
    p.id AS customer_id,
    p.customer_tier,
    COALESCE(r.items_due_for_replenishment, '[]'::json) AS items_due_for_replenishment,
    COALESCE(h.owned_hardware_models, '[]'::json) AS owned_hardware_models
FROM 
    public.customer_profiles p
LEFT JOIN replenishment_candidates r ON p.id = r.customer_id
LEFT JOIN hardware_owned h ON p.id = h.customer_id;

-- Permisos
GRANT SELECT ON public.vw_ai_proactive_insights TO anon, authenticated;
