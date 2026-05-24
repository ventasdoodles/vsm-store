# 🏗️ AUDITORÍA DE FLUJOS CRÍTICOS: VSM STORE (FASE 1)

> **FECHA:** Marzo 2026
> **ESTRATEGIA:** "Fortificar las bases antes de meter los muebles de lujo (Cesarín OS)".
> **ESTADO DEL GRAFO (GraQle):** 100% Sincronizado.

Este documento rige la nueva directiva de desarrollo. Dejamos el módulo `Cesarin OS` en pausa para garantizar que los cimientos de la tienda operan a prueba de balas.

---

## 📜 1. REGLAS ESTRICTAS DE IMPLEMENTACIÓN (LA LEY)
Para mantener un orden de cirujano, cada movimiento seguirá estos pasos:

1.  **Test Primero (TDD Parcial):** Si tocamos un flujo crítico, PRIMERO validamos cómo probarlo (Test), y LUEGO refactorizamos.
2.  **`graq grow` Obligatorio:** Después de cada commit importante, se correrá eñ comando `graq grow` para que el cerebro de la IA jamás se desincronice de la realidad del proyecto.
3.  **Refactor con Propósito:** Solo "limpiamos o fusionamos" un componente si eso reduce la carga del CPU, soluciona un bug o prepara el terreno. Cero "refactorización por aburrimiento".
4.  **Alineación Documental:** Cada modificación a funciones clave se registrará en el `AUDIT_LOG.md` sin excepción.

---

## 🚦 2. ORDEN DE BATALLA: FLUJOS CRÍTICOS (MAYOR A MENOR IMPACTO)

Basado en el escaneo de GraQle, aquí están las fortalezas, debilidades y el plan de acción, **ordenado por nivel de urgencia**:

### 🔴 1. [URGENCIA MÁXIMA] Flujo de Checkout & Webhooks (Mercado Pago)
*   **Fortaleza:** La infraestructura ya existe (`create-payment` y `mercadopago-webhook` en Edge Functions) y la base de datos de `orders` ya tiene las columnas necesarias.
*   **Debilidad:** Si el Webhook falla por alguna desincronización con el Frontend, el cliente pagará pero la tienda dirá "Pago Pendiente". Es el punto donde podemos perder dinero o clientes.
*   **Acción de "Improvisación/Mejora":**
    *   No refactorizar, solo **blindar**.
    *   **Test Urgente:** Crear un script de pruebas que simule un pago exitoso a la función del webhook para garantizar que Supabase cambia el estatus de la orden a `paid`.

### 🟠 2. [URGENCIA ALTA] Estado de Autenticación y Rutas Protegidas
*   **Fortaleza:** Usamos Supabase Auth (bastante robusto a nivel servidor).
*   **Debilidad:** El incidente reciente con la llave JWT mal escrita probó que nuestro Frontend puede colapsar en silencio si falla la autenticación. 
*   **Acción de "Improvisación/Mejora":**
    *   Crear una validación en tiempo real ("Healthcheck Component"). Si hay un error de conexión entre la PWA y Supabase Auth, tirar una pantalla de mantenimiento amigable en vez de una pantalla blanca o trabada.

### 🟡 3. [URGENCIA MEDIA] Sincronización del Carrito Vs. Inventario Real
*   **Fortaleza:** El carrito visual de la PWA funciona bien de manera local.
*   **Debilidad:** Un usuario podría tener un "Caliburn G3" en el carrito 4 horas, intentar pagarlo, y resulta que otro usuario lo compró hace 1 hora y el inventario real dice agotado.
*   **Acción de "Improvisación/Mejora":**
    *   Refactor menor en el botón de "Pagar": hacer un "Double Check" rápido a la base de datos de Supabase antes de abrir Mercado Pago para confirmar que el stock aún existe.

### 🟢 4. [URGENCIA BAJA] Rendimiento Frontend (CPU y Re-renders)
*   **Fortaleza:** Tenemos toda la visual lista y el UI (tema oscuro/colores y vibra) gusta.
*   **Debilidad:** Tienes componentes que se re-renderizan mil veces (lo notaste con los íconos trabando el CPU).
*   **Acción de "Improvisación/Mejora":**
    *   Consolidad componentes UI redundantes. Aplicar `React.memo` o librar de carga a componentes menores para que la página sea fluida (60 FPS) incluso en teléfonos gama baja en Acapulco.

---

## 📈 3. ¿CÓMO ARRANCAMOS?

Si das luz verde al orden establecido, **nuestro próximo paso inmediato es atacar la URGENCIA MÁXIMA (Mercado Pago)**: auditar la conexión entre el botón de Checkout del carrito y el Webhook creando la prueba. 

Si el test pasa con un 100%, ese módulo se declara "Saneado" y bajamos a la Autenticación.
