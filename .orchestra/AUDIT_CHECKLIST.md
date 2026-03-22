# ✅ Audit Checklist — Orchestra Auditor Reference

> **El auditor sigue este checklist para cada reporte en `inbox/`.**
> Cada sección tiene criterios de PASS/FAIL. Un solo FAIL = rechazo + nuevo prompt.

---

## Phase 1: Report Integrity (¿El reporte está completo?)

- [ ] **Tiene scope definido** — el reporte indica claramente qué se hizo y qué NO se tocó
- [ ] **Lista archivos modificados** — con paths completos
- [ ] **Describe cada cambio** — no solo "se mejoró X", sino qué líneas/funciones/tipos cambiaron
- [ ] **Indica resultado de build** — ¿typecheck/lint/build pasaron?
- [ ] **No tiene TODOs abiertos sin justificación** — si dejó TODOs, explica por qué

> **FAIL si:** El reporte es vago, no lista archivos, o no reporta estado del build.

---

## Phase 2: Vision Alignment (¿Respeta la visión del proyecto?)

Comparar contra `.orchestra/VISION.md`:

- [ ] **Flujo unidireccional** — ningún componente importa de services/supabase
- [ ] **TypeScript estricto** — sin `any`, sin `as X` innecesarios, sin `@ts-ignore`
- [ ] **Modularidad** — sin imports circulares, features autocontenidas
- [ ] **Sistema temático** — sin colores hardcodeados
- [ ] **Sin dependencias nuevas injustificadas** — si agregó npm packages, hay razón documentada
- [ ] **Sin scope creep** — no hizo refactors masivos no solicitados

> **FAIL si:** Viola cualquier principio fundamental listado en VISION.md.

---

## Phase 3: Scope Discipline (¿Se mantuvo dentro del scope?)

- [ ] **Solo tocó archivos dentro del scope asignado** — no "ya que estaba, arreglé esto otro"
- [ ] **No abrió waves nuevos** — sin cambios de versions/estados no autorizados
- [ ] **No tocó persona.ts sin autorización** — el tono de Cesarín es sagrado
- [ ] **No modificó routing de capsules sin justificación** — riesgo de regresión AI
- [ ] **No eliminó funcionalidad sin justificación** — feature flags ok, borrar código no

> **FAIL si:** Tocó archivos fuera del scope sin justificación explícita.

---

## Phase 4: Code Quality (¿El código es bueno?)

- [ ] **Named exports** — sin default exports
- [ ] **Imports con @/ alias** — no relative imports fuera de la carpeta
- [ ] **Error handling** — try/catch donde corresponde, no fire-and-forget
- [ ] **Sin console.log** — solo console.error/warn permitidos
- [ ] **Tipos explícitos** — no infiere donde debería declarar

> **FAIL si:** Múltiples violaciones de calidad que indican trabajo descuidado.

---

## Phase 5: Documentation (¿Actualizó la documentación?)

- [ ] **AI_CONTEXT.md actualizado** — si tocó estructura, features, o decisiones
- [ ] **Comentarios en código** — cambios no triviales tienen JSDoc o comentarios
- [ ] **Sin documentación falsa** — no dice "funciona" sin haber verificado

> **FAIL si:** Cambió código pero no actualizó AI_CONTEXT.md cuando era necesario.

---

## Veredicto

| Resultado | Criterio | Acción |
|---|---|---|
| ✅ **APPROVED** | Todas las phases PASS | Mover a `approved/`, actualizar `ledger.md` |
| ⚠️ **APPROVED WITH NOTES** | Todas PASS pero con observaciones menores | Mover a `approved/`, documentar notas en `ledger.md` |
| ❌ **REJECTED** | Cualquier phase FAIL | Mover a `rejected/`, generar prompt correctivo en `outbox/`, documentar en `ledger.md` |

---

## Template de Veredicto (para ledger.md)

```markdown
### [FECHA] — Auditoría: {nombre del reporte}

- **Agente:** {Codex/GPT/Claude/etc.}
- **Scope:** {descripción breve}
- **Veredicto:** ✅ APPROVED / ⚠️ APPROVED WITH NOTES / ❌ REJECTED
- **Archivos revisados:** {lista}
- **Notas:** {observaciones}
- **Acción siguiente:** {ninguna / prompt correctivo generado en outbox/}
```

---

_Checklist v1.0 — 2026-03-22._
