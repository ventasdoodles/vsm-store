# README WORKKIT

## Proposito
Este directorio es el punto de entrada al work-kit canonico de prompting y handoff de VSM Store.
Si vas a abrir, delegar, auditar o reconciliar un frente, empieza aqui despues de leer el perfil repo-level `AGENTS.md`.

Para la guia detallada de uso diario, roles de cada archivo, autoridad rapida y errores comunes, lee `PROMPT-KIT-—-USAGE-GUIDE.txt`.

## Relacion con AGENTS.md
- `AGENTS.md` es el primer perfil operativo para Codex dentro del repo.
- Este directorio conserva el work-kit canonico para ChatGPT, Antigravity, handoffs y consultas de mayor detalle.
- Carga solo los archivos del work-kit que el tipo de lane necesita; no conviertas plantillas o suplementos en fuentes activas por defecto.

## Orden de lectura
1. `PROMPT-SYSTEM-RULES-—-IMMUTABLE.txt`
2. `CONTEXTO-MAESTRO,-BASE-OPERATIVA-y-HANDOFF-CANÓNICO.txt`
3. `PROMPT_SIZING_POLICY_VSM_STORE.md`
4. `CONTEXTO_TEMPORAL_ACTUAL.md`
5. `PROMPT_LIBRARY_TEMPLATES.txt`
6. `CONTEXTO-TEMPORAL-—-TEMPLATE.txt` solo si vas a renovar el contexto temporal
7. `ORQUESTACION-MAESTRA-GEM-y-HANDOFF-CANONICO.md` solo si aplica una consulta o handoff heredado de Gemini
8. `VSM_WORKFLOW_OPTIMIZATION_PROTOCOL.md` y `VSM_PHASE_COMBINATION_RISK_MATRIX.md` como guias suplementarias para decidir flujo, combinacion de fases y riesgo
