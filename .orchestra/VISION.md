# 🔭 VSM Store — Project Vision (Auditor Reference)

> **Este documento es la referencia condensada de la VISIÓN del proyecto.**
> El auditor lo usa para validar si los cambios de un agente externo están alineados.
> Fuente de verdad completa: `AI_CONTEXT.md` (raíz del proyecto).

---

## Identidad del Proyecto

**VSM Store** es una PWA SPA de e-commerce para una tienda de vapeo y productos 420 en Xalapa, México.

- **Dos verticales:** Vape (azul) y 420/Herbal (verde)
- **Dark-only.** Experiencia inmersiva con Tactical UI y AI Concierge (Cesarín)
- **Stack:** React 18 + TypeScript strict + Vite + Supabase + Zustand + React Query
- **Deploy:** Cloudflare Pages (push to main = auto deploy)
- **Estado:** FULLY OPERATIONAL — Base Build v113

---

## Principios Fundamentales (NON-NEGOTIABLE)

### 1. Flujo Unidireccional Estricto
```
Database (Supabase) → Services → Hooks → Components/Pages
```
NUNCA al revés. Un componente no sabe que existe Supabase.

### 2. TypeScript: Cero Tolerancia
- `strict: true` + `noUncheckedIndexedAccess: true`
- Sin `any`. Sin `as X` casts innecesarios. Sin `@ts-ignore`.

### 3. Modularidad: Componentes Independientes
- Cada feature es autocontenida. Borrar un módulo no debe romper otro.
- Sin imports circulares. Sin lógica de negocio en componentes.
- Sin datos mock en producción.

### 4. Estilos: Sistema Temático
- Sin `bg-white` ni colores hardcodeados → usar `bg-theme-*`, `glass-premium`, `text-theme-*`
- Solo Tailwind + CSS Variables en `index.css`

### 5. Build: Cero Errores
- `npm run typecheck` = 0 errores
- `npm run lint` = 0 errores
- `npm run build` = exitoso

### 6. Seguridad: No Negociable
- Sin hardcoded secrets. Sin `dangerouslySetInnerHTML`. Sin `console.log` en prod.

---

## Cesarín OS — AI Concierge

### Filosofía: Capability Capsules
- **Bounded Responsibility** — cada capsule es una unidad acotada de comportamiento AI
- **Failure Isolation** — fallo local, nunca colapsar flujos no relacionados
- **Brain-First Orchestration** — "Las capsules no deciden; las capsules ejecutan"
- **El Analyst/Sommelier retiene autoridad semántica primaria**

### Capsules Activas
1. **Product Search Integrity** — búsqueda de productos (más frecuente)
2. **Knowledge & RAG Foundation** — políticas, FAQ, conocimiento de la tienda
3. **Cart Operator** — mutaciones seguras del carrito via AI

### Guardrails
- Intent classification con guardrail injection chain
- Strict AND routing (no OR-arm dispatch)
- `UNKNOWN` es último recurso — todo query comercial debe rescatarse

---

## Reglas de Actualización

Cualquier cambio al código DEBE:
1. Respetar el checklist de §1.9 de AI_CONTEXT.md
2. Actualizar AI_CONTEXT.md si toca estructura, features, o decisiones
3. Pasar build, typecheck, y lint antes de commit
4. No abrir waves nuevos sin autorización explícita del owner

---

## Qué NO Hacer (Red Flags para Auditoría)

| 🚩 Red Flag | Por qué |
|---|---|
| Importar Supabase desde un componente | Viola flujo unidireccional |
| Usar `any` | Viola cero tolerancia TypeScript |
| Crear archivos CSS por componente | Viola sistema temático |
| Cambiar routing de capsules sin justificación | Riesgo de regresión en AI |
| Agregar dependencias sin justificación | Bloat innecesario |
| Tocar `persona.ts` sin entender el Sommelier | Puede romper todo el tono de Cesarín |
| Hacer refactors masivos no solicitados | Scope creep |
| Omitir actualización de AI_CONTEXT.md | Pierde fuente de verdad |

---

_Condensado de AI_CONTEXT.md. Última actualización: 2026-03-22._
