# 🧠 GRAQLE OS: INSTALACIÓN, HALLAZGOS Y VISIÓN 10/10

> **ESTADO:** IMPLEMENTADO | **FECHA:** Marzo 2026
> **MOTOR:** GraQle v0.x + Gemini 2.5 Pro (Razonamiento) + text-embedding-004

Este documento registra la "gran actualización" de inteligencia artificial en la PWA de VSM Store y traza el mapa exacto de cómo usar GraQle para convertir la aplicación en un producto 10/10 a nivel mundial.

---

## 1. 🛠️ La Implementación (Actualización y Setup)
En las sesiones recientes, actualizamos la base cognitiva del proyecto:

1.  **Cambio de Motor (De Local a Cloud):**
    Atrás quedaron los días de depender de procesadores locales. Reconfiguramos `graqle.yaml` para delegar el 100% del razonamiento a **Google Gemini 2.5 Pro**.
2.  **Inyección de Llave Maestra:**
    Localizamos y blindamos la llave de API correcta (`AIzaSy...`) en los entornos ocultos (`.env` y `graqle.yaml`) resolviendo el obstáculo "PERMISSION_DENIED (403)".
3.  **Embeddings de Nueva Generación:**
    Inyectamos soporte para `models/text-embedding-004` (Google), creando un Knowledge Graph más preciso para Cesarín.

## 2. 🔍 Hallazgos (El Diagnóstico Actual)

Durante la implementación y los primeros escaneos con la herramienta, descubrimos verdades importantes sobre el proyecto:

*   **Identidad Asfixiada (Cesarín):** El sistema de pruebas (`cesarin_qa_suite.json`) y las reglas JSON de `persona.ts` penalizan fuertemente a Cesarín si actúa de manera coloquial, dejándolo robótico.
*   **Deuda Técnica en Integraciones:** Descubrimos que la integración de Mercado Pago estaba huérfana en la base de datos. Creamos la migración SQL para habilitar `mp_preference_id` y permitir un rastreo financiero robusto.
*   **Cuellos de Botella (Limitaciones Free Tier):** Sabemos que usar modelos pesados como Gemini 2.5 Pro a diestra y siniestra causa "Quota Exhausted". Debemos ser francotiradores con nuestras peticiones.
*   **Inestabilidad de GraQle:** La librería tiene "hardcodes" hacia Hugging Face que causan fricción en Windows; tenemos identificados los puntos de parche para el equipo base en el futuro.

---

## 3. 🚀 VISIÓN 10/10: Cómo usar GraQle para llegar a la Cima

Ya tenemos un Ferrari (Gemini) dentro de la cochera (GraQle). Así es como lo usaremos para llevar la tienda a un estándar **10/10**:

### A. Documentación Automática del Framework
Podemos usar el comando `graq reason` apuntando directo a la carpeta `/src` para generar manuales vivos de la PWA.
*   **Acción:** `"Analiza la arquitectura del Frontend de VSM Store y genera un reporte técnico de 3 páginas para Cesarín (el onboarding de nuevos humanos)."`
*   **Beneficio:** Si mañana entra otro programador (o tú dejas el código 3 meses), el grafo de conocimiento te recordará cada detalle arquitectónico al nivel de un Tech Lead.

### B. Auditoría Preventiva de Bugs (Sniper QA)
En lugar de esperar a que un cliente se queje de la página, lanzaremos a GraQle a revisar módulos clave.
*   **Acción:** `"Escanea /supabase/functions y detecta todas las posibles fallas de seguridad, fugas de memoria, o transacciones de Mercado Pago que podrían quedar colgadas."`
*   **Beneficio:** Evitar cobros dobles, crashes en producción y huecos de seguridad que le cuestan dinero al negocio.

### C. Refactorización para "Cero Lag" (Métricas)
Me mencionaste que los iconos de la terminal se devoraban tu CPU. Podemos usar a GraQle para diagnosticar componentes React de la web.
*   **Acción:** `"Identifica qué componentes del catálogo de VSM Store están causando re-renderizados innecesarios y optimiza el código para que fluya a 60 FPS en celulares de gama baja."`
*   **Beneficio:** Una tienda PWA veloz retiene el doble de clientes que una tienda lenta.

### D. La "Liberación" del Sommelier
La siguiente iteración usar a GraQle para reescribir `persona.ts`.
*   **Acción:** `"Dile a Cesarín que adopte un formato de salida más relajado y cálido (estilo Acapulco). Relajaremos la IA para que pueda equivocarse 'con estilo', en vez de colapsar por no enviar un campo JSON perfecto."`

---
*Este documento marca el fin de la etapa de 'setup' de IA y el inicio de la etapa de "Alto Rendimiento 10/10". VSM Store no solo es una tienda, es un ecosistema cognitivo impulsado por Google Cloud.*
