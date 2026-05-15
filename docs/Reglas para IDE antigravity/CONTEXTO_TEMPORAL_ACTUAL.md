# CONTEXTO TEMPORAL ACTUAL

> Ancla temporal vigente para VSM Store.
> Este archivo es subordinado al estado autoritativo del prompt actual, al canon real del proyecto y a las reglas inmutables del work-kit.

## 1. Identidad del bloque
- Proyecto: VSM Store
- Fecha: 2026-05-15
- Bloque vigente: post cierre del switch RPC de Admin, post canonizacion del deploy recovery manual de Cloudflare Pages (run `25918704188`), post canonizacion de la migracion GitHub Actions Node 24 (commit `f7519f7`, run `25920238570`), post canonizacion del pin de `supabase/setup-cli` (commit `d02e365`), post canonizacion de runtime verification de `deploy-functions` (run `25924147087`), post canonizacion de runtime verification de `graqle-sync` (run `25925139071`) y post canonizacion de runtime verification de `ingest-knowledge` (run `25927827351`).
- Baseline actual: `main` alineado con `origin/main`.

## 2. Estado autoritativo actual
- Admin unpaid cancellation audited RPC switch lane: cerrada, validada, canonizada y pusheada.
- Cloudflare Pages GitHub Actions deploy workflow: manual-only, hardened, proven (run `25918704188`). Secrets activos. Mecanismo paralelo a Cloudflare Pages native Git integration.
- GitHub Actions Node 20 -> Node 24 migration: aceptada con riesgo residual y canonizada. Commit `f7519f7` actualizó sólo workflows, movió actions runtime a Node 24 vía `checkout@v5`, `setup-node@v6`, `upload-artifact@v6`, `setup-python@v6` y `supabase/setup-cli@v2`; app/build Node queda en Node 22 LTS. Run `25920238570` de `Deploy Storefront to Cloudflare Pages` pasó con build, artifact upload y deploy.
- Supabase setup-cli action pin: aceptado con riesgo residual y canonizado. Commit `d02e365` cambió sólo `.github/workflows/deploy-functions.yml` y reemplazó `supabase/setup-cli@v2` por `supabase/setup-cli@df56b21da46c98abb12a9804e4fb1f657773e333`, SHA que correspondía a `refs/heads/v2` y `refs/tags/v2.0.0^{}` al auditar. Triggers, deploy commands, `with: version: latest` y referencias de secrets quedaron preservados por nombre.
- Deploy-functions runtime verification: aceptada con riesgo residual y canonizada. Run `25924147087` de `Deploy Supabase Edge Functions` (`workflow_dispatch`) paso en `main` sobre `fe3b57c93d2b7105a8773522dd42d16f81f05064`; `Setup toolchain`, `Deploy knowledge-ingestor`, `Deploy create-payment` y `Deploy mercadopago-webhook` pasaron, con annotation count `0`. Se preservaron `supabase/setup-cli@df56b21da46c98abb12a9804e4fb1f657773e333` y `with: version: latest`.
- Graqle-sync runtime verification: aceptada con riesgo residual y canonizada. Run `25925139071` de `GraQle Cloud Sync` (`workflow_dispatch`) paso en `main` sobre `e7cee6216a481ac145a3948aa7c69ba8a2c87bcd`; `Setup Python Runtime`, `Install GraQle Ecosystem & Apply Local Patch`, `Execute GraQle Rebuild` y `Commit & Push Updated Graph` pasaron, con annotation count `0`. El workflow no pusheo commit de `graqle.json`; `HEAD` local y `origin/main` permanecieron alineados en `e7cee62`.
- Ingest-knowledge runtime verification: aceptada con riesgo residual y canonizada. Run `25927827351` de `Run Knowledge Ingestion` (`workflow_dispatch`) paso en `main` sobre `76179a4139743f07836f95e20b8dabece69200f6`; el blocker previo de `SUPABASE_SERVICE_ROLE_KEY` faltante fue reparado antes del dispatch y verificado por metadata de secrets por nombre solamente. Pasaron `Check Secrets`, `Install dependencies`, `Run Knowledge Ingestor` y los pasos de setup/post/complete; failed step: none; annotations endpoint retorno `[]`. `HEAD` local y `origin/main` permanecieron alineados en `76179a4`; `origin/main...HEAD` permanecio `0 0`; no se expusieron valores de secrets.
- Césarín Core Wave 4: ya canonícamente cerrada; no debe reabrirse.
- Waves posteriores / post-refactor Césarín: ya registradas como aceptadas en canon; no abrir por reflejo temporal.

## 3. Residuos explícitos
- Remote sandbox RPC smoke: sigue sin resolver por safety filter.
- Production admin UI observation: sigue bloqueada por auth.
- Node 24 GitHub Actions residuals: `deploy-pages`, `deploy-functions`, `graqle-sync` e `ingest-knowledge` tienen runtime proof post-migracion; raw logs no fueron inspeccionados exhaustivamente; la correccion semantica de los datos remotos de Supabase no fue validada manualmente.
- Supabase setup-cli pin residuals: la version binaria de Supabase CLI sigue movil porque `version: latest` se preservo intencionalmente; el SHA pineado no recibira fixes upstream automaticamente.
- Migration history divergence: sigue intencionalmente sin reparar.
- No afirmar: all-workflows rerun/proof mas alla del canon previo, raw-log warning-free proof, secret changes, workflow run/deploy durante canonizacion salvo los runs ya autorizados y canonizados (`25924147087`, `25925139071`, `25927827351`), Cloudflare custom domain alias proof, remote Supabase semantic data validation, remote sandbox RPC PASS, production admin cancellation PASS, production real-order smoke, db push, db reset, deploy de produccion via custom domain, ni mutaciones remotas fuera de los workflows verificados.

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
