# CONTEXTO TEMPORAL ACTUAL

> Ancla temporal vigente para VSM Store.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Fecha: 2026-05-15
- Bloque vigente: post cierre del switch RPC de Admin, post canonización del deploy recovery manual de Cloudflare Pages (run `25918704188`) y post canonización de la migración GitHub Actions Node 24 (commit `f7519f7`, run `25920238570`).
- Baseline actual: `main` alineado con `origin/main`.

## 2. Estado autoritativo actual
- Admin unpaid cancellation audited RPC switch lane: cerrada, validada, canonizada y pusheada.
- Cloudflare Pages GitHub Actions deploy workflow: manual-only, hardened, proven (run `25918704188`). Secrets activos. Mecanismo paralelo a Cloudflare Pages native Git integration.
- GitHub Actions Node 20 -> Node 24 migration: aceptada con riesgo residual y canonizada. Commit `f7519f7` actualizó sólo workflows, movió actions runtime a Node 24 vía `checkout@v5`, `setup-node@v6`, `upload-artifact@v6`, `setup-python@v6` y `supabase/setup-cli@v2`; app/build Node queda en Node 22 LTS. Run `25920238570` de `Deploy Storefront to Cloudflare Pages` pasó con build, artifact upload y deploy.
- Césarín Core Wave 4: ya canonícamente cerrada; no debe reabrirse.
- Waves posteriores / post-refactor Césarín: ya registradas como aceptadas en canon; no abrir por reflejo temporal.

## 3. Residuos explícitos
- Remote sandbox RPC smoke: sigue sin resolver por safety filter.
- Production admin UI observation: sigue bloqueada por auth.
- Node 24 GitHub Actions residuals: sólo `deploy-pages` tiene runtime proof post-migración; `deploy-functions`, `graqle-sync` e `ingest-knowledge` fueron diff-verified pero no runtime-verified; raw logs no fueron inspeccionados exhaustivamente; `supabase/setup-cli@v2` es major branch móvil, no SHA pin.
- Migration history divergence: sigue intencionalmente sin reparar.
- No afirmar: all-workflows runtime proof, raw-log warning-free proof, secret changes, workflow run/deploy durante canonización, Cloudflare custom domain alias proof, remote sandbox RPC PASS, production admin cancellation PASS, production real-order smoke, db push, db reset, deploy de producción via custom domain, ni mutaciones remotas.

## 4. Lanes cerrados / no reabrir
- Admin RPC switch lane.
- Homepage Desktop Width Fix.
- Césarín Core Refactor Wave 4 y demás waves ya canonizadas.
- Storefront Product Discovery slices, salvo que un canon nuevo pruebe un blocker activo.
- PRODUCT_SEARCH / retrieval, salvo que un futuro lane seleccionado lo requiera de forma directa.

## 5. Próximo paso correcto
- Después de esta reconciliación temporal, ejecutar ROADMAP / READINESS para elegir el siguiente hito real desde el canon vigente, no desde contexto temporal viejo.

## 6. Regla de continuidad
- Si cambia el frente real, este archivo se reemplaza.
- Si el canon cambia, el contexto temporal se actualiza; nunca al revés.
