# VSM Store — Skill Usage Policy

## Regla central

```text
Skills are procedural, not authoritative.
```

Una skill estrecha ejecución; no amplía scope.

## Skills soportadas

- `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-readiness\SKILL.md`
- `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-implementation\SKILL.md`
- `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-acceptance-audit\SKILL.md`
- `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-canon-reconciliation\SKILL.md`
- `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-real-system-qa\SKILL.md`
- `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-browser-visual-qa\SKILL.md`
- `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-high-risk-lane\SKILL.md`
- `C:\dev\vsm-store-fresh\.vsm-workkit\skills\vsm-controlled-rollout\SKILL.md`

Si una ruta exacta no existe, detener con `FAIL_SKILL_PATH_NOT_FOUND`.

## No autorizan por sí solas

- DB/migrations.
- Auth/session/secrets.
- Pagos.
- GPS/tracking.
- Producción.
- Proveedores.
- Notificaciones reales.
- Datos personales.

## Prompt skill-aware

Debe incluir:

- `USE REPO PROCEDURE ABSOLUTE PATH: C:\dev\vsm-store-fresh\.vsm-workkit\skills\<name>\SKILL.md`;
- tipo de lane;
- mission objective;
- scope;
- forbidden actions;
- evidence/validation;
- `FOLLOW THE PROCEDURE'S REQUIRED OUTPUT FORMAT`;
- success condition.

No usar rutas relativas para procedures. No presentar una repo procedure como capacidad instalada del runtime si el entorno no lo demuestra.
