# RLS DEPLOY GATE — `public.ai_analytics` ANON WRITE-PATH

**Fecha:** 2026-03-20
**Tipo:** Verificación operativa + acción requerida
**Scope:** RLS, grants, políticas de INSERT en `public.ai_analytics`

---

## VEREDICTO

**Anon telemetry writes: BLOQUEADO en producción.**

La migración de fix está committeada (`21f2329`) pero **no aplicada** a la base de datos activa.
`supabase db push` es contraindicado. El SQL debe ejecutarse manualmente en el Dashboard.

---

## 1. CONTEXTO

El schema-alignment fix (`2035d45`) corrigió el insert de `logAITelemetry` para usar el schema JSONB
correcto de `ai_analytics`. Sin embargo, existía un bloqueador de capa inferior no resuelto:
el rol `anon` nunca tuvo privilegios de INSERT sobre la tabla.

Tráfico del storefront pilot sin sesión autenticada → rol `anon` → `permission denied for table
ai_analytics` → tragado por `try/catch` silencioso → **cero filas de producción anónima en la tabla**.

---

## 2. INVESTIGACIÓN

### 2.1 Migraciones inspeccionadas

| Archivo | Relevancia |
| ------- | ---------- |
| `20260315_cesarin_os.sql` | Crea `ai_analytics` sin `ENABLE ROW LEVEL SECURITY` y sin políticas |
| `20260316_neural_v159.sql` | ALTER TABLE — añade columnas. Sin cambio a RLS o grants |
| `20260316_universal_rescue.sql:141` | `GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated` — no cubre `anon` |
| `20260319_human_evaluation_loop.sql` | FK `ai_evaluations → ai_analytics` — sin impacto en write-path |
| `20260320_ai_analytics_rls_write_path.sql` | Fix pre-escrito — **UNTRACKED al momento del gate, committeado en `21f2329`** |

### 2.2 Estado de grants sin migración aplicada

| Rol | Fuente | INSERT |
| --- | ------ | ------ |
| `authenticated` | `GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated` | ✅ permitido |
| `anon` | Sin grant explícito en ninguna migración | ❌ bloqueado |
| `service_role` | Bypassa RLS por diseño de Supabase | ✅ permitido |

### 2.3 Verificación de estado remoto

```text
$ npx supabase migration list

Local          | Remote         | Time (UTC)
---------------|----------------|---------------------
20260320       |                | 20260320            ← LOCAL ONLY
               | 20260317150702 | 2026-03-17 15:07:02 ← REMOTE ONLY
               | 20260317172218 | 2026-03-17 17:22:18 ← REMOTE ONLY
               | 20260318034633 | 2026-03-18 03:46:33 ← REMOTE ONLY
               | 20260319032715 | 2026-03-19 03:27:15 ← REMOTE ONLY
               | 20260319095324 | 2026-03-19 09:53:24 ← REMOTE ONLY
```

Columna `Remote` vacía en `20260320` → **migración no aplicada al remote**.

Además: el remote tiene 5+ timestamps propios sin archivos locales correspondientes. El schema
de producción fue aplicado directamente vía SQL Dashboard. La historia de migraciones está
**totalmente divergida** entre local y remote.

### 2.4 Por qué `supabase db push` es UNSAFE

`db push` en este estado intentaría re-aplicar TODAS las migraciones locales desde `001_initial_schema.sql`
contra un schema de producción ya existente. **Conflicto garantizado.** No usar.

---

## 3. FIX — SQL EXACTO

Ejecutar en **Supabase Dashboard → SQL Editor**:

```sql
-- Habilitar RLS (sin RLS, los grants son el único control — anon no tiene ninguno)
ALTER TABLE public.ai_analytics ENABLE ROW LEVEL SECURITY;

-- Grant INSERT explícito para el rol anon
-- (GRANT ALL TO authenticated no cubre anon)
GRANT INSERT ON public.ai_analytics TO anon;

-- Policy INSERT: tráfico anon del storefront pilot sin login
CREATE POLICY "ai_analytics_insert_anon"
ON public.ai_analytics
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy INSERT: tráfico autenticado
-- (el grant existía vía GRANT ALL; la policy es necesaria una vez RLS habilitado)
CREATE POLICY "ai_analytics_insert_authenticated"
ON public.ai_analytics
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy SELECT: solo admins
-- Preserva compatibilidad con admin-pilot-ops.service.ts reader
CREATE POLICY "ai_analytics_select_admin"
ON public.ai_analytics
FOR SELECT
TO authenticated
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
```

---

## 4. VERIFICACIÓN POST-EJECUCIÓN

Correr inmediatamente después en el mismo SQL Editor:

```sql
-- Confirmar RLS habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'ai_analytics';
-- rowsecurity debe ser: true

-- Confirmar las 3 políticas creadas
SELECT polname, polcmd, polroles::text
FROM pg_policies
WHERE tablename = 'ai_analytics'
ORDER BY polname;
-- Debe mostrar:
--   ai_analytics_insert_anon        | INSERT | {anon}
--   ai_analytics_insert_authenticated | INSERT | {authenticated}
--   ai_analytics_select_admin       | SELECT | {authenticated}
```

---

## 5. VERDAD ESPERADA POST-EJECUCIÓN

| Rol | INSERT | SELECT | Notas |
| --- | ------ | ------ | ----- |
| `anon` | ✅ | ❌ | Solo telemetría — correcto |
| `authenticated` no-admin | ✅ | ❌ | No puede ver datos de otros usuarios — correcto |
| `authenticated` admin | ✅ | ✅ | Vía `admin_users` check — preserva TabPilot / KPIs |
| `service_role` | ✅ | ✅ | Bypassa RLS — edge functions no afectadas |

---

## 6. IMPACTO EN SUPERFICIES

| Surface | Estado antes | Estado después |
| ------- | ------------ | -------------- |
| `logAITelemetry` — usuarios anon | ❌ `permission denied` silencioso | ✅ insert exitoso |
| `logAITelemetry` — usuarios autenticados | ✅ funcionaba (GRANT ALL) | ✅ sin cambio |
| TabPilot / `getPilotKPIs()` | Solo veía datos de usuarios autenticados | ✅ universo completo incluyendo anon |
| TabAnalytics / `getPilotQueryLog()` | Solo veía datos de usuarios autenticados | ✅ universo completo |
| `admin-pilot-ops.service.ts` reader | ✅ sin cambio | ✅ sin cambio |
| Edge functions (`service_role`) | ✅ sin cambio | ✅ sin cambio |

---

## 7. QUÉ SIGUE ABIERTO

| Item | Notas |
| ---- | ----- |
| Ejecutar SQL en Dashboard | **Bloqueador activo.** Sin esto, anon INSERT sigue bloqueado. |
| Verificar primeras filas anon | Confirmar con `SELECT count(*) FROM ai_analytics WHERE ai_logic_debug->>'is_simulation' = 'false'` después de 30 min de tráfico pilot. |

---

## 8. COMMITS RELACIONADOS

```text
f4df963  feat(telemetry): implement production AI interaction logging in concierge.service
2035d45  fix(telemetry): align logAITelemetry insert with ai_analytics JSONB schema
21f2329  fix(rls): enable RLS and grant anon INSERT on ai_analytics
```

---

_Gate abierto hasta ejecución manual del SQL en Dashboard._
_`supabase db push` contraindicado — divergencia local/remote confirmada._
