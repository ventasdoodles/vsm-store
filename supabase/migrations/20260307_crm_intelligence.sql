-- ============================================================================
-- CRM 360: INTELIGENCIA DE CLIENTE Y SEGMENTACIÓN RFM
-- Descripción: Vista inteligente para segmentar clientes por comportamiento.
-- ============================================================================

-- 1. VISTA DE MÉTRICAS BASE RFM (Recency, Frequency, Monetary)
CREATE OR REPLACE VIEW customer_rfm_metrics AS
WITH latest_orders AS (
  SELECT 
    customer_id,
    MAX(created_at) as last_order_date,
    COUNT(id) as total_orders,
    SUM(total) as total_spent
  FROM orders
  WHERE status = 'delivered'
  GROUP BY customer_id
)
SELECT 
  cp.id as customer_id,
  cp.full_name,
  EXTRACT(DAY FROM (NOW() - lo.last_order_date))::INTEGER as recency_days,
  COALESCE(lo.total_orders, 0) as frequency,
  COALESCE(lo.total_spent, 0) as monetary,
  lo.last_order_date
FROM customer_profiles cp
LEFT JOIN latest_orders lo ON cp.id = lo.customer_id;

-- 2. VISTA DE SEGMENTACIÓN INTELIGENTE
CREATE OR REPLACE VIEW customer_intelligence_360 AS
SELECT 
  *,
  CASE 
    WHEN recency_days IS NULL THEN 'Prospecto'
    WHEN recency_days <= 15 AND frequency >= 3 AND monetary >= 5000 THEN 'Campeón'
    WHEN recency_days <= 30 AND frequency >= 2 THEN 'Leal'
    WHEN recency_days > 45 THEN 'En Riesgo'
    WHEN frequency = 1 AND recency_days <= 7 THEN 'Nuevo'
    ELSE 'Regular'
  END as segment,
  CASE
    WHEN recency_days <= 7 THEN 'Saludable'
    WHEN recency_days <= 30 THEN 'Estable'
    WHEN recency_days > 30 THEN 'Requiere Atención'
    ELSE 'Sin Actividad'
  END as health_status
FROM customer_rfm_metrics;

-- 3. PERMISOS (Habilitar lectura para administradores)
ALTER VIEW customer_rfm_metrics SET (security_invoker = on);
ALTER VIEW customer_intelligence_360 SET (security_invoker = on);

-- NOTA: Como son Vistas, heredan el RLS de las tablas base (orders y customer_profiles).
-- Solo los administradores podrán ver todos los datos.
