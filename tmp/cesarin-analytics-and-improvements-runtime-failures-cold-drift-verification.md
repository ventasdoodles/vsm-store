# 1. MOST LIKELY ROOT CAUSE FOR ANALYTICS FAILURE

La causa más probable es **unapplied migration en `ai_analytics`**, específicamente una de estas dos, con mayor probabilidad en la primera:

- `20260320_response_text_to_ai_analytics.sql`
- `20260316_neural_v159.sql`

Razón:

- [src/components/admin/cesarin/TabAnalytics.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabAnalytics.tsx) carga con `Promise.all([getPilotKPIs, getPilotQueryLog])`. Si cualquiera de las dos queries falla, la tab completa cae en error.
- [src/services/admin/admin-pilot-ops.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-pilot-ops.service.ts) asume que `ai_analytics` tiene:
  `frustration_detected`,
  `ai_logic_debug`,
  y ahora también `response_text`.
- El schema base de [supabase/migrations/20260315_cesarin_os.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260315_cesarin_os.sql) no traía esos campos; llegaron después.
- Por lo tanto, si live DB quedó antes de esas migraciones, `getPilotQueryLog(...).select('id, query, response_text, created_at, frustration_detected, ai_logic_debug')` es exactamente el tipo de query que rompe en runtime.

Veredicto frío:

- `Analytics` huele principalmente a **schema drift por migración no aplicada**, no a mapper ni null handling.

# 2. MOST LIKELY ROOT CAUSE FOR IMPROVEMENTS FAILURE

La causa más probable es **unapplied migration del queue MVP**, en particular:

- `20260320_cesarin_improvement_items.sql`

Con una segunda posibilidad fuerte:

- la tabla existe, pero falta alguno de sus objetos asociados que la query asume, sobre todo la relación por FK hacia `ai_analytics`.

Razón:

- [src/components/admin/cesarin/TabImprovements.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabImprovements.tsx) sólo hace `getImprovementItems(...)` al abrir.
- [src/services/admin/admin-improvement.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-improvement.service.ts) consulta:
  `from('cesarin_improvement_items').select('*, ai_analytics(query)')`
- Esa query asume a la vez:
  que existe `public.cesarin_improvement_items`,
  que existe `analytics_id`,
  que `analytics_id` referencia `public.ai_analytics(id)`,
  y que PostgREST puede resolver la relación embebida `ai_analytics(query)`.
- Si la tabla nueva no está en live DB, la tab cae.
- Si la tabla existe pero falta el FK `analytics_id -> ai_analytics.id`, el embedded select también es un breakpoint fuerte.

La migración `20260320_improvement_items_anti_dupe.sql` no es el breakpoint más probable para abrir la tab; afecta creación/duplicados, no carga inicial.

# 3. WHETHER THEY SHARE THE SAME ROOT CAUSE

No comparten el mismo **breakpoint exacto**, pero sí comparten el mismo **tipo de problema**: **live DB drift por migraciones recientes no aplicadas o aplicadas parcialmente**.

Distinción útil:

- `Analytics` depende de evolución reciente sobre `ai_analytics`.
- `Improvements` depende de una tabla nueva completa más su relación con `ai_analytics`.

Entonces:

- misma familia de causa: **schema/query drift**
- objetos concretos distintos: **`ai_analytics` enrichments** vs **`cesarin_improvement_items` queue objects**

# 4. HIGHEST-PROBABILITY SCHEMA / QUERY BREAKPOINTS

1. `public.ai_analytics.response_text`
   Breakpoint directo para [src/services/admin/admin-pilot-ops.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-pilot-ops.service.ts), porque `getPilotQueryLog` lo selecciona explícitamente.

2. `public.ai_analytics.frustration_detected`
   También seleccionado explícitamente por el mismo servicio.

3. `public.ai_analytics.ai_logic_debug`
   Es central para el mapper de Pilot Ops; sin esa columna falla tanto KPI como log query.

4. `public.cesarin_improvement_items`
   Si la tabla no existe, `TabImprovements` falla de inmediato.

5. FK / relación embebida:
   `public.cesarin_improvement_items.analytics_id -> public.ai_analytics.id`
   Sin eso, `select('*, ai_analytics(query)')` en [src/services/admin/admin-improvement.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-improvement.service.ts) es un breakpoint muy probable.

6. Admin SELECT policy sobre `ai_analytics`
   `ai_analytics_select_admin` de [supabase/migrations/20260320_ai_analytics_rls_write_path.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_ai_analytics_rls_write_path.sql)
   Si live tiene RLS activado sin esta policy, `Analytics` puede romper por permisos.

7. Admin SELECT policy sobre `cesarin_improvement_items`
   `improvement_items_select_admin` de [supabase/migrations/20260320_cesarin_improvement_items.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_cesarin_improvement_items.sql)
   Si la tabla existe pero la policy no, `Improvements` puede fallar por permisos.

Clasificación fría del tipo de issue:

- Más probable: **unapplied migration**
- Segundo lugar: **bad SELECT shape caused by missing FK/relation object**
- Menos probable: **bad mapper/type mismatch**
- Aún menos probable: **null handling**

# 5. WHAT ANTIGRAVITY SHOULD VERIFY FIRST

Verificar primero, en este orden:

1. Que `public.ai_analytics` tenga estas columnas en live:
   `response_text`
   `frustration_detected`
   `ai_logic_debug`

2. Que estén aplicadas estas migraciones de `Analytics`:
   [supabase/migrations/20260316_neural_v159.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260316_neural_v159.sql)
   [supabase/migrations/20260320_response_text_to_ai_analytics.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_response_text_to_ai_analytics.sql)
   [supabase/migrations/20260320_ai_analytics_rls_write_path.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_ai_analytics_rls_write_path.sql)

3. Que exista `public.cesarin_improvement_items` con sus columnas base en live.

4. Que esté aplicada:
   [supabase/migrations/20260320_cesarin_improvement_items.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_cesarin_improvement_items.sql)

5. Que exista el FK desde `cesarin_improvement_items.analytics_id` hacia `ai_analytics.id`, porque el servicio depende de `ai_analytics(query)` como relación embebida.

6. Que exista la policy admin de lectura sobre `cesarin_improvement_items`.

7. Sólo después, verificar:
   [supabase/migrations/20260320_improvement_items_anti_dupe.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_improvement_items_anti_dupe.sql)

Ese último objeto no es el primer sospechoso para fallo de apertura, pero sí confirma que live DB está realmente alineada con el hardening reciente.

# 6. FILES INSPECTED

- [src/components/admin/cesarin/TabAnalytics.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabAnalytics.tsx)
- [src/services/admin/admin-pilot-ops.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-pilot-ops.service.ts)
- [src/components/admin/cesarin/TabImprovements.tsx](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/components/admin/cesarin/TabImprovements.tsx)
- [src/services/admin/admin-improvement.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/admin/admin-improvement.service.ts)
- [supabase/migrations/20260315_cesarin_os.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260315_cesarin_os.sql)
- [supabase/migrations/20260316_neural_v159.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260316_neural_v159.sql)
- [supabase/migrations/20260320_response_text_to_ai_analytics.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_response_text_to_ai_analytics.sql)
- [supabase/migrations/20260320_ai_analytics_rls_write_path.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_ai_analytics_rls_write_path.sql)
- [supabase/migrations/20260320_cesarin_improvement_items.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_cesarin_improvement_items.sql)
- [supabase/migrations/20260320_improvement_items_anti_dupe.sql](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/migrations/20260320_improvement_items_anti_dupe.sql)
