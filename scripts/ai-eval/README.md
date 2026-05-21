# Cesarín AI Eval Harness

Local-only harness for comparing Césarín model behavior against a fixed prompt matrix.

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
