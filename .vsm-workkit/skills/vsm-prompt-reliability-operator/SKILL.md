---
name: vsm-prompt-reliability-operator
description: Use for Ya VOY prompt quality gates, prompt-lint, scorecard, repair evals, reliability smoke, fail-code interpretation, and blocking unsafe exact-next-prompts before execution.
---

# VSM Store Prompt Reliability Operator

## Required Behavior

- Treat generated exact-next-prompts as drafts until reviewed.
- Run the local/manual reliability stack when prompt quality is in scope:
  - `node tools\prompt-lint\reliability-smoke.mjs --json`
  - or `node tools\workflow\vsm-gate.mjs --lane prompt --json`
- Use `tools\prompt-lint\scorecard.mjs <file> --json` for a single prompt/report.
- If any hard fail appears, block execution and report fail codes.
- Do not claim hook, CI, runtime enforcement, semantic AI judging, product/runtime proof, browser proof, DB/Auth/Supabase proof, or production readiness.
- Missing authoritative context must block repair rather than being invented.

## Output

1. PROMPT / REPORT TARGET
2. COMMANDS RUN
3. FAIL CODES
4. SCORECARD / SMOKE SUMMARY
5. BLOCKED OR PASS
6. REQUIRED HUMAN REVIEW
7. NON-CLAIMS
