# README WORKKIT

## Proposito
Este directorio concentra el work-kit canonico del sistema de prompting y handoff de VSM Store.
Si vas a abrir, delegar, auditar o reconciliar un frente, entra por aqui.

## Orden de lectura
1. `PROMPT-SYSTEM-RULES-—-IMMUTABLE.txt`
2. `CONTEXTO-MAESTRO,-BASE-OPERATIVA-y-HANDOFF-CANÓNICO.txt`
3. `PROMPT_SIZING_POLICY_VSM_STORE.md`
4. `CONTEXTO_TEMPORAL_ACTUAL.md`
5. `PROMPT_LIBRARY_TEMPLATES.txt`
6. `CONTEXTO-TEMPORAL-—-TEMPLATE.txt` solo si vas a renovar el contexto temporal
7. `ORQUESTACION-MAESTRA-GEM-y-HANDOFF-CANONICO.md` solo si aplica una consulta o handoff heredado de Gemini

## Que hace cada archivo
- `PROMPT-SYSTEM-RULES-—-IMMUTABLE.txt`: reglas fijas del metodo
- `CONTEXTO-MAESTRO,-BASE-OPERATIVA-y-HANDOFF-CANÓNICO.txt`: roles, fronteras y bootstrap minimo
- `PROMPT_SIZING_POLICY_VSM_STORE.md`: cuanto contexto cargar segun tarea y riesgo
- `CONTEXTO_TEMPORAL_ACTUAL.md`: memoria viva del bloque actual
- `PROMPT_LIBRARY_TEMPLATES.txt`: plantillas operativas por tipo de prompt
- `CONTEXTO-TEMPORAL-—-TEMPLATE.txt`: molde para reemplazar el contexto temporal actual
- `ORQUESTACION-MAESTRA-GEM-y-HANDOFF-CANONICO.md`: suplemento heredado, no rector general
- `PROMPT-KIT-—-USAGE-GUIDE.txt`: guia de uso diario del kit

## Regla rapida
- Lo inmutable manda sobre lo temporal.
- El contexto temporal no reabre lanes cerrados.
- La sizing policy regula tamano, no verdad.
- Las plantillas ayudan a escribir, no autorizan trabajo por si mismas.
