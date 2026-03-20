# Wave 192 Closure Support Pack

Fecha: 2026-03-19  
Proyecto: `VSM Storefront AI Pilot / Cesarin OS`  
Modo: `PARALLEL SAFE / SHADOW MODE / READ-ONLY`

## 1. Qué cambió

- No se aplicó ningún cambio.
- Este documento consolida material de soporte para Wave 192:
  - diagnóstico de deploy path
  - auditoría admin/RLS
  - ranking de causas para `product_concepts` vacío
  - matriz de drift canon/código/runtime
  - SQL read-only sugerido
  - comandos sugeridos no ejecutados
  - runbook de revalidación
  - plantillas de cierre y de `pending validation`

## 2. Qué quedó validado

### 2.1 Deploy Path Audit

`update_chunk` sí existe localmente en `supabase/functions/knowledge-ingestor/index.ts`.

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
3. actualiza `store_knowledge` por `id`
4. responde `{ success: true, chunk }`

La evidencia de drift de runtime/deploy sigue siendo fuerte:

- el source local contiene `update_chunk`
- el cliente local invoca `update_chunk`
- el runtime observado respondió `Unsupported action: update_chunk`

Ruta de deploy observada en repo:

- workflow: `.github/workflows/deploy-functions.yml`
- function objetivo: `knowledge-ingestor`
- project ref: `SUPABASE_PROJECT_ID`

### 2.2 Admin / RLS Topology Audit

Acceso admin:

- `AdminGuard` valida si el usuario existe en `admin_users`
- `checkIsAdmin()` consulta `admin_users`

Visibilidad de conceptos/aliases/compatibilidad:

- depende de RLS sobre:
  - `product_concepts`
  - `concept_aliases`
  - `compatibility_relations`
- la policy auditada usa `auth.jwt().app_metadata.role = 'admin'`

Conclusión:

- sí puede existir una asimetría real entre entrar a `/admin/cesarin` y ver esas tablas

### 2.3 Data-State Diagnostic

Ranking de causa probable para `product_concepts` vacío:

1. datos realmente en cero
2. mismatch admin/RLS
3. project/environment mismatch
4. bug de query/mapping/render

### 2.4 Embedding Drift Audit

Canon:

- `gemini-embedding-001`
- `v1beta`
- `3072d`

Código local auditado:

- `gemini-embedding-2-preview`
- `v1beta`
- `outputDimensionality: 3072`

Clasificación:

- `drift / no reconciliado`

## 3. Qué sigue abierto

### 3.1 Causas para `product_concepts` vacío

#### 1. Datos realmente en cero

Evidencia a favor:

- `AUDIT_LOG.md` ya registra `0 records natively`
- no se encontraron seeds visibles en el alcance auditado
- la UI no muestra un gating local fuerte

Evidencia en contra:

- ninguna fuerte en código

Evidencia faltante:

- conteo read-only en runtime real

#### 2. Mismatch admin/RLS

Evidencia a favor:

- el guard usa `admin_users`
- la visibilidad RLS usa `app_metadata.role`
- esas dos fuentes de verdad no son equivalentes

Evidencia en contra:

- no hay aún captura de red o claims reales del JWT de la sesión afectada

Evidencia faltante:

- claims JWT reales
- respuesta real del query a `product_concepts`

#### 3. Project/environment mismatch

Evidencia a favor:

- ya hubo drift real de edge function
- el workflow depende de `PROJECT_ID`

Evidencia en contra:

- no se confirmó que frontend y workflow apunten a proyectos distintos

Evidencia faltante:

- reconciliación del proyecto real del frontend con el proyecto del deploy

#### 4. Bug de query/mapping/render

Evidencia a favor:

- la búsqueda promete alias, pero el servicio sólo filtra por `name`
- el count de relaciones sólo usa `concept_a_id`

Evidencia en contra:

- eso no explica bien un vacío total en carga inicial
- un fallo duro de query debería manifestarse como error

Evidencia faltante:

- respuesta real de red del fetch inicial

### 3.2 Estructura aún no evidenciada

NOT EVIDENCED:

- runtime plenamente alineado con el source local
- visibilidad confirmada de `product_concepts` en el proyecto objetivo
- cierre canónico de Wave 192

## 4. Qué se aprueba

Se aprueba:

- mantener Wave 192 en `IMPLEMENTED / PENDING VALIDATION`
- tratar el blocker de `knowledge-ingestor` como drift de deploy/runtime hasta revalidación
- tratar la asimetría admin/RLS como riesgo real
- seguir con materiales read-only y runbooks

No se aprueba:

- abrir Wave 193
- cerrar canon sin evidencia runtime
- usar schema changes como solución de Wave 192

## 5. Siguiente jugada exacta

1. Confirmar que no haya trabajo in-flight pendiente sobre la function o los tabs.
2. Rehacer el deploy de `knowledge-ingestor` al `PROJECT_ID` correcto.
3. Revalidar un save real desde `TabKnowledge`.
4. Confirmar desaparición de `Unsupported action: update_chunk`.
5. Confirmar éxito real del save y cambio de `updated_at`.
6. Ejecutar SQL read-only sobre `product_concepts`, `concept_aliases` y `compatibility_relations`.
7. Si `product_concepts = 0`, mantener Wave 192 en pending por data state blocker.
8. Si hay filas y la UI sigue vacía, priorizar claims/RLS.
9. Sólo si save + sync + concepts/relations pasan, usar la plantilla de cierre.

## 6. Shadow artifacts

### 6.1 Canon Drift Matrix

| Topic | Canon Says | Code Says | Runtime Says | Status |
|---|---|---|---|---|
| Wave 192 status | `IMPLEMENTED / PENDING VALIDATION` | N/A | Blockers observados | aligned |
| `knowledge-ingestor` soporta `update_chunk` | Safe edit con `update_chunk` | Rama `update_chunk` existe | Se reportó `Unsupported action: update_chunk` | drift |
| Ruta de deploy | No explicitada en canon | Workflow despliega `knowledge-ingestor` por `PROJECT_ID` | No evidenciado qué build quedó activo | not evidenced |
| Auth en deploy | No usar `--no-verify-jwt` por disciplina actual | Workflow actual sí lo usa; config ya tiene `verify_jwt = false` | No evidenciado impacto exacto | drift |
| Acceso admin | No canon unificado explícito | `AdminGuard` usa `admin_users` | No evidenciado claims JWT reales | drift |
| Visibilidad de concepts | No canon reconciliado explícito | RLS usa `app_metadata.role = 'admin'` | UI aparece vacía | drift |
| Estado de `product_concepts` | A63 dice `0 records natively` | No hay seeds visibles en alcance | UI aparece vacía | aligned / pending confirmation |
| Modelo de embeddings | `gemini-embedding-001` | `gemini-embedding-2-preview` | No evidenciado adicional | drift |

### 6.2 SQL Read-Only Sugerido

NO EJECUTAR AUTOMÁTICAMENTE.

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

### 6.3 Comandos Sugeridos NO Ejecutados

```bash
supabase functions deploy knowledge-ingestor --project-ref <PROJECT_ID>
```

```bash
supabase functions list --project-ref <PROJECT_ID>
```

### 6.4 Mini Runbook de Revalidación

```text
1. Confirmar fin de cambios in-flight.
2. Desplegar knowledge-ingestor al PROJECT_ID correcto sin --no-verify-jwt.
3. Abrir Cesarin OS > Conocimiento.
4. Editar un chunk existente y guardar.
5. Confirmar que desaparece Unsupported action: update_chunk.
6. Confirmar save exitoso y cambio de updated_at.
7. Revisar logs y confirmar rama update_chunk.
8. Ejecutar SQL read-only de conteos para concepts/aliases/relations.
9. Si product_concepts = 0, mantener Wave 192 pending.
10. Si hay filas y UI vacía, revisar claims JWT y RLS.
11. Si hay visibilidad, validar lista, expand, relaciones, dropdowns, gap flags y drawer.
12. Sólo entonces evaluar cierre.
```

### 6.5 Mini Template de Cierre de Wave 192

```md
### Wave 192 Closure Check

Status: DONE

Validated:
- `knowledge-ingestor` runtime aligned with local source
- `update_chunk` save path passed in runtime
- `store_knowledge` save + embedding sync revalidated
- `product_concepts` visible in UI
- directional relations validated
- restricted dropdowns validated
- gap flags validated
- relational drawer/sheet validated

Notes:
- No schema changes required for Wave 192 closure
- Canon reconciled only after runtime validation evidence
```

### 6.6 Mini Template de Pending Validation

```md
### Wave 192 Validation Status

Status: IMPLEMENTED / PENDING VALIDATION

Open blockers:
- Runtime/deploy drift remains unresolved for `knowledge-ingestor`
- `product_concepts` validation blocked by empty or non-visible data state

Validated so far:
- Local source contains `update_chunk`
- UI safe-edit path exists
- `TabConcepts` does not show a local gating bug as primary cause

Not evidenced:
- Runtime aligned with local source
- Concepts visibility confirmed in target project
- Full relational UI validation
```
