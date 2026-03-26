# 🎮 MANUAL MAESTRO DE COMANDOS: GraQle v3 (Vibe Edition) 🚀

> **ESTADO:** DOCUMENTACIÓN CANÓNICA | **ACTUALIZADO:** 24 de Marzo, 2026
> **PLATAFORMA:** Antigravity IDE + Google Gemini 2.5 Pro

Este manual contiene **todos los comandos habidos y por haber** de GraQle, desde los básicos de exploración hasta los de "Cerebro Profundo". Uso obligatorio para orquestar la PWA de VSM Store.

---

## 🛠️ 1. COMANDOS DE DESCUBRIMIENTO (LA NAVAJA SUIZA)

Estos comandos se usan para entender el código sin leerlo todo manualmente.

| Comando | Uso | ¿Para qué sirve? |
| :--- | :--- | :--- |
| `graq context <path>` | `graq context src/lib` | **El más usado.** Te da el mapa semántico de una carpeta o archivo. Te dice qué hace, quién lo usa y qué riesgo tiene. |
| `graq run "<pregunta>"` | `graq run "error en checkout?"` | **El Cerebro.** Lanza una consulta de razonamiento a Gemini 2.5 Pro sobre todo tu código. |
| `graq search "<texto>"` | `graq search "cupón"` | Busca lógica específica en el grafo, no solo texto (busca por significado). |

---

## 🏗️ 2. MANTENIMIENTO DEL GRAFO (JARDINERÍA)

GraQle vive de un "Grafo" (un mapa de puntos). Si cambias el código, debes avisarle.

| Comando | ¿Qué hace? |
| :--- | :--- |
| `graq grow` | **Indispensable.** Escanea tus cambios recientes y los mete al mapa mental de la IA. Úsalo después de cada hito. |
| `graq rebuild` | Borra el mapa viejo y hace uno nuevo desde cero. Úsalo si GraQle empieza a decir locuras. |
| `graq audit` | Escanea el proyecto buscando "puntos ciegos" o deuda técnica que la IA no entiende. |
| `graq doctor` | Revisa que tu conexión con la API de Gemini y tus permisos en Windows estén al 100%. |

---

## 🧪 3. COMANDOS DE INTELIGENCIA Y SEGURIDAD

| Comando | Uso | ¿Para qué sirve? |
| :--- | :--- | :--- |
| `graq verify` | `graq verify src/auth` | Revisa si el código cumple con las reglas de seguridad. |
| `graq compile` | `graq compile` | Intenta "pre-digerir" el código para que las consultas de razonamiento sean más rápidas. |
| `graq config` | `graq config` | Te muestra qué llaves de API y qué modelo está usando GraQle en este momento. |

---

## 🚀 4. COMANDOS AVANZADOS (POWER USER)

| Comando | ¿Qué hace? |
| :--- | :--- |
| `graq run --protocol debate` | Lanza a **dos IAs** a pelear entre ellas sobre una solución. Una propone y la otra critica. Ganamos nosotros porque sale la mejor opción. |
| `graq run --explain` | No solo te da la respuesta, te da el "Trace" (el rastro) de qué archivos leyó y por qué pensó lo que pensó. |
| `graq studio` | Si quieres ver el mapa visual de círculos y líneas de tu proyecto, lanza este comando. |

---

## 💡 NOTAS DE LANZAMIENTO (TIPS DE GEM)

*   **¿Cómo se lanza?** Siempre desde la terminal de Antigravity en la carpeta raíz del proyecto (`vsm-store`).
*   **¿Diferencia entre `run` y `context`?**
    *   `context` es para **MIRAR**: "Dime qué hay aquí".
    *   `run` es para **PENSAR**: "Dime cómo arreglo esto".
*   **El Error del .env:** Si GraQle te dice que no encuentra la API Key, recuerda que nuestro parche usa `VITE_GEMINI_API_KEY`. Si falla, revisa el archivo `graqle.yaml`.

---
*Este manual es parte del kit de supervivencia de VSM Store. Mantenlo actualizado.*
