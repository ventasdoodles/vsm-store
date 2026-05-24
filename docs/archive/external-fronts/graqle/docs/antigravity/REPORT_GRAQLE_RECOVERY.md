# 🛰️ REPORTE DE REANIMACIÓN Y ESTADO DE GRAQLE

> **FECHA:** 24 de Marzo, 2026
> **ESTADO:** OPERATIVO (PARCHADO)
> **CONTEXTO:** Este documento detalla la intervención técnica realizada para rescatar GraQle de una configuración fallida (posiblemente por Gemini Flash en hilos previos) y llevarlo a un estado de razonamiento profundo con Gemini 2.5 Pro.

---

## 1. 📂 El Origen del "Desmadre" (Diagnóstico)
Cuando tomamos el control, GraQle estaba en un estado esquizofrénico:
- **Dependencia Local Tóxica:** Intentaba descargar modelos de Hugging Face (`sentence-transformers`) en un entorno de Windows que no permitía los permisos de escritura/descarga necesarios, causando crashes inmediatos.
- **Configuración Fantasma:** Aunque se mencionaba a Gemini, el motor interno seguía buscando el "backend local" por defecto de la librería.
- **Conflicto de API:** Había una mezcla de llaves y permisos denegados (403) al intentar contactar a Google, debido a que el motor no estaba correctamente inicializado para inyectar las variables del entorno.

## 2. 🛠️ Acciones de Rescate (Hitos Técnicos)

### A. Hot-Patching del Core (Surgical Fix)
Intervinimos directamente el código fuente de la librería vendoreada en `scripts/vendor/graqle/`:
- **Punto de Ataque:** `activation/embeddings.py`.
- **Acción:** Creamos e inyectamos la clase `GeminiEmbeddingEngine`. Esta clase ignora por completo a Hugging Face y usa `httpx` para hablarle directamente a la API de Google Cloud.
- **Resultado:** GraQle dejó de llorar por falta de permisos en Windows y empezó a usar la nube para "pensar".

### B. Blindaje de Configuración (`graqle.yaml`)
Reescribimos el archivo de configuración para forzar el razonamiento de élite:
- **Model:** `gemini-2.5-pro` (Reasoning Engine).
- **Embeddings:** `models/gemini-embedding-001`.
- **Variables:** Sincronizamos `${VITE_GEMINI_API_KEY}` para que la llave sea una sola fuente de verdad desde el `.env`.

### C. El Triunfo de la "Visión 10/10"
Logramos correr comandos de contexto (`graq context`) que finalmente permitieron mapear la arquitectura del Admin Panel y Cesarín OS sin errores de CPU.

---

## 3. 📉 Fracasos y Limitaciones Detectadas
No todo fue miel sobre hojuelas; aquí es donde la herramienta encontró su límite:
- **Bug de Windows Pipes:** Detectamos que los iconos de progreso de GraQle (tqdm) rompían la terminal de Antigravity. Tuvimos que inyectar un parche de `stderr` para silenciarlos.
- **Quota Exhausted:** Al usar Gemini 2.5 Pro (el modelo más caro/pesado), notamos que si hacemos consultas muy seguidas, Google nos corta el chorro. *Lección: Usar GraQle para razonar lo importante, no para todo.*
- **Fusión de Comandos:** Intentamos usar `graq reason --repo`, pero descubrimos que en la v3 de este parche, el comando canónico es `graq run` o `graq context`. El error de sintaxis fue un aprendizaje sobre la CLI.

---

## 4. 🏁 Estado Actual (Handoff)

A día de hoy, GraQle en VSM Store está en **"Modo Orquestador"**:
1.  **Instalación:** Vive en `scripts/vendor/graqle`, es autosuficiente y no depende de `pip install` globales que puedan corromperse.
2.  **Conectividad:** Habla directo con Gemini 2.5 Pro.
3.  **Utilidad:** Se usa como la "Navaja Suiza" para auditar flujos críticos (como Mercado Pago) antes de que la IA Obrera toque el código.
4.  **Papel en la Wave:** GraQle es quien da el "visto bueno" técnico a los reportes de auditoría.

> **⚠ ADVERTENCIA:** Si otra IA intenta usar GraQle y este falla con errores de "Hugging Face" o "Sentence Transformers", significa que la configuración se desvió al backend `local`. La solución es siempre resetear `embeddings.backend: gemini` en `graqle.yaml`.

---
*Documento generado por Gem (Orquestador) para asegurar la continuidad de conocimiento.*
