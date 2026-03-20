# Wave 192 Shadow Audit Note

Fecha: 2026-03-19  
Modo: `PARALLEL SAFE / SHADOW MODE`  
Rol: Auditor técnico + arquitecto de soporte + preparador de diffs no aplicados

## Contexto

Este documento resume una auditoría en shadow mode sobre Wave 192 del piloto `VSM Storefront AI Pilot / Cesarin OS`, sin aplicar cambios y sin tocar archivos in-flight.

Objetivo de la auditoría:

- Auditar drift real entre código local, runtime y canon.
- Inspeccionar el bloqueo de `knowledge-ingestor` con `update_chunk`.
- Diagnosticar por qué `product_concepts` aparece vacío en UI.
- Preparar material de ejecución seguro para revalidación posterior.

Restricciones respetadas:

- No se aplicaron cambios.
- No se editaron archivos productivos in-flight.
- No se hicieron commits.
- No se redeployó nada.
- No se ejecutó SQL de escritura.

---

## 1. Qué cambió

- No se aplicó ningún cambio. La salida de esta auditoría es únicamente diagnóstica.
- Se confirmó drift de runtime en `knowledge-ingestor`: el código local sí soporta `action: "update_chunk"`, pero el runtime reportado respondió `Unsupported action: update_chunk`.
- Se detectó drift código/canon en embeddings:
  - El canon documenta `gemini-embedding-001`.
  - El código local de `knowledge-ingestor` usa `gemini-embedding-2-preview` con `outputDimensionality: 3072`.
- Se detectó un drift de seguridad/autorización:
  - El acceso a `/admin/cesarin` se valida contra `admin_users`.
  - Las tablas `product_concepts`, `concept_aliases` y `compatibility_relations` usan RLS basada en `auth.jwt().app_metadata.role = 'admin'`.
  - Esas dos nociones de “admin” no son equivalentes por definición.

---

## 2. Qué quedó validado

### 2.1 Estado canónico de Wave 192

Wave 192 sigue correctamente en:

- `IMPLEMENTED / PENDING VALIDATION`

No hay evidencia suficiente para marcarla `DONE`.

### 2.2 Drift audit de `knowledge-ingestor`

Se validó que `update_chunk` sí existe localmente.

Ruta lógica local:

1. El cliente invoca la edge function `knowledge-ingestor`.
2. Envía `action: 'update_chunk'`.
3. La función valida payload.
4. Regenera embedding.
5. Ejecuta `update` sobre `store_knowledge` por `id`.
6. Devuelve respuesta de éxito con el chunk actualizado.

Payload esperado por `update_chunk`:

- `id`
- `title`
- `content`
- `category`
- `source_type`
- `metadata` opcional

Conclusión:

- Si runtime respondió `Unsupported action: update_chunk`, ese runtime no coincide con el source local inspeccionado.
- Eso apunta a drift de deploy, no a una falla demostrada del cliente local.

### 2.3 Ruta cliente del save + sync

La ruta local de guardado quedó validada:

- `TabKnowledge.tsx`
- `useAdminKnowledge.ts`
- `admin-knowledge.service.ts`
- `supabase.functions.invoke('knowledge-ingestor', { action: 'update_chunk', ... })`

También quedó validado:

- existe early block cliente para contenido menor a 20 caracteres;
- el flujo está dentro de Cesarin OS;
- el cliente no expone `service_role`.

### 2.4 Diagnóstico de `TabConcepts`

Se validó que `TabConcepts`:

- no introduce gating local de piloto;
- no depende de un flag de sesión específico para cargar la lista;
- no tiene un filtro inicial que por sí solo explique un vacío total;
- muestra zero-state honesto cuando `concepts.length === 0`.

También se confirmó que:

- el botón `Nuevo Concepto` hoy no crea conceptos;
- sólo dispara un placeholder/toast de “en desarrollo”.

Conclusión operativa:

- si `product_concepts` está realmente en cero, la propia UI no puede desbloquear ese estado por sí sola.

---

## 3. Qué sigue abierto

### 3.1 Ranking de causa probable para `product_concepts` vacío

#### 1. Más probable: ausencia real de datos en runtime

Evidencia:

- `AUDIT_LOG.md` ya registra que `product_concepts` contiene `0 records natively`.
- No se encontraron seeds o inserts locales para `product_concepts`.
- La UI no aplica filtros agresivos al cargar en frío.

Qué falta para confirmarlo:

- `SELECT count(*) FROM public.product_concepts;`

#### 2. Segunda probable: mismatch entre guard de admin y RLS real

Evidencia:

- `AdminGuard` usa `admin_users`.
- La migración de `product_concepts` y tablas relacionadas exige `auth.jwt().app_metadata.role = 'admin'`.
- Un usuario puede pasar el guard y aun así no tener visibilidad efectiva sobre esas tablas.

Qué falta para confirmarlo:

- inspeccionar claims reales del JWT;
- o confirmar por red/response que la consulta está devolviendo `[]` por política y no por ausencia de datos.

#### 3. Tercera probable: project/runtime mismatch

Evidencia:

- ya hubo drift real de edge function en esta wave;
- el deploy depende de `PROJECT_ID` del workflow;
- si frontend y función apuntan a proyectos distintos, el diagnóstico visual puede engañar.

Qué falta para confirmarlo:

- reconciliar el `project-ref` efectivo del deploy con el proyecto real que usa el frontend.

### 3.2 Cosas que NO quedaron evidenciadas

NOT EVIDENCED:

- que el vacío provenga de un bug de render;
- que el vacío provenga de un mapper que esté comiéndose registros;
- que `update_chunk` esté roto localmente;
- que Wave 192 pueda cerrarse canónicamente hoy.

### 3.3 Riesgo estructural adicional

Hay un drift que debe reconciliarse antes de cerrar canon:

- el canon describe embeddings con `gemini-embedding-001`;
- el local de `knowledge-ingestor` usa `gemini-embedding-2-preview`.

Eso no prueba un bug funcional inmediato, pero sí impide vender “alineación completa” si no se reconcilia.

---

## 4. Qué se aprueba

Se aprueba:

- mantener Wave 192 como `IMPLEMENTED / PENDING VALIDATION`;
- tratar el `400 Unsupported action: update_chunk` como drift de deploy/runtime hasta prueba en contrario;
- hacer diagnóstico read-only de `product_concepts`, `concept_aliases` y `compatibility_relations`;
- exigir evidencia real antes de cualquier cierre canónico.

No se aprueba:

- marcar Wave 192 como `DONE`;
- abrir Wave 193;
- vender el estado actual como “cerrado”.

---

## 5. Siguiente jugada exacta

1. Esperar a que Antigravity termine el trabajo in-flight.
2. Redeployar únicamente `knowledge-ingestor` al proyecto correcto.
3. Revalidar un save real desde `TabKnowledge`.
4. Confirmar que desaparece `Unsupported action: update_chunk`.
5. Confirmar que el save devuelve éxito y que `updated_at` cambia.
6. Ejecutar diagnóstico read-only de `product_concepts`, `concept_aliases` y `compatibility_relations`.
7. Si `product_concepts = 0`, dejar Wave 192 en `PENDING VALIDATION`.
8. Si `product_concepts > 0` y la UI sigue vacía, investigar de inmediato el mismatch `admin_users` vs `app_metadata.role`.
9. Sólo si hay datos visibles y se validan relaciones direccionales, dropdowns restringidos, gap flags y drawer relacional, entonces evaluar `DONE`.

---

## 6. Shadow artifacts

### 6.1 Comando sugerido de redeploy

No ejecutado:

```bash
supabase functions deploy knowledge-ingestor --project-ref <PROJECT_ID> --no-verify-jwt
```

### 6.2 Evidencia que confirmaría que el deploy quedó alineado

Se considera alineado si:

- `TabKnowledge` puede guardar un chunk sin `400 Unsupported action`;
- el runtime entra a la rama `update_chunk`;
- el chunk vuelve con éxito;
- se observa cambio de `updated_at`;
- no hay error de dimensión/vector al persistir embedding.

### 6.3 SQL diagnóstico READ-ONLY

NO EJECUTAR AUTOMÁTICAMENTE.

```sql
select count(*) as concepts from public.product_concepts;
select count(*) as aliases from public.concept_aliases;
select count(*) as relations from public.compatibility_relations;

select policyname, tablename, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('product_concepts', 'concept_aliases', 'compatibility_relations');
```

### 6.4 Mini runbook parallel-safe

```text
1. Confirmar que Antigravity ya cerró cambios in-flight.
2. Redeployar knowledge-ingestor al mismo PROJECT_ID del workflow.
3. Abrir Cesarin OS > Conocimiento.
4. Editar un chunk existente y guardar.
5. PASS si ya no aparece Unsupported action: update_chunk.
6. PASS si el save devuelve éxito y el nodo refleja timestamp nuevo.
7. Revisar logs/dashboard de la función y confirmar rama update_chunk.
8. Ejecutar SQL read-only de conteos para concepts/aliases/relations.
9. Si product_concepts = 0, no cerrar Wave 192.
10. Si product_concepts > 0, abrir TabConcepts.
11. Validar render de lista base.
12. Validar expand/collapse por concepto.
13. Validar dropdown restringido de relation_type.
14. Validar dropdown restringido de scope.
15. Validar creación direccional A -> B.
16. Validar gap flags.
17. Validar drawer/sheet relacional.
18. Sólo con esos PASS y sin drift documental, considerar DONE.
```

---

## Referencias inspeccionadas

- `AI_CONTEXT.md`
- `AUDIT_LOG.md`
- `STORE_FRONT_AI_PILOT_CONTEXT.md`
- `supabase/functions/knowledge-ingestor/index.ts`
- `src/services/admin-knowledge.service.ts`
- `src/hooks/useAdminKnowledge.ts`
- `src/components/admin/cesarin/TabKnowledge.tsx`
- `src/services/admin-compatibility.service.ts`
- `src/components/admin/cesarin/TabConcepts.tsx`
- `src/components/admin/AdminGuard.tsx`
- `src/services/admin/admin-auth.service.ts`
- `.github/workflows/deploy-functions.yml`
- `supabase/config.toml`
- `supabase/migrations/20260319_compatibility_concepts.sql`

---

## Cierre

Conclusión honesta:

- Wave 192 no está cerrada.
- El bloqueo de `update_chunk` fue consistente con drift de deploy/runtime.
- El vacío de `product_concepts` sigue siendo compatible principalmente con ausencia real de datos, pero existe una segunda hipótesis seria de mismatch RLS/admin que no debe ignorarse.
- Sin revalidación runtime y sin evidencia real de datos/visibilidad en `product_concepts`, cualquier cierre canónico sería prematuro.
