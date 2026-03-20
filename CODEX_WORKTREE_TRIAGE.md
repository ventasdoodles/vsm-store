# Generated With

- Language model: GPT-5 Codex
- IDE / workspace context: Local IDE workspace provided by the user

# CODEX WORKTREE TRIAGE

## 0. Document Role

This file is parallel memory for working tree triage, commit strategy, and file hygiene.

It is not canon.
It does not replace `AI_CONTEXT.md`.
It does not replace `AUDIT_LOG.md`.
It does not replace `task.md`.
It does not authorize cleanup or commits by itself.

## 1. Current Snapshot Assumed

- Baseline assumed: `Wave 192 = DONE`, `Base Build = v112`
- Antigravity active lane: `Marketing AI Reality Repair`
- Codex parallel lane: worktree triage, ignore-policy radar, commit bucketing
- Current git snapshot observed: modified + untracked mix, with no staged files
- This document must not interfere with the active lane

## 2. Confirmed Triage Findings

### WT-001
- Date: 2026-03-19
- File or group:
  - feature/runtime files under `src/`, `supabase/functions/`, `vite.config.ts`, `public/sw.js`
- Classification:
  - `REVIEW FIRST`
- Why it matters:
  - These are real app/runtime changes and must not be mixed blindly with docs, ledgers, or temp artifacts.
- Evidence status: `CONFIRMED`

### WT-002
- Date: 2026-03-19
- File or group:
  - `CODEX_STRATEGIC_LEDGER.md`
  - `CODEX_CODE_HEALTH_LEDGER.md`
  - `CODEX_WORKTREE_TRIAGE.md`
- Classification:
  - `KEEP OUTSIDE CANON BUT KEEP IN REPO`
- Why it matters:
  - These are parallel ledgers with durable value, but they must stay clearly separated from canonical docs.
- Evidence status: `CONFIRMED`

### WT-003
- Date: 2026-03-19
- File or group:
  - `tmp/*.md`
  - `output/pdf/vsm-store-app-summary.pdf`
  - `tmp/pdfs/generate_app_summary_pdf.ps1`
  - `tmp_debug_res.json`
  - `tsc_output.txt`
  - `tsc_output_utf8.txt`
- Classification:
  - `TEMP / DO NOT COMMIT`
- Why it matters:
  - These are scratch outputs, generated reports, or local diagnostics rather than durable repo artifacts.
- Evidence status: `CONFIRMED`

### WT-004
- Date: 2026-03-19
- File or group:
  - `STORE_FRONT_AI_PILOT_CONTEXT.md`
  - `REPORT_DEPLOY_RUNTIME_PARITY.md`
  - `WAVE_192_BLOCKER_SYNTHESIS.md`
  - `IA_AUDITORIA_EXTERNA.md`
- Classification:
  - `REVIEW FIRST`
- Why it matters:
  - These sit near documentation and can contaminate canon or tactical history if committed without clear role boundaries.
- Evidence status: `CONFIRMED`

### WT-005
- Date: 2026-03-19
- File or group:
  - `simulation_report.json`
  - `src/__tests__/scenarios/cesarin_scenarios.json`
  - `src/__tests__/scenarios/wave191_scenarios.json`
- Classification:
  - `REVIEW FIRST`
- Why it matters:
  - These may be useful validation fixtures, but they also resemble tactical artifacts and must not be bucketed casually.
- Evidence status: `CONFIRMED`

### WT-006
- Date: 2026-03-19
- File or group:
  - `scripts/debug_edge.ts`
  - `clean_files.ps1`
  - `repair_docs.py`
  - `test_fn.ts`
- Classification:
  - `COMMIT LATER`
- Why it matters:
  - These look like tactical or utility scripts whose value depends on explicit retention policy and review of portability.
- Evidence status: `CONFIRMED`

### WT-007
- Date: 2026-03-19
- File or group:
  - root text outputs already tracked, such as `build_errors*.txt`, `debug_*.txt`, `lint_*.txt`, `tsc_errors*.txt`, `typecheck*.txt`, `simulation_report.json`
- Classification:
  - `MAYBE ARCHIVE / DELETE AFTER VALIDATION`
- Why it matters:
  - The repo already contains a large tracked residue of tactical outputs. This is a hygiene issue even when files are not currently untracked.
- Evidence status: `CONFIRMED`

### WT-008
- Date: 2026-03-19
- File or group:
  - ignore policy around `tmp`, `output`, transient diagnostics
- Classification:
  - `SHOULD PROBABLY BE GITIGNORED`
- Why it matters:
  - Current `.gitignore` does not cover several recurring scratch/output patterns that are now visibly accumulating.
- Evidence status: `CONFIRMED`

## 3. Open Triage Questions

### WO-001
- Date: 2026-03-19
- File or group:
  - `simulation_report.json`
- What remains to confirm:
  - Whether it is still an intentionally versioned artifact or should be archived out after validation.
- Risk if classified badly:
  - Could lose a historical artifact or keep committing noisy tactical output.
- Evidence status: `OPEN`

### WO-002
- Date: 2026-03-19
- File or group:
  - `REPORT_DEPLOY_RUNTIME_PARITY.md`
  - `WAVE_192_BLOCKER_SYNTHESIS.md`
  - `IA_AUDITORIA_EXTERNA.md`
- What remains to confirm:
  - Whether these should live as persistent non-canonical repo docs or be archived externally after use.
- Risk if classified badly:
  - Repo doc sprawl and confusion with canonical sources.
- Evidence status: `OPEN`

### WO-003
- Date: 2026-03-19
- File or group:
  - `scripts/debug_edge.ts`
  - `clean_files.ps1`
  - `repair_docs.py`
  - `test_fn.ts`
- What remains to confirm:
  - Which scripts are durable utilities vs one-off repair tools.
- Risk if classified badly:
  - Keeping stale scripts permanently or deleting a tool that still has operational value.
- Evidence status: `OPEN`

### WO-004
- Date: 2026-03-19
- File or group:
  - `tmp/`
- What remains to confirm:
  - Whether `tmp/` is intended to remain partly tracked for utility scripts or should only host local scratch.
- Risk if classified badly:
  - Overbroad ignore rules could hide useful utilities, while underbroad rules keep surfacing scratch files in the worktree.
- Evidence status: `OPEN`

## 4. Discarded False Positives

### WD-001
- Date: 2026-03-19
- Original suspicion:
  - The worktree might already have staged material that needs immediate commit triage.
- Why it was discarded:
  - `git diff --cached --name-only` returned empty.
- Evidence status: `DISCARDED`

### WD-002
- Date: 2026-03-19
- Original suspicion:
  - `tmp/` can be blanket-ignored safely.
- Why it was discarded:
  - `tmp/` already contains tracked utility files such as `tmp/analyze_tags.ts` and migration helpers.
- Evidence status: `DISCARDED`

### WD-003
- Date: 2026-03-19
- Original suspicion:
  - All markdown support docs should be treated as canonical-adjacent.
- Why it was discarded:
  - Several are clearly parallel or tactical, not canonical, and should not be bucketed with canon docs.
- Evidence status: `DISCARDED`

## 5. Commit Bucket Proposal

### Bucket 1. Active App / Runtime Changes
- Probable files:
  - modified `src/`
  - modified `supabase/functions/`
  - `public/sw.js`
  - `vite.config.ts`
- Reason:
  - Real product/runtime work
- Do not mix:
  - ledgers, scratch docs, output files, tactical one-off scripts
- Readiness:
  - `REVIEW FIRST`

### Bucket 2. Canon / Tactical Documentation
- Probable files:
  - `STORE_FRONT_AI_PILOT_CONTEXT.md`
  - other closure/tactical docs after review
- Reason:
  - Documentation changes need a clean history separate from product code
- Do not mix:
  - runtime code, ledgers, temp outputs
- Readiness:
  - `REVIEW FIRST`

### Bucket 3. Parallel Ledgers
- Probable files:
  - `CODEX_STRATEGIC_LEDGER.md`
  - `CODEX_CODE_HEALTH_LEDGER.md`
  - `CODEX_WORKTREE_TRIAGE.md`
- Reason:
  - Durable non-canonical memory
- Do not mix:
  - canon docs, app changes, temp scratch
- Readiness:
  - `COMMIT LATER`

### Bucket 4. Durable Utility Scripts
- Probable files:
  - scripts or root helpers that survive review
- Reason:
  - Utility tools deserve their own explicit retention decision
- Do not mix:
  - product runtime changes or scratch outputs
- Readiness:
  - `REVIEW FIRST`

### Bucket 5. Scratch / Temp / Generated Outputs
- Probable files:
  - `tmp/*.md`
  - `output/`
  - `tmp_debug_res.json`
  - `tsc_output*.txt`
- Reason:
  - Local work products, generated artifacts, or transient diagnostics
- Do not mix:
  - any durable bucket
- Readiness:
  - `TEMP / DO NOT COMMIT`

## 6. Ignore / Exclusion Candidates

- `output/`
  - Justification:
    - generated output directory now contains PDF artifacts
  - Risk if versioned:
    - noisy binary churn and machine-local output history

- `tmp/*.md`
  - Justification:
    - current use strongly resembles scratch/export staging
  - Risk if versioned:
    - repo doc sprawl and support-note contamination

- `tmp/pdfs/`
  - Justification:
    - generation helpers for temp export workflows
  - Risk if versioned:
    - keeps ephemeral export tooling mixed with durable repo logic

- `tmp_debug_res.json`
  - Justification:
    - debug result artifact by naming and usage pattern
  - Risk if versioned:
    - accidental debug residue in history

- `tsc_output*.txt`
  - Justification:
    - transient local typecheck output pattern
  - Risk if versioned:
    - repetitive low-signal diffs

## 7. Prompt Seeds

### Seed 1
Run a worktree hygiene pass that classifies tracked/untracked artifacts into durable repo memory, real product changes, and temp outputs, without deleting or editing anything.

### Seed 2
Audit ignore-policy gaps around `output/`, scratch markdown, and local diagnostic outputs, but do not apply `.gitignore` changes yet.

### Seed 3
Prepare a commit bucketing plan that isolates runtime/app changes from canon docs, parallel ledgers, tactical scripts, and generated outputs.

## 8. Priority Snapshot

- What must not be touched:
  - Antigravity’s active lane
  - canonical docs without deliberate review
  - mixed commits that combine runtime, docs, ledgers, and scratch artifacts

- What can already be ordered:
  - separate ledgers from canon
  - isolate scratch outputs as non-commit material
  - hold runtime files for explicit review

- Safest next operational move:
  - review and bucket the modified/untracked set before any commit attempt
  - do not commit temp outputs
  - do not mix tactical docs with runtime code
