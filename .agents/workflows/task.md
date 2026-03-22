---
description: Crear un nuevo prompt de tarea para un agente externo del pipeline Orchestra
---

# /task — Generar Prompt para Agente Externo

## Contexto
Generamos un prompt estructurado para darle a un agente externo (Codex, GPT, Claude, etc.)
usando las plantillas de `.orchestra/PROMPT_TEMPLATES.md`.

## Pasos

1. **Preguntar al usuario:**
   - ¿Cuál es la tarea? (descripción del objetivo)
   - ¿Qué archivos involucra?
   - ¿Qué NO debe tocar? (fronteras del scope)
   - ¿A qué agente va dirigido? (Codex, GPT, etc.)

2. **Leer plantillas:**
   - Lee `.orchestra/PROMPT_TEMPLATES.md` para usar `TASK_PROMPT_TEMPLATE`
   - Lee `.orchestra/VISION.md` para incluir restricciones relevantes

3. **Construir el scope:**
   - Usa `SCOPE_DEFINITION_TEMPLATE` internamente para pensar el scope
   - Identifica archivos relevantes y léelos para incluir contexto preciso

4. **Generar el prompt:**
   - Usa `TASK_PROMPT_TEMPLATE` llenando todos los campos
   - Incluir la plantilla `REPORT_TEMPLATE` al final para que el agente sepa cómo reportar
   - Guardar en `.orchestra/outbox/` con nombre: `{fecha}_{hora}_prompt_{scope}.md`

5. **Presentar al usuario:**
   - Mostrar resumen del prompt generado
   - Confirmar que el scope es correcto antes de que lo envíe al agente
