---
name: vsm-auditor
description: Ejecuta la auditoría agresiva y destructiva (Red-Green hardening) sobre un archivo o módulo.
---

# VSM Auditor Skill

Esta habilidad automatiza la fase de auditoría agresiva (Adversarial Hardening) en el repositorio `vsm-store`.

## Cuándo usar esta habilidad
Úsala cuando el usuario solicite "auditar", "harden", "destrozar y arreglar" o "aplicar Red-Green" a un archivo, componente o módulo específico.

## Instrucciones de Ejecución

1. **Requisito Previo (Baseline):**
   Siempre debes ejecutar primero el chequeo del Work-Kit:
   `node "C:\dev\vsm-store-fresh\.vsm-workkit\tools\workflow\vsm-gate.mjs" --lane repo-baseline`
   Si no pasa, infórmale al usuario y detente.

2. **Invocación del Subagente:**
   Lanza un subagente utilizando la herramienta `invoke_subagent` con el rol `Adversarial Code Auditor` y el modelo `pro`.
   El prompt del subagente DEBE incluir:
   - "Tear apart and stress-test the target file [RUTA DEL ARCHIVO] and its test suite."
   - "Hunt down edge cases, memory leaks, strict typing flaws, state mutations, and accessibility issues."
   - "Execute & Fix: Fix the weaknesses directly. Run `npm run typecheck` and `npm run test:run`."
   - "Report back the flaws found and fixes applied."

3. **Revisión y Commit:**
   Una vez que el subagente regrese con el reporte exitoso y el código verde:
   - Haz un `git add` del archivo modificado y sus pruebas.
   - Haz un `git commit` con el mensaje: `refactor(audit): harden [modulo] against [vulnerabilidades]`
   - Haz un `git push` a `origin/main` (o la rama actual).

4. **Reporte al Usuario:**
   No resumas la implementación técnica paso a paso. Muéstrale al usuario únicamente las balas de los "Vectores de Ataque" que se neutralizaron y confírmale que el código fue commiteado, validado y empujado.
