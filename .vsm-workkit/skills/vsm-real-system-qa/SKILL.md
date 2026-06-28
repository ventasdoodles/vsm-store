# VSM Store Procedure — Real-System QA

## Required behavior

- Definir environment target.
- Usar dummy data cuando aplique.
- Usar mutaciones reversibles solo si están autorizadas.
- Usar `orders.id` / `order_id` como proof key primario.
- Tratar `order_number` o folios como etiquetas auxiliares, no como prueba primaria.
- Evitar secrets/session/storage inspection.
- Separar UI, DB, provider, live y production evidence.
- Preservar non-claims.

## Output

1. ENVIRONMENT TARGET
2. EVIDENCE LADDER POSITION
3. DUMMY DATA USED
4. CHECKS PERFORMED
5. UI OBSERVATIONS
6. DB OBSERVATIONS
7. MUTATIONS / ROLLBACK
8. ACCEPTED CLAIMS
9. NON-CLAIMS
10. BLOCKERS
11. GO / NO-GO
