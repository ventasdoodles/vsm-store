# 🌊 PREPARACIÓN DE TERRENO: WAVE "Enseñanza Activa de Cesarín"

> **ESTADO:** FASE DE ALINEACIÓN (TERRENO) | **FECHA:** Marzo 2026
> **HERRAMIENTA PRINCIPAL:** GraQle v3 + Gemini 2.5 Pro
> **REGLA DE ORO:** ⚠️ PROHIBIDO TOCAR LÓGICA DE IA EXISTENTE. Las mejoras son de arquitectura Frontend y flujos de evaluación, respetando la cápsula de Supabase actual.

Este documento establece las bases arquitectónicas para la próxima gran "Wave" de desarrollo. Antes de programar nuevas funciones de aprendizaje para Cesarín, debemos preparar el terreno en el Admin Panel (`src/components/admin/cesarin`) para evitar deuda técnica y "refactorizar medio universo".

---

## 1. 🛡️ Reglas de Intervención (Rules of Engagement)
Para garantizar una implementación fuerte sin romper el Sistema Operativo de Cesarín:
1.  **Aislamiento de IA:** Ningún refactor de UI alterará cómo `customer-intelligence` (Supabase Edge Function) genera los embeddings o procesa el JSON. El Frontend se adaptará al Backend.
2.  **Cero Deuda Técnica:** Cada componente que se fusione o modifique debe estar tipado (TypeScript) y documentado.
3.  **Auditoría con GraQle:** GraQle se utilizará en cada fase (`graq context` y `graq audit`) para verificar que no rompimos conexiones entre variables de estado y la base de datos.
4.  **Actualización de Core Docs:** Esta Wave estará regida y registrada en `AI_CONTEXT.md`, `AUDIT_LOG.md`, `CESARIN_CONTEXT.md` y los que se definan en esta planeación.

---

## 2. 🔍 Auditoría de Componentes: Candidatos a Refactor/Fusión
Al analizar el directorio actual con GraQle, detectamos un ecosistema extenso de 15 archivos. Para que la enseñanza a la IA sea intuitiva para ti (el administrador), proponemos la siguiente **consolidación visual y de código (Sin romper la IA)**:

### 🔄 Fusión Estratégica 1: El Hub de Correcciones
*   **Archivos Actuales:** `TabImprovements.tsx`, `TabLearning.tsx`, `TabInterventions.tsx`, `TabCaseDrafts.tsx`.
*   **El Problema:** Tienes 4 pestañas distintas para lidiar con "qué hizo mal Cesarín y cómo mejorarlo". Esto genera fricción cognitiva y código duplicado en las peticiones a Supabase.
*   **La Solución (Preparación):** Refactorizar y fusionar estos 4 en un solo flujo maestro llamado **`ContinuousLearningHub`** (Concepto).
    *   *Vista 1:* Bandeja de entrada de Chats (Evaluación).
    *   *Vista 2:* Modal de Corrección rápida (El antiguo CaseDrafts/Interventions).
    *   *Impacto AI:* Nulo. Es pura limpieza de interfaz (UI/UX).

### 🔄 Fusión Estratégica 2: El Diccionario de Comportamiento
*   **Archivos Actuales:** `TabRules.tsx`, `TabConcepts.tsx`, `TabKnowledge.tsx`.
*   **El Problema:** La gestión del prompt está fragmentada.
*   **La Solución (Preparación):** Unificarlos bajo una interfaz **`KnowledgeEngine`** donde Manejo de Inventario (Knowledge) y Comportamiento (Rules) sean secciones del mismo módulo de lectura de Supabase, en lugar de 3 componentes masivos separados.

### ⚡ Optimización sin Refactor Masivo
*   **`PilotTelemetry.tsx` & `TabAnalytics.tsx`**: Estos no se fusionarán, pero se "limpiarán". Extraeremos la lógica de gráficas y cálculos pesados a *Custom Hooks* (ej. `useCesarinMetrics()`) para que el renderizado sea fluido y no congele tu CPU.

---

## 3. 🗺️ Fases de la Wave (Roadmap)

Para no generar deuda, lo haremos a paso militar:

*   **Fase 0 (Actual): Preparación y Documentación.** Auditoría de GraQle, definición de `AI_CONTEXT` y preparación del terreno.
*   **Fase 1: Limpieza de Componentes (Frontend).** Ejecutar las fusiones (Hub de Correcciones y Knowledge Engine) sin conectar nuevos Endpoints. Solo limpiar y organizar la casa.
*   **Fase 2: Interfaz de Enseñanza (UI/UX).** Crear los botones y formularios de "Aprender Regla" o "Corregir Respuesta", asegurando que devuelvan JSON válido.
*   **Fase 3: Conexión con Supabase (La Magia).** Conectar la nueva UI a la tabla de correcciones de Supabase para que GraQle y Gemini comiencen a vectorizar las lecciones.
*   **Fase 4: Pruebas en `TabSimulator.tsx`.** Validar el aprendizaje en el Sandbox antes de impactar a los clientes reales.

---

## 4. 📚 Documentos Rectores a Actualizar
Antes de escribir la primera línea de código en la Fase 1, usaremos GraQle para asegurar que estos documentos estén alineados:
1.  ✅ `CESARIN_CONTEXT.md` (Completado).
2.  ✅ `CESARIN_TRAINING_AND_AUDIT.md` (Completado).
3.  🔄 `AI_CONTEXT.md` (Agregando la arquitectura de Aprendizaje Activo).
4.  🔄 `AUDIT_LOG.md` (Para registrar cada paso de esta refactorización).
5.  *(A la espera de los siguientes documentos que indique el administrador).*
