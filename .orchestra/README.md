# 🎛️ VSM Orchestra — Multi-Agent Coordination System

> **Pipeline asíncrono de orquestación basado en archivos.**
> Permite coordinar múltiples agentes de IA (Codex, Antigravity, GPT, etc.) 
> sin que se pisen entre sí, auditando cada cambio contra la visión del proyecto.

## Flujo

```
┌─────────────────────┐
│   Agente Externo     │  (Codex, GPT-5.4, Claude, etc.)
│   ejecuta tarea      │
└──────────┬──────────┘
           │ escribe reporte
           ▼
    📁 /inbox/           ← Reportes pendientes de auditoría
           │
           ▼
┌─────────────────────┐
│   Tab Auditora       │  (Antigravity — tú)
│   lee reporte        │
│   compara con VISION │
│   genera veredicto   │
└──────────┬──────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
📁 /approved/  📁 /rejected/
     │           │
     │           ▼
     │     📁 /outbox/    ← Siguiente prompt generado
     ▼
📁 /archive/   ← Historial completo
```

## Estructura de Carpetas

```
.orchestra/
├── README.md               ← Este archivo
├── VISION.md               ← Visión condensada del proyecto (fuente de verdad para auditoría)
├── PROMPT_TEMPLATES.md     ← Plantillas para generar prompts
├── AUDIT_CHECKLIST.md      ← Checklist que el auditor sigue
│
├── inbox/                  ← Reportes de agentes pendientes de auditoría
│   └── .gitkeep
│
├── approved/               ← Reportes auditados y aprobados
│   └── .gitkeep
│
├── rejected/               ← Reportes auditados y rechazados (con razón)
│   └── .gitkeep
│
├── outbox/                 ← Prompts generados para el siguiente ciclo
│   └── .gitkeep
│
├── archive/                ← Historial completo de ciclos
│   └── .gitkeep
│
└── ledger.md               ← Log cronológico de todas las auditorías
```

## Convenciones de Nombres

### Reportes en inbox/
```
YYYY-MM-DD_HH-MM_{agent}_{scope}.md
```
Ejemplo: `2026-03-22_10-30_codex_cart-validation.md`

### Prompts en outbox/
```
YYYY-MM-DD_HH-MM_prompt_{scope}.md
```
Ejemplo: `2026-03-22_11-00_prompt_cart-validation-fix.md`

### Archivos en archive/
Se mueven con prefijo de resultado:
```
APPROVED_2026-03-22_10-30_codex_cart-validation.md
REJECTED_2026-03-22_10-30_codex_auth-refactor.md
```

## Cómo Usar

### 1. El Agente Externo termina su trabajo
Escribe un reporte en `inbox/` siguiendo la plantilla de `REPORT_TEMPLATE` (ver PROMPT_TEMPLATES.md).

### 2. Tú abres la Tab Auditora en Antigravity
Le dices:
```
Lee .orchestra/inbox/ y audita todos los reportes pendientes 
contra .orchestra/VISION.md y .orchestra/AUDIT_CHECKLIST.md.
Para cada reporte:
- Si pasa la auditoría → mueve a approved/, actualiza ledger.md
- Si no pasa → mueve a rejected/, genera nuevo prompt en outbox/, actualiza ledger.md
```

### 3. El siguiente agente recibe el prompt de outbox/
Puedes copiar el prompt de outbox/ y dárselo a Codex, GPT, o cualquier agente.

---

_Sistema creado: 2026-03-22. Versión 1.0._
