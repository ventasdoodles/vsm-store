# VSM Store — Workflow Optimization Protocol

## Flujo estándar

```text
1. Codex readiness + exact prompt
2. Codex, rol Anty implementation + validation + commit/push
3. Codex acceptance audit + canon prompt
4. Codex, rol Codex canon reconciliation + commit/push
5. ChatGPT/User close + next route
```

## Execution Blocks

Para LOW/MEDIUM:

- Lane 1 executable now.
- Lane 2 conditional.
- Lane 3 conditional.
- Lane 4 reserve/stop-refresh.

Reglas:

- WIP = 1.
- Acceptance independiente después de cada implementation commit.
- Canon solo después de ACCEPT.
- Si aparece high-risk, fresh readiness.

## Evidence ladder

1. source/test.
2. local browser.
3. local auth/session.
4. local/pre-prod reversible mutation.
5. DB read proof.
6. dummy customer/rider/delivery flow.
7. admin delivery observability.
8. controlled live smoke.
9. monitored real-courier rollout.
