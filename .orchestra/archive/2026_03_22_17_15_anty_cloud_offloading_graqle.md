# Tarea: Cloud Offloading de GraQle (GitHub Actions)

## Contexto
Eres una IA ejecutora de código en el proyecto VSM Store. Lee el archivo 
`AI_CONTEXT.md` en la raíz del proyecto COMPLETO antes de hacer cualquier cambio.
Es la fuente de verdad absoluta.

**Stack:** React 18 + TypeScript strict + Vite + Supabase + Zustand + React Query + GitHub Actions
**Deploy:** Cloudflare Pages (push to main = auto deploy)

## Reglas Absolutas
1. **Flujo unidireccional:** DB → Services → Hooks → Components. NUNCA al revés.
2. **TypeScript estricto:** Sin `any`, sin `as X` innecesarios, sin `@ts-ignore`.
3. **Sin scope creep:** Haz SOLO lo que se indica. No "mejores" nada más.
4. **Build limpio:** Antes de reportar comprobación cruzada: `npm run typecheck && npm run lint && npm run build` = 0 errores.
5. **Actualiza AI_CONTEXT.md** detallando esta nueva pieza de infraestructura.

## Scope Exacto
El proyecto usa GraQle (`graqle.yaml`) para calcular embeddings y construir un Knowledge Graph del sistema. Para evitar bloquear la máquina local del operador mediante procesamientos pesados, debes sacar esta carga (offloading) hacia GitHub Actions.
Deberás crear un workflow (`.github/workflows/graqle-sync.yml`) que automatice la ejecución de GraQle en la nube (Ubuntu runner), consuma la API de Gemini (embeddings/LLM) y suba los grafos resultantes a Supabase, inyectando secrets de forma segura.

### Qué SÍ hacer:
- Crear la ruta `.github/workflows/` si no existe.
- Crear el archivo `.github/workflows/graqle-sync.yml` definiendo: 
  1. Trigger en `push` a `main` y `workflow_dispatch` (manual).
  2. Setup de Node.js o Python (según el runtime de tu GraQle), instalación de `graqle` (vía `pip` o el release de tu binario).
  3. Ejecución del comando de GraQle necesario para mapear el código.
- Actualizar `AI_CONTEXT.md` listando la integración del GitHub Action como pieza clave de "Heavy Computation Offloading".

### Qué NO hacer:
- NO tocar el código frontend en React (carpeta `src/`). Esta es una tarea 100% de operaciones/infra (DevOps).
- NO reescribir `graqle.yaml` a menos que una ruta requiera ajuste CI/CD.
- NO alterar la configuración de Cloudflare Pages existente.
- NO pedir secrets planos en los archivos; referéncialos directamente como `${{ secrets.NOME_DEL_SECRET }}`.

## Archivos Involucrados
- `.github/workflows/graqle-sync.yml` — {Creado nuevo para operar el loop de embedding}.
- `AI_CONTEXT.md` — {Adición a la documentación técnica de infraestructura}.

## Criterio de Éxito
- Archivo YAML correcto siguiendo Action schema estándar.
- Secrets mapados correctamente para inyección (ej: `GEMINI_API_KEY`).
- Pipeline aislado que no estorbe tu build principal.

## Reporte
Al terminar, escribe tu reporte siguiendo EXACTAMENTE la plantilla en 
`.orchestra/PROMPT_TEMPLATES.md`, sección "REPORT_TEMPLATE".
Guarda el reporte en `.orchestra/inbox/` con el nombre:
`2026-03-22_18-00_anty_cloud_offloading_graqle_report.md`
