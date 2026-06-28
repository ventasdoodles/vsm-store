# VSM Store - Skill System v2 Architecture

## 1. Purpose

Skill System v2 is the target architecture for keeping Ya VOY prompts, repo procedures, evidence, and handoffs compact, auditable, and hard to misuse.

This document is architecture plus current local/manual workflow state. It does not create hooks, CI, runtime enforcement, product behavior, DB/Auth/Supabase/browser/provider proof, or production readiness.

## 2. Non-goals

- Do not create prompt-lint hooks, CI integration, automatic blocking, or runtime enforcement.
- Do not canonize this lane as accepted product/runtime truth.

## 3. Operating model

- Codex is the only real target tool.
- `Codex, rol Anty` is the implementation/executor/code-changing role.
- `Codex, rol Codex` is the readiness/audit/acceptance/canon/read-only role.
- ChatGPT orchestrates sequence and reviews tool-generated exact-next-prompts as drafts.
- The user remains product owner and final decision maker.

## 4. Prompt lint layer

- Prompt-lint examples/fixtures are docs-only source material.
- Prompt Lint Helper v1 is local/manual and prompt-text-only.
- v1 adds structural checks for exact-next-prompt completeness.
- `PROMPT QUALITY GATE CHECK: PASS` alone is not enough.
- v1 is repair-ready in structure, but it does not implement `--repair`.
- Missing authoritative context must block future repair instead of being invented.
- Hooks, automation, evals, and active skill behavior changes remain future work.

## 5. Workflow automation layer

- `tools/workflow/vsm-gate.mjs` is a local/manual lane gate for repo baseline, prompt reliability, QA preflight, and canon checks.
- `tools/workflow/evidence-ledger.mjs` is a local/manual evidence formatter for exact `order_id` / `orders.id` QA facts.
- `skills/vsm-qa-runtime-operator/SKILL.md`, `skills/vsm-evidence-ledger/SKILL.md`, and `skills/vsm-prompt-reliability-operator/SKILL.md` are active repo procedures for repeated operator workflows.
- These helpers and procedures narrow execution. They do not authorize high-risk actions or expand prompt scope.

## 6. Trust and non-claims

- Source/test proof is not browser proof.
- Browser proof is not DB proof.
- Local/pre-prod proof is not production proof.
- Prompt architecture is not runtime enforcement.
- Skill docs are not runtime-installed capabilities unless the environment proves it.

## 7. Current non-claims

- No prompt-lint hook exists yet.
- No product/runtime/source/test behavior changed in this lane.
- No DB/Auth/Supabase/browser QA/production proof is created by this lane.
