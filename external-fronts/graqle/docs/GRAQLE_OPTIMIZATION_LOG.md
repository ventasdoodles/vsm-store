# 📓 Registro de Optimización y Globalización de GraQle Pro

Este documento detalla la transformación de GraQle de una dependencia local a una herramienta global optimizada ("Modo Turbo"), realizada en Marzo 2026.

## 🚀 1. Estado de Instalación (Globalización)
Para evitar la repetición de parches y depender de entornos virtuales (`.venv`), se ha movido el motor a una ubicación permanente:
- **Ruta Fuente**: `C:\Users\dgcar\Documents\Graqle-Pro`
- **Modo**: Instalación Editable (`pip install -e .`). 
- **Beneficio**: Cualquier mejora en esta carpeta se aplica instantáneamente a todos los proyectos del sistema.

## 🛠️ 2. Parches de Rendimiento Aplicados
Se modificó el código fuente original para resolver cuellos de botella críticos:

### A. Batch Embedding API (`embeddings.py`)
- **Problema**: Las llamadas secuenciales a Gemini tardaban minutos por archivo.
- **Solución**: Implementación de `batchEmbedContents`. Agrupa hasta 100 fragmentos en una sola petición.
- **Resultado**: Indexación **100x más rápida**.

### B. Bloqueo de Escalado de Grafo (`graph.py`)
- **Problema**: GraQle intentaba escalar nodos automáticamente, consumiendo miles de tokens innecesarios.
- **Solución**: Se desactivó la lógica de auto-escalado para respetar estrictamente el parámetro `max_nodes`.
- **Configuración Actual**: Bloqueado en **3 nodos** (por preferencia del usuario).

### C. Estabilidad en Windows (`httpx.Client`)
- **Problema**: Bloqueos en las respuestas de la API en entornos Windows.
- **Solución**: Migración a `httpx.Client` síncrono para el motor de razonamiento y embeddings.

## 👁️ 3. Activación de Phantom (Navegación)
GraQle ahora puede "ver" y auditar sitios web:
- **Playwright**: Instalado globalmente en la carpeta Pro.
- **Chromium**: Binarios descargados y listos.
- **Uso**: `graq phantom audit https://vsm-store.com`

## 🧠 4. Configuración de Razonamiento (Cesarín/GraQle)
Tras resolver errores `400/404`, se estableció la siguiente configuración maestra en `graqle.yaml`:

- **Modelo**: `gemini-flash-latest` (Identificador validado en inventario de API Key).
- **API Key**: Inyectada directamente para evitar fallos por variables de entorno vacías.
- **Rounds**: `max_rounds: 2` (Equilibrio entre profundidad y velocidad).

---
*Este documento es la fuente de verdad para el mantenimiento del motor GraQle en este sistema.*
