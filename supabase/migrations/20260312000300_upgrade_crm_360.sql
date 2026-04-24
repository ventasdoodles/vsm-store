-- Step 1: Drop dependent views to allow column restructuring
drop view if exists customer_intelligence_360 cascade;
drop view if exists customer_rfm_metrics cascade;

-- Step 2: Recreate customer_rfm_metrics with full profile data
create view customer_rfm_metrics as
with latest_orders as (
  select 
    customer_id,
    max(created_at) as last_order_date,
    count(id) as total_orders,
    sum(total) as total_spent
  from orders
  where status = 'delivered'
  group by customer_id
)
select 
  cp.*, -- Include all original profile fields (ia_context, ai_preferences, etc.)
  extract(day from (now() - lo.last_order_date))::integer as recency_days,
  coalesce(lo.total_orders, 0) as frequency,
  coalesce(lo.total_spent, 0) as monetary,
  lo.last_order_date
from customer_profiles cp
left join latest_orders lo on cp.id = lo.customer_id;

-- Step 3: Recreate customer_intelligence_360 with updated segmentation
create view customer_intelligence_360 as
select 
  *,
  case 
    when recency_days is null then 'Prospecto'
    when recency_days <= 15 and frequency >= 3 and monetary >= 5000 then 'Campeón'
    when recency_days <= 30 and frequency >= 2 then 'Leal'
    when recency_days > 45 then 'En Riesgo'
    when frequency = 1 and recency_days <= 7 then 'Nuevo'
    else 'Regular'
  end as segment,
  case
    when recency_days <= 7 then 'Saludable'
    when recency_days <= 30 then 'Estable'
    when recency_days > 30 then 'Requiere Atención'
    else 'Sin Actividad'
  end as health_status
from customer_rfm_metrics;

-- Re-apply permissions
alter view customer_rfm_metrics set (security_invoker = on);
alter view customer_intelligence_360 set (security_invoker = on);
