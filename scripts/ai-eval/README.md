# Cesarin AI Eval Harness

Local-only harness for comparing Cesarin model behavior against a fixed golden prompt matrix.

Fixture validation, no network:

```bash
node scripts/ai-eval/cesarin-eval-harness.mjs --mode fixture --models fixture-current,fixture-candidate
```

Fixture mode validates harness mechanics only. It does not prove live provider capacity, model quality, or production readiness.

Optional live model comparison:

```bash
node scripts/ai-eval/cesarin-eval-harness.mjs --mode live --models gemini-2.5-pro,gemini-3.5-flash --iterations 2
```

Lower-pressure live evidence pass:

```bash
node scripts/ai-eval/cesarin-eval-harness.mjs --mode live --models gemini-2.5-pro,gemini-3.5-flash --subset blocker-critical --low-pressure
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

## Focused Subsets

The matrix includes named subsets for lower-noise live runs:

- `blocker-critical`: compact high-risk blocker pass.
- `payment-shipping`: payment, shipping, and unsupported delivery truth.
- `clarify-first`: ambiguity and URL restraint behavior.
- `tool-discipline`: catalog, RAG, private order, public web, and no-tool boundaries.
- `fallback-only`: fallback reason and degraded fallback quality.

The subsets are operational filters only. They do not change the prompt text, runtime contract, generation config, or evaluation gates.

## Gate Philosophy

Each prompt declares an expected `severity`:

- `blocker`: must pass before a runtime/model/prompt/config candidate can be accepted.
- `warning`: requires review, but may be acceptable with an explicit reason.
- `info`: useful drift signal only.

The harness reports blocker, warning, and info failure counts. It intentionally avoids weighted aggregate scores, leaderboard metrics, AI IQ scores, or any fake precision that would hide the actual failure modes.

Quota and rate-limit failures are reported separately from behavioral failures. A quota-empty response is operational noise, not proof of hallucination, but it still remains visible through `quotaFailure`, `operationalFlags`, and per-model quota counts.

Behavioral evidence requires stable, evaluable live responses. Under unstable quota conditions, model-quality conclusions are invalid.

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

## Low-Pressure Controls

Use these controls to reduce quota distortion during live comparison:

- `--subset name` runs a named matrix subset.
- `--categories a,b` runs only matching prompt categories.
- `--prompt-ids a,b` runs only specific prompt ids.
- `--limit-prompts n` caps the selected prompt list.
- `--request-delay-ms n` waits between live requests.
- `--low-pressure` uses sequential live mode with a conservative default delay.
- `--max-retries n` changes live retry count for diagnostics.
- `--max-output-tokens n` caps live output size for request-shape probes.
- `--temperature n` keeps temperature explicit in run metadata.

All live runs remain sequential. These controls improve evidence quality by isolating categories and reducing retry pressure; they do not soften blockers.

Live result artifacts include per-attempt timing/status metadata, retry exhaustion, retry-after headers when present, provider finish reasons, token-count metadata when returned, sanitized provider error detail types, and quota-failure distribution. This is local operational evidence only.

## Live Readiness Governance

A live comparison window is trustworthy only when low-pressure probes return repeated evaluable responses without quota failure, retry exhaustion, malformed output, or empty output dominating the evidence.

If a one-prompt, one-model low-pressure probe returns an immediate `429` or `quota_failure`, stop expansion. Do not run broad live suites, compare models, or reinterpret the quota failure as a behavioral regression.

Run `blocker-critical` expansion only after the same low-pressure conditions produce repeated evaluable responses. The expansion should stay small, preserve the existing gates, and stop again if provider instability returns.

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
