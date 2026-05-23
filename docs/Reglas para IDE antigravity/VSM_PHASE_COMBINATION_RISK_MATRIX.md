# VSM Store — Matriz de Riesgo y Combinación de Fases

**Tipo:** Fuente operativa / guía de decisión rápida
**Proyecto:** VSM Store
**Uso:** Determinar cuándo se pueden combinar pasos del flujo y cuándo no.
**Autoridad:** Complementa el protocolo optimizado de flujo de trabajo. No reemplaza reglas inmutables ni canon.

---

## 1. Propósito

Esta matriz ayuda a decidir si un hito puede ejecutarse en flujo corto o si requiere protocolo completo.

La pregunta central:

```text
¿Qué fases se pueden combinar sin perder calidad?
```

---

## 2. Matriz rápida

| Tipo de tarea | Readiness previa | Implementación + validación + push | Acceptance audit | Canonización | Flujo recomendado |
|---|---:|---:|---:|---:|---|
| Comentario/copy/doc menor | Opcional | Sí | Ligera | Si aplica | Corto |
| CSS simple/UI menor | Opcional o breve | Sí | Sí | Si afecta canon | Corto/medio |
| Componente frontend | Sí | Sí | Sí | Sí si afecta verdad operativa | Medio |
| Service/query | Sí | Sí | Sí | Sí | Medio |
| Workflow/CI | Sí | Sí | Sí | Sí | Medio/alto |
| Deploy/secrets | Sí obligatorio | Por fases | Sí fuerte | Sí | Alto |
| DB/migrations/Supabase | Sí obligatorio | Por fases | Sí fuerte | Sí | Alto |
| Checkout/payments/provider | Sí obligatorio | Por fases | Sí fuerte | Sí | Alto |
| AI/Césarín runtime | Sí obligatorio | Por fases | Sí fuerte | Sí | Alto |
| Product Search/retrieval | Sí obligatorio | Por fases | Sí fuerte | Sí | Alto |

---

## 2.1 Skill-enabled execution

| Tipo de tarea | Skill-enabled execution allowed? | Regla |
|---|---:|---|
| Comentario/copy/doc menor | Si | Puede combinar readiness + implementation + local validation si el scope es claro. |
| CSS simple/UI menor | Si, con cuidado | Puede ejecutar y validar localmente; browser QA solo si se autoriza. |
| Componente frontend | Si | Implementation + local validation puede combinarse; acceptance separada si afecta comportamiento visible. |
| Service/query | Si, con acceptance separada | No convertir pruebas locales en DB/Supabase o production proof. |
| Workflow/CI | Limitado | Requiere scope explicito; no deploy o workflow run por Skill sola. |
| Deploy/secrets | No por si misma | Skills no autorizan deploy, secrets, auth ni inspeccion de valores. |
| DB/migrations/Supabase | No por si misma | Requiere autorizacion explicita y fases separadas. |
| Checkout/payments/provider | No por si misma | Requiere protocolo high-risk y acceptance fuerte. |
| AI/Cesarin runtime | No por si misma | Requiere protocolo high-risk, provider boundaries y non-claims. |
| Product Search/retrieval | No por si misma | Requiere protocolo high-risk; no inferir quality/runtime proof. |

Una Skill nunca autoriza DB/Supabase, deploy, auth, secrets, payment/provider, Product Search, Cesarin runtime, production smoke o live smoke por si misma.

---

## 3. Flujos permitidos

### Flujo corto

Usar solo si el cambio es bajo riesgo y de scope pequeño.

```text
1. Antigravity implementa + valida + commit/push
2. Codex acceptance audit
3. Antigravity canoniza si aplica
4. ChatGPT cierra
```

Permitido para:

```text
- comentario
- copy menor
- typo
- link claramente roto
- ajuste CSS simple
- doc pequeño
```

---

### Flujo medio

Usar por defecto para cambios normales.

```text
1. Codex readiness + exact prompt
2. Antigravity implementa + valida + commit/push
3. Codex acceptance + canon prompt
4. Antigravity canoniza + push
5. ChatGPT cierra
```

Permitido para:

```text
- frontend
- workflows no críticos
- servicios pequeños
- UX acotado
- pruebas o smoke locales
```

---

### Flujo alto riesgo

Usar para infra, producción, datos, seguridad o IA sensible.

```text
1. Codex readiness
2. Antigravity fase segura
3. Codex re-audit si aparece nuevo riesgo
4. Antigravity implementación acotada
5. Antigravity validación/smoke
6. Codex acceptance audit
7. Antigravity canonización
8. ChatGPT cierra
```

Requerido para:

```text
- secrets
- auth
- deploy
- workflow_dispatch
- Cloudflare
- Supabase remoto
- DB push/reset
- migrations
- checkout/payment/provider
- AI/Césarín runtime
- Product Search/retrieval/embeddings
```

---

## 4. Combinaciones permitidas

### Sí: Codex readiness + prompt de implementación

Codex puede hacer:

```text
- leer canon
- clasificar riesgo
- decidir GO / NO-GO
- entregar prompt exacto para Antigravity
```

---

### Sí: Antigravity implementación + validación + commit/push

Antigravity puede hacer:

```text
- editar
- probar
- validar diff
- commit
- push
```

siempre que el scope esté autorizado.

---

### Sí: Codex acceptance + prompt de canon

Codex puede hacer:

```text
- auditar commit
- aceptar/rechazar
- producir prompt exacto de canonización
```

---

### Sí: Antigravity canonización + commit/push

Antigravity puede hacer:

```text
- actualizar docs/canon
- validar
- commit
- push
```

si existe aceptación previa.

---

## 5. Combinaciones prohibidas

### No: Antigravity implementa y se acepta a sí mismo

Motivo:

```text
juez y parte
```

---

### No: Implementar y canonizar sin acceptance audit

Motivo:

```text
canon puede registrar claims inflados o no probados
```

---

### No: Fix + deploy + canonización en una sola orden

Motivo:

```text
si falla el deploy, cambia el diagnóstico y se contamina el canon
```

---

### No: Leer o copiar secretos a logs/chat

Motivo:

```text
un secreto visible deja de ser secreto
```

---

### No: Reabrir lanes cerrados sin canon nuevo

Motivo:

```text
se pierde continuidad y se infla backlog
```

---

## 6. Señales para usar flujo alto riesgo

Usar protocolo fuerte si aparece cualquiera de estas señales:

```text
- GitHub Actions
- Cloudflare
- secrets
- tokens
- auth
- 2FA
- remote Supabase
- DB push/reset
- migrations
- production
- checkout/payment
- provider integration
- AI runtime
- embeddings/vector search
- Product Search
- PII/customer data
```

---

## 7. Señales para flujo corto

Se puede usar flujo corto si todo esto es cierto:

```text
- 1 a 2 archivos
- sin secrets
- sin DB
- sin deploy
- sin runtime crítico
- sin auth
- sin provider/payment
- sin Product Search/AI runtime
- fácil de validar
- rollback obvio
```

---

## 8. Checklist antes de commit/push

Antigravity debe confirmar:

```text
- git status -sb
- diff scope exacto
- no archivos no autorizados staged
- validación ejecutada
- commit message correcto
- push normal, no force, salvo autorización explícita
- post-push origin/main alineado
```

---

## 9. Checklist antes de acceptance audit

Codex debe confirmar:

```text
- commit inspeccionado
- files changed
- diff scope
- evidencia de validación
- claims probados
- non-claims
- residual risks
- no secretos
- no cambios fuera de scope
```

---

## 10. Checklist antes de canonización

Antigravity debe confirmar:

```text
- existe ACCEPT / ACCEPT WITH RESIDUAL RISK
- qué claims deben registrarse
- qué non-claims deben preservarse
- qué residuales deben quedar vivos
- qué docs deben actualizarse
- no se inventan resultados
```

---

## 11. Criterio de cierre

Un frente se puede declarar cerrado cuando:

```text
- implementación está pusheada
- acceptance audit aceptó
- canon/docs están actualizados si aplica
- main = origin/main
- residuales están explícitos
- non-claims están claros
- no hay acción inmediata pendiente
```

---

## 12. Regla final

```text
Combinar fases es bueno.
Mezclar responsabilidades es peligroso.

El flujo ideal no es el más corto.
Es el más corto que todavía deja evidencia, auditoría y canon limpio.
```
