# Regla Estricta de Implementación y Autorización (ANTI-TEATRO DE SEGURIDAD)

Esta es una regla fundacional e inquebrantable del repositorio VSM Store. Todo agente de IA debe acatarla sin excepciones. Se han implementado barreras de infraestructura (Git Hooks) para bloquear cualquier desviación.

1. **LA ÚNICA FUENTE DE VERDAD (Eliminación del Split-Brain):**
   * El único archivo maestro que dicta los roles y reglas de los agentes es `.vsm-workkit/AGENTS.md`. Cualquier otra referencia es obsoleta.
   * Debes leer `.vsm-workkit/AGENTS.md` si tienes dudas sobre tu rol o restricciones.

2. **DOCUMENTACIÓN OBLIGATORIA Y EL PRE-COMMIT HOOK:** 
   * Siempre que termines una implementación en código (`.ts`, `.sql`, etc.), es OBLIGATORIO actualizar `AUDIT_LOG.md` y/o `AI_CONTEXT.md` en el mismo commit.
   * ⚠️ **ADVERTENCIA TÉCNICA:** Existe un Hard Gate en `.git/hooks/pre-commit`. Si intentas hacer commit de código fuente sin registrar la evidencia en el Audit Log, el sistema operativo abortará tu commit, la tarea fallará y perderás el tiempo.

3. **EL QUE IMPLEMENTA NO SE AUTORIZA Y EL DUEÑO NO AUDITA:** 
   Bajo el principio de separación de funciones (ver `.vsm-workkit/AGENTS.md`):
   * **El Auditor:** El trabajo del agente implementador (Antigravity) DEBE ser auditado por el agente independiente designado (Codex / Pro). El usuario (dueño) NO audita código manualmente.
   * **La Autorización:** Una vez que Codex emite su reporte de auditoría y se actualizan los logs, se le presentan los resultados al dueño. Solo el dueño tiene la autoridad final para autorizar el paso a Producción. No te auto-apruebes.
