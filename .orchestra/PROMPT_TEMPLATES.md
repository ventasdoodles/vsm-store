# 📋 Prompt Templates — Orchestra System

> **Plantillas para generar prompts y reportes dentro del pipeline de orquestación.**
> Usadas por el auditor para rechazos, y por tí para comisionar trabajo a agentes externos.

---

## 1. REPORT_TEMPLATE — Para Agentes Externos

> Dale esta plantilla al agente externo (Codex, GPT, etc.) junto con su tarea.
> Le indica EXACTAMENTE cómo reportar su trabajo.

````markdown
# Reporte de Ejecución

## Metadata
- **Agente:** {nombre del modelo/herramienta}
- **Fecha:** {YYYY-MM-DD HH:MM}
- **Scope asignado:** {descripción de la tarea original}
- **Duración estimada:** {tiempo que tomó}

## Scope Ejecutado
{Descripción clara de qué se hizo y qué NO se tocó.}

## Archivos Modificados

| Archivo | Tipo de cambio | Descripción |
|---|---|---|
| `path/to/file.ts` | Modificado | {qué cambió y por qué} |
| `path/to/new.ts` | Creado | {propósito del archivo} |
| `path/to/old.ts` | Eliminado | {justificación} |

## Cambios Detallados

### {Nombre del cambio 1}
**Archivo:** `path/to/file.ts`
**Líneas:** {rango aproximado}
**Antes:**
```typescript
// código anterior
```
**Después:**
```typescript
// código nuevo
```
**Razón:** {por qué se hizo este cambio}

### {Nombre del cambio 2}
...

## Estado del Build
- [ ] `npm run typecheck` — {0 errores / N errores (listar)}
- [ ] `npm run lint` — {0 errores / N errores (listar)}
- [ ] `npm run build` — {exitoso / fallido (reason)}

## Tests
- [ ] Tests existentes pasan: {sí/no}
- [ ] Tests nuevos agregados: {sí (cuáles) / no (justificación)}

## Documentación
- [ ] AI_CONTEXT.md actualizado: {sí / no / no necesario (razón)}
- [ ] Comentarios en código: {sí / no necesario}

## TODOs / Deuda Técnica
{Lista de cosas que NO se completaron con justificación, o "Ninguno".}

## Notas para el Auditor
{Cualquier decisión importante, trade-off, o cosa que el auditor debe saber.}
````

---

## 2. TASK_PROMPT_TEMPLATE — Para Comisionar Trabajo

> Usa esta plantilla para crear prompts que le darás a un agente externo.

````markdown
# Tarea: {título descriptivo}

## Contexto
Eres una IA ejecutora de código en el proyecto VSM Store. Lee el archivo 
`AI_CONTEXT.md` en la raíz del proyecto COMPLETO antes de hacer cualquier cambio.
Es la fuente de verdad absoluta.

**Stack:** React 18 + TypeScript strict + Vite + Supabase + Zustand + React Query
**Deploy:** Cloudflare Pages (push to main = auto deploy)

## Reglas Absolutas
1. **Flujo unidireccional:** DB → Services → Hooks → Components. NUNCA al revés.
2. **TypeScript estricto:** Sin `any`, sin `as X` innecesarios, sin `@ts-ignore`.
3. **Sin scope creep:** Haz SOLO lo que se indica. No "mejores" nada más.
4. **Build limpio:** Antes de reportar: `npm run typecheck && npm run lint && npm run build` = 0 errores.
5. **Actualiza AI_CONTEXT.md** si cambias estructura, features, o decisiones.

## Scope Exacto
{Descripción precisa de qué hacer}

### Qué SÍ hacer:
- {acción 1}
- {acción 2}

### Qué NO hacer:
- {restricción 1}
- {restricción 2}

## Archivos Involucrados
- `path/to/file1.ts` — {qué cambiar aquí}
- `path/to/file2.ts` — {qué cambiar aquí}

## Criterio de Éxito
- {criterio 1}
- {criterio 2}
- Build limpio (typecheck + lint + build = 0 errores)

## Reporte
Al terminar, escribe tu reporte siguiendo EXACTAMENTE la plantilla en 
`.orchestra/PROMPT_TEMPLATES.md`, sección "REPORT_TEMPLATE".
Guarda el reporte en `.orchestra/inbox/` con el nombre:
`{YYYY-MM-DD}_{HH-MM}_{tu-nombre}_{scope}.md`
````

---

## 3. CORRECTIVE_PROMPT_TEMPLATE — Para Rechazos

> El auditor usa esta plantilla cuando un reporte es rechazado.

````markdown
# 🔁 Corrección Requerida: {scope original}

## Contexto
Tu trabajo anterior fue auditado y **rechazado**. A continuación el detalle.

### Reporte Original
Archivo: `.orchestra/rejected/{nombre del reporte}`

### Razón del Rechazo
{Descripción específica de qué falló en la auditoría}

### Violations Detectadas
| # | Categoría | Descripción | Archivo Afectado |
|---|---|---|---|
| 1 | {Vision/Scope/Quality/Docs} | {qué viola} | `path/to/file` |

## Qué Corregir
{Instrucciones específicas para corregir}

### Qué SÍ hacer:
- {corrección 1}
- {corrección 2}

### Qué NO hacer (de nuevo):
- {repetir la restricción que fue violada}

## Criterio de Éxito (actualizado)
- {criterio original + criterios adicionales basados en el rechazo}
- Build limpio (typecheck + lint + build = 0 errores)
- **Verificar específicamente que {la violación} no se repita**

## Reporte
Al terminar, escribe tu reporte siguiendo EXACTAMENTE la plantilla en 
`.orchestra/PROMPT_TEMPLATES.md`, sección "REPORT_TEMPLATE".
Guarda el reporte en `.orchestra/inbox/` con el nombre:
`{YYYY-MM-DD}_{HH-MM}_{tu-nombre}_{scope}_v2.md`
````

---

## 4. SCOPE_DEFINITION_TEMPLATE — Para Definir Scope Limpio

> Usa antes de crear un TASK_PROMPT para pensar el scope.

```markdown
## Scope: {nombre}

### Objetivo
{¿Qué problema resuelve?}

### Entregables
1. {entregable concreto 1}
2. {entregable concreto 2}

### Frontera
- ✅ DENTRO: {lista de lo que sí se toca}
- ❌ FUERA: {lista de lo que NO se toca}

### Riesgo
- {¿qué podría salir mal?}
- {¿qué archivos son sensibles?}

### Dependencias
- {¿necesita que otro scope esté terminado primero?}
- {¿qué archivos no puede tocar porque otro agente los está modificando?}

### Estimación
- Complejidad: {baja/media/alta}
- Archivos: {~N archivos}
- Tiempo estimado: {X horas}
```

---

_Templates v1.0 — 2026-03-22._
