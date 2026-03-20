# Generated With
- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# Security / Integrity Triage Gate

1. **qué cambió**
- El reporte nuevo no cayó parejo.
- Los hallazgos más fuertes que siguen file-true hoy son:
  - integridad rota en bulk product updates
  - ausencia de path transaccional para batch updates
  - riesgo real de overselling por validación final cliente-side
- Los más inflados o ya matizados en HEAD son:
  - `.env` exposure como leak activo
  - `TabQuality` como riesgo unbounded
  - `Math.random()` en coupon suggestion como “crítico” puro

2. **qué quedó validado**
- `.gitignore` sí ignora `.env`, `.env.local` y `.env.*.local`.
- `.env` no aparece tracked; `git ls-files` sólo devuelve:
  - `.env.example`
  - `.env.test`
- `.env.test` existe tracked, pero hoy está vacío. No encontré evidencia de secreto expuesto ahí.
- `src/services/admin/admin-products.service.ts` sigue haciendo `bulkUpdateProducts()` con `Promise.all()` de updates individuales; si una falla, otras pueden haber quedado aplicadas sin rollback.
- Ese mismo archivo no ofrece RPC ni path transaccional alternativo para updates por lote con valores distintos por fila.
- `src/stores/cart.store.ts` sí valida stock/precio, pero lo hace en cliente.
- `src/hooks/useCheckout.ts` corre `runValidation()` antes de crear la orden, pero sigue siendo validación desde cliente.
- `src/services/orders.service.ts` crea la orden con un simple insert; no reserva ni decrementa stock en transacción.
- `supabase/functions/create-payment/index.ts` arma el pago desde la orden existente; no endurece inventario.
- `src/services/admin/admin-coupons.service.ts` sigue generando sufijo con `Math.random()`, pero dentro de una heurística local de sugerencia de cupón, no en un token secreto.
- `src/components/admin/cesarin/TabQuality.tsx` trae reportes con `.limit(10)`. Ahí el hallazgo “unbounded” ya no aplica tal cual.
- `src/services/admin/admin-dashboard.service.ts` sí tiene queries potencialmente grandes en `getDashboardStats()` para órdenes en rango sin paginación explícita.
- `src/services/concierge.service.ts` mantiene `searchCache = new Map()` sin TTL ni size cap.

3. **qué sigue abierto**
- Sigue abierto si existe fuera de este scope alguna protección DB/trigger contra overselling; en los archivos revisados no aparece.
- Sigue abierto si el lane de checkout stock integrity debe entrar como fix dedicado más amplio que una cirugía chica.
- Sigue abierto endurecer dashboard query bounds si el volumen real ya empezó a crecer.
- Sigue abierto si conviene tratar `Math.random()` en coupons como hygiene o como seguridad; por archivo-truth hoy se ve más como hygiene/integrity menor.

4. **qué se aprueba**
- Se aprueba como primer lane:
  - **Bulk Product Update Integrity**
- No apruebo empezar por `.env`:
  - el leak activo no quedó probado
- No apruebo empezar por coupons:
  - el riesgo quedó muy por debajo
- No apruebo empezar por `TabQuality`/dashboard:
  - el problema fuerte ahí es de performance/bounds, no de integridad crítica inmediata
- No apruebo empezar por cart overselling como primer slice:
  - es muy serio, pero pide una cirugía más amplia y transaccional que el lane de bulk ops

5. **cuál es la siguiente jugada exacta**
- Ejecutar primero un lane de **Bulk Product Update Integrity** sobre:
  - `src/services/admin/admin-products.service.ts`
  - revisión de integración en `src/pages/admin/AdminBatchManager.tsx` sólo si hace falta adaptar consumo
- Objetivo:
  - eliminar partial-commit silencioso en batch updates
  - definir path atómico o fail-safe para updates por lote
  - reducir dos findings críticos a la vez: `C-02` y `C-04`

### A. Critical Findings Verification Table
| issue | file | current truth | severity now | why |
|---|---|---|---|---|
| C-01 `.env` secrets / git exposure risk | `.gitignore`, `.env*` | `PARTIAL` | medio-bajo | `.env` está ignorado y no aparece tracked; existe `.env.test` tracked pero vacío, así que el posture risk existe más que un leak activo |
| C-02 partial-failure risk in bulk product updates | `src/services/admin/admin-products.service.ts` | `TRUE` | alto | `Promise.all()` de updates individuales puede dejar estado mixto si una operación falla después de otras exitosas |
| C-03 client-side cart race / overselling risk | `src/stores/cart.store.ts`, `src/hooks/useCheckout.ts`, `src/services/orders.service.ts`, `supabase/functions/create-payment/index.ts` | `PARTIAL` | alto | sí hay validación final, pero sigue siendo cliente-side; no vi reserva/decremento transaccional server-side |
| C-04 lack of transactional batch update path | `src/services/admin/admin-products.service.ts` | `TRUE` | alto | no hay RPC/path atómico para lote heterogéneo; el comentario del archivo lo reconoce |
| C-05 coupon generation with `Math.random()` | `src/services/admin/admin-coupons.service.ts` | `TRUE` | medio-bajo | sigue usando `Math.random()`, pero para sugerencia heurística de código, no para un secreto criptográfico |
| H-04 unbounded/pagination risk in TabQuality/admin dashboard | `src/components/admin/cesarin/TabQuality.tsx`, `src/services/admin/admin-dashboard.service.ts` | `PARTIAL` | medio | `TabQuality` ya limita a 10; el riesgo real persiste más en dashboard range queries sin bounds fuertes |
| M-02 cache without TTL in `concierge.service.ts` | `src/services/concierge.service.ts` | `TRUE` | medio-bajo | `Map` en memoria sin TTL ni cap; real, pero acotado al lifecycle del cliente |

### B. Recommended First Execution Lane
- `lane name`
  - `Bulk Product Update Integrity`
- `exact files`
  - `src/services/admin/admin-products.service.ts`
  - `src/pages/admin/AdminBatchManager.tsx` solo si el nuevo path exige adaptación de consumo
- `why first`
  - corrige dos findings altos de una vez (`C-02`, `C-04`)
  - el scope es pequeño y bien delimitado
  - evita corrupción operativa silenciosa en una herramienta admin peligrosa por naturaleza
- `why not the others yet`
  - `C-03` requiere diseñar una barrera server-side transaccional de checkout/inventario; es más amplio
  - `C-01` no mostró leak activo en HEAD
  - `C-05` es menor frente a integridad de datos
  - `H-04` y `M-02` no reducen riesgo crítico tanto como el lane de batch integrity

### C. Prompt Seed for Antigravity
```md
Run a focused `Bulk Product Update Integrity` lane.

Primary scope:
- `src/services/admin/admin-products.service.ts`
- `src/pages/admin/AdminBatchManager.tsx` only if integration changes are needed

Goals:
1. remove the current partial-failure behavior in `bulkUpdateProducts()`
2. provide an atomic or fail-safe batch update path for heterogeneous product row updates
3. prevent mixed success states where some product updates commit before another row fails
4. preserve current admin behavior as much as possible outside the batch integrity fix

Constraints:
- do not expand into Cesarin runtime lanes
- do not mix this with checkout/cart work
- no broad refactor of admin products
- keep the lane tightly centered on C-02 + C-04 risk reduction
```
