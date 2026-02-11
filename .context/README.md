# 📚 VSM Store - Sistema de Contexto

> Sistema de documentación interna para agentes IA y desarrolladores.
> Última actualización: 2026-02-10

## 📁 Estructura

```
.context/
├── architecture/     → Decisiones técnicas y estructura
│   ├── overview.md       Visión general del proyecto
│   ├── database.md       Schema de Supabase
│   ├── folder-structure.md   Estructura de carpetas
│   └── tech-stack.md     Tecnologías usadas
├── guides/           → Convenciones y estándares
│   ├── components.md     Cómo crear componentes React
│   ├── styling.md        Guía de Tailwind CSS
│   └── git-workflow.md   Workflow de commits
├── state/            → Estado actual del proyecto (⚠️ CRÍTICO)
│   ├── current.md        Estado actual - ACTUALIZAR SIEMPRE
│   ├── completed.md      Features completadas
│   └── next-tasks.md     Próximas 3-5 tareas
└── prompts/          → Templates para agentes
    ├── component.md      Template: crear componente
    └── feature.md        Template: crear feature
```

## 🔑 Reglas

1. **Siempre lee `state/current.md` PRIMERO** antes de hacer cambios
2. **Actualiza `state/current.md`** después de cada cambio significativo
3. **Lee `architecture/`** para entender cómo está organizado el proyecto
4. **Sigue `guides/`** para mantener consistencia en el código
5. **Usa `prompts/`** como template al crear cosas nuevas

## 🏷️ Proyecto

- **Nombre:** VSM Store
- **Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Supabase
- **Secciones:** Vape (vapeo) + 420 (cannabis/herbal)
- **Dominio futuro:** vsm.app
