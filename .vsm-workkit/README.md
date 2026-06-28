# VSM Store — Work-kit Operativo

Sistema operativo de prompts, auditoría, implementación, QA real y canon para una app de motos para reparto.

Este paquete migra el método operativo maduro de VSM Store, pero lo adapta al dominio de reparto en vsm. No copia claims de VSM ni asume que la app ya está probada.

## Modelo operativo

```text
ChatGPT = orquesta, sintetiza, decide secuencia y redacta prompts.
Codex = audita, readiness, clasifica riesgo, acepta o rechaza.
Antigravity = implementa, valida, ejecuta navegador/local/CLI, commit/push cuando está autorizado.
Usuario = dueño de producto y juez final.
```

## Estructura

```text
AGENTS.md
AI_CONTEXT.md
AUDIT_LOG.md
VSM_STORE_RESUMEN_INTEGRAL_ESTADO_INICIAL.md
docs/
  workkit/
  product/
  operations/
  templates/
  audits/
skills/
  vsm-readiness/
  vsm-implementation/
  vsm-acceptance-audit/
  vsm-canon-reconciliation/
  vsm-real-system-qa/
  vsm-browser-visual-qa/
  vsm-high-risk-lane/
  vsm-controlled-rollout/
```

## Uso recomendado

1. Leer `AGENTS.md`.
2. Leer `AI_CONTEXT.md`.
3. Leer `docs/workkit/README_WORKKIT.md`.
4. Abrir una lane de Codex readiness con `docs/templates/INITIAL_REPO_READINESS_PROMPT.md`.
5. No implementar nada hasta mapear el repo real.

## Regla de oro

Este work-kit no prueba el producto. Solo instala el sistema para trabajar el producto con evidencia, trazabilidad y control.
