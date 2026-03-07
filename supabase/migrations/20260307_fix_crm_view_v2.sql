-- ============================================================================
-- CRM 360: FIX VISTA DE INTELIGENCIA (V2 - RECREACIÓN)
-- Descripción: Expande la vista para incluir todos los campos del perfil.
-- ============================================================================

-- IMPORTANTE: PostgreSQL no permite cambiar nombres de columnas en CREATE OR REPLACE.
-- Eliminamos las vistas existentes para recrearlas con la nueva estructura.
DROP VIEW IF EXISTS customer_intelligence_360 CASCADE;
DROP VIEW IF EXISTS customer_rfm_metrics CASCADE;

-- 1. ACTUALIZAR MÉTRICAS BASE (Incluir todos los campos de cp.*)
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
  cp.*, -- Seleccionamos TODO el perfil del cliente
  EXTRACT(DAY FROM (NOW() - lo.last_order_date))::INTEGER as recency_days,
  COALESCE(lo.total_orders, 0) as frequency,
  COALESCE(lo.total_spent, 0) as monetary,
  lo.last_order_date
FROM customer_profiles cp
LEFT JOIN latest_orders lo ON cp.id = lo.customer_id;

-- 2. RE-CREAR VISTA DE SEGMENTACIÓN (Hereda cp.*)
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

-- 3. ASEGURAR PERMISOS
ALTER VIEW customer_rfm_metrics SET (security_invoker = on);
ALTER VIEW customer_intelligence_360 SET (security_invoker = on);
