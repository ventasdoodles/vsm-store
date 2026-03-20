# Wave 192 Shadow Audit v2

Fecha: 2026-03-19  
Proyecto: `VSM Storefront AI Pilot / Cesarin OS`  
Modo: `PARALLEL SAFE / SHADOW MODE / READ-ONLY`

## 1. Qué cambió

- No se aplicó ningún cambio.
- Se refinó el diagnóstico sobre cuatro frentes:
  - drift de `knowledge-ingestor`
  - empty state de `product_concepts`
  - asimetría entre `AdminGuard` y RLS
  - drift de embeddings entre canon y código local

## 2. Qué quedó validado

### Edge Function Drift Audit

`action: "update_chunk"` sí existe localmente en `supabase/functions/knowledge-ingestor/index.ts`.

Payload esperado:

- `id`
- `title`
- `content`
- `category`
- `source_type`
- `metadata` opcional

Ruta lógica local:

1. valida payload
2. genera embedding
3. hace `update` en `store_knowledge` por `id`
4. responde con `{ success: true, chunk }`

Evidencia concreta de drift de deploy/runtime:

- el cliente local sí invoca `update_chunk`
- el source local sí contiene esa rama
- el runtime observado respondió `Unsupported action: update_chunk`

Conclusión:

- el runtime desplegado no coincide con el source local auditado

Comando correcto de redeploy sin relajar auth:

```bash
supabase functions deploy knowledge-ingestor --project-ref <PROJECT_ID>
```

Evidencia que confirmaría runtime alineado:

- desaparece `Unsupported action: update_chunk`
- el save responde éxito
- cambia `updated_at`
- logs/runtime muestran paso por la rama `update_chunk`

### Product Concepts Empty-State Audit

`TabConcepts` no muestra gating local de piloto ni filtros agresivos que expliquen por sí solos un vacío total.

El servicio base consulta:

- `product_concepts`
- `concept_aliases(count)`
- `compatibility_relations!concept_a_id(count)`

La UI muestra empty state honesto cuando `concepts.length === 0`.

Además:

- `Nuevo Concepto` hoy no crea nada
- sólo muestra un placeholder de “en desarrollo”

## 3. Qué sigue abierto

### Ranking de causa probable para `product_concepts` vacío

#### 1. Datos realmente en cero

Evidencia a favor:

- `AUDIT_LOG.md` ya registra `product_concepts` con `0 records natively`
- no se encontraron seeds/inserts locales para poblarla
- la UI no filtra en frío

Evidencia en contra:

- ninguna fuerte en código

Falta para confirmarlo:

```sql
select count(*) as concepts from public.product_concepts;
```

#### 2. Mismatch `admin_users` vs `app_metadata.role = 'admin'`

Evidencia a favor:

- `AdminGuard` permite acceso usando `admin_users`
- la RLS de `product_concepts`, `concept_aliases` y `compatibility_relations` usa `auth.jwt().app_metadata.role = 'admin'`
- los servicios usan el cliente normal, no `service_role`

Evidencia en contra:

- no hay captura de red o respuesta runtime que pruebe aún `[]` por RLS

Falta para confirmarlo:

- verificar claims reales del JWT
- o verificar respuesta efectiva del query en runtime

#### 3. Project/runtime mismatch

Evidencia a favor:

- ya hubo drift real de function deploy
- el workflow despliega por `PROJECT_ID`

Evidencia en contra:

- no se auditó el project ref real del frontend/runtime

Falta para confirmarlo:

- reconciliar proyecto del deploy con proyecto consumido por frontend

#### 4. Bug de query/mapping/render

Evidencia a favor:

- la búsqueda promete alias pero el servicio sólo hace `ilike('name', ...)`
- el conteo de relaciones sólo cuenta `concept_a_id`

Evidencia en contra:

- eso no explica un vacío total al cargar sin búsqueda
- si el query fallara duro, el tab debería caer en toast de error

Falta para confirmarlo:

- respuesta real de red del fetch inicial

### RLS / Admin Claims Audit

Sí existe una asimetría real entre `AdminGuard` y RLS.

Escenario posible:

1. el usuario entra a `/admin/cesarin` porque existe en `admin_users`
2. el query a `product_concepts` corre con cliente autenticado normal
3. la RLS exige `app_metadata.role = 'admin'`
4. si ese claim no existe, la UI puede quedarse sin visibilidad efectiva

Eso hace que el acceso a la ruta y la visibilidad de datos no estén garantizados por la misma fuente de verdad.

### Embedding Drift Audit

Canon:

- `gemini-embedding-001`
- vía `v1beta`
- `3072d`

Código local auditado:

- `gemini-embedding-2-preview`
- vía `v1beta`
- `outputDimensionality: 3072`

Clasificación actual:

- no reconciliado

No hay evidencia suficiente para llamarlo intencional ni para venderlo como alineado.

## 4. Qué se aprueba

Se aprueba:

- mantener Wave 192 en `IMPLEMENTED / PENDING VALIDATION`
- tratar `Unsupported action: update_chunk` como drift de runtime/deploy
- tratar la asimetría `AdminGuard`/RLS como riesgo real
- seguir con diagnóstico read-only antes de cualquier cierre

No se aprueba:

- marcar Wave 192 como `DONE`
- abrir Wave 193
- inventar cierre canónico

## 5. Siguiente jugada exacta

1. Esperar a que Antigravity termine cualquier trabajo in-flight.
2. Redeployar `knowledge-ingestor` al proyecto correcto.
3. Revalidar un save real desde `TabKnowledge`.
4. Confirmar desaparición de `Unsupported action: update_chunk`.
5. Confirmar éxito real del save y cambio de `updated_at`.
6. Ejecutar SQL read-only para saber si `product_concepts` realmente está en cero.
7. Si hay filas y la UI sigue vacía, priorizar revisión de claims/RLS.
8. Sólo después revalidar relaciones direccionales, dropdowns restringidos, gap flags y drawer relacional.

## 6. Shadow artifacts

### Diff textual NO aplicado

```diff
--- a/.github/workflows/deploy-functions.yml
+++ b/.github/workflows/deploy-functions.yml
@@
-        run: supabase functions deploy knowledge-ingestor --project-ref $PROJECT_ID --no-verify-jwt
+        run: supabase functions deploy knowledge-ingestor --project-ref $PROJECT_ID
```

```diff
--- a/supabase/migrations/20260319_compatibility_concepts.sql
+++ b/supabase/migrations/20260319_compatibility_concepts.sql
@@
-CREATE POLICY "Admins can manage concepts" ON public.product_concepts
-    FOR ALL TO authenticated
-    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
+CREATE POLICY "Admins can manage concepts" ON public.product_concepts
+    FOR ALL TO authenticated
+    USING (EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid()));
```

### Comandos sugeridos NO ejecutados

```bash
supabase functions deploy knowledge-ingestor --project-ref <PROJECT_ID>
```

### SQL READ-ONLY sugerido

```sql
select count(*) as concepts from public.product_concepts;
select count(*) as aliases from public.concept_aliases;
select count(*) as relations from public.compatibility_relations;

select id, name, concept_type
from public.product_concepts
order by name
limit 20;

select policyname, tablename, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('product_concepts', 'concept_aliases', 'compatibility_relations');
```

### Mini runbook

```text
1. Redeployar knowledge-ingestor sin --no-verify-jwt.
2. Probar un save desde TabKnowledge.
3. Confirmar que desaparece Unsupported action: update_chunk.
4. Confirmar éxito de save y cambio de updated_at.
5. Revisar logs y verificar rama update_chunk.
6. Ejecutar SQL read-only de conteos.
7. Si product_concepts = 0, mantener Wave 192 pending.
8. Si product_concepts > 0 y UI vacía, revisar claims/RLS.
9. Si hay visibilidad, validar relations/gap flags/dropdowns/drawer.
10. Sólo después decidir si puede pasar a DONE.
```
