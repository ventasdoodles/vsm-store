# Cesarin AI Eval Harness

Local-only harness for comparing Cesarin model behavior against a fixed golden prompt matrix.

Fixture validation, no network:

```bash
node scripts/ai-eval/cesarin-eval-harness.mjs --mode fixture --models fixture-current,fixture-candidate
```

Optional live model comparison:

```bash
node scripts/ai-eval/cesarin-eval-harness.mjs --mode live --models gemini-2.5-pro,gemini-3.5-flash --iterations 2
```

Artifacts are written under `temp-debug/cesarin-ai-eval/results/`, which is local-only and gitignored.

The harness does not call Supabase, deploy, workflows, DB, ingestion, browser/auth/cache paths, or production runtime flows. Live mode reads `GEMINI_API_KEY` from the local process environment only to call Gemini and never prints it.

## Golden Prompt Philosophy

The matrix is a small regression sentinel suite, not a benchmark catalog. It protects behavior that is costly to regress:

- JSON contract compliance
- business truth for payment and shipping
- product/catalog hallucination resistance
- tool discipline and tool restraint
- clarify-first behavior
- degraded fallback quality
- memory-sensitive behavior
- concise response shape

Keep the suite small. Add prompts only for high-value, regression-prone behavior.

## Gate Philosophy

Each prompt declares an expected `severity`:

- `blocker`: must pass before a runtime/model/prompt/config candidate can be accepted.
- `warning`: requires review, but may be acceptable with an explicit reason.
- `info`: useful drift signal only.

The harness reports blocker, warning, and info failure counts. It intentionally avoids weighted aggregate scores, leaderboard metrics, AI IQ scores, or any fake precision that would hide the actual failure modes.

## Strict JSON vs Extracted JSON

Two JSON signals are reported:

- `strictJsonOnlyCompliance`: the raw model text was exactly one JSON object and nothing else.
- `jsonParseSuccess`: a JSON object could be parsed, including via permissive extraction.

Permissive extraction stays useful for debugging, but strict JSON-only compliance is the runtime contract signal.

## Fallback Validation

The harness validates fallback behavior separately from JSON parsing:

- `fallback_reason` must be valid and match the prompt expectation when specified.
- degraded fallback prompts must produce non-hollow, useful text.
- provider internals, raw error payloads, and secret-shaped strings are flagged.

## Non-Goals

This harness is comparison discipline, regression visibility, and migration support.

It is not:

- a production truth authority
- an automated replacement for human go/no-go review
- a benchmark platform
- a telemetry system
- a dashboard
- an SDK migration path
- a model rollout mechanism
