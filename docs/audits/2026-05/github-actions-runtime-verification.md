# GitHub Actions Runtime Verification - May 2026

## Covered Lanes
- Cloudflare Pages manual deploy recovery: run `25918704188`.
- GitHub Actions Node 20 -> Node 24 migration: commit `f7519f7`, run `25920238570`.
- `supabase/setup-cli` pin: commit `d02e365`.
- `deploy-functions` runtime verification: run `25924147087`.
- `deploy-functions` customer-intelligence refresh: workflow patch `626a730`, workflow_dispatch run `25980183647`.
- `graqle-sync` runtime verification: run `25925139071`.
- `Run Knowledge Ingestion` runtime verification: run `25927827351`.

## Accepted Facts
- Cloudflare Pages GitHub Actions deploy workflow was made manual-only while preserving Cloudflare Pages native Git integration as the primary deploy path.
- Node 24 migration updated Actions runtime dependencies while leaving app/build Node at Node 22 LTS.
- `supabase/setup-cli` was pinned by SHA in `deploy-functions`; `with: version: latest` remained intentionally preserved.
- `deploy-functions`, `graqle-sync`, and `ingest-knowledge` each received accepted runtime verification for the scoped runs listed above.
- `626a730` added a `Deploy customer-intelligence` step to `.github/workflows/deploy-functions.yml`.
- Workflow_dispatch run `25980183647` concluded success on `main` at `626a730d9363ca3dec01c82116ab85947c56209a`; deploy steps for `knowledge-ingestor`, `customer-intelligence`, `create-payment`, and `mercadopago-webhook` all succeeded.
- Secret verification was metadata/name-only where applicable; no secret values were exposed.

## Non-Claims / Residuals
- No all-workflows rerun/proof beyond the canonized runs.
- No raw-log warning-free proof.
- No Cloudflare custom-domain alias proof.
- Supabase CLI binary remains mobile because `version: latest` was intentionally preserved.
- The pinned action SHA will not automatically receive upstream fixes.
- Run `25980183647` is accepted only as the scoped deploy-functions/customer-intelligence refresh needed for the post-deploy no-write smoke; it is not all-workflows proof.
