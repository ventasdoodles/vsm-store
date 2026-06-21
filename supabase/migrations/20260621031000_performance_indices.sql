-- Migración: 20260621031000_performance_indices.sql
-- Optimiza consultas de CRM y lealtad

-- 1. Index para filtrar perfiles de clientes por tier (muy usado en campañas y loyalty)
CREATE INDEX IF NOT EXISTS idx_customer_profiles_tier ON public.customer_profiles(customer_tier);

-- 2. Index para optimizar cálculos de LTV en el dashboard (total de la orden)
CREATE INDEX IF NOT EXISTS idx_orders_total ON public.orders(total);
