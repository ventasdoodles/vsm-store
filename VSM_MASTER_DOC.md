# VSM MASTER DOC — Ecosistema Digital Luxury

> **ESTADO DEL PROYECTO (Real-Time):** Mar 16, 2026. Wave 163 (DONE).
> Este documento es la síntesis operativa del sistema VSM Store, extraído directamente de la arquitectura de archivos y base de datos.

---

## 1. STACK TECNOLÓGICO (Producción)

### Core Frontend
- **Framework:** React 18 + Vite (PWA SPA).
- **Lenguaje:** TypeScript (Strict: True / Zero-Any Policy).
- **Estado Global:** Zustand (Stores minimalistas y reactivos).
- **Server State:** TanStack Query v5 (Caching & Sync).
- **Estilos:** Tailwind CSS + Framer Motion v12 (Animaciones de lujo).
- **Icons:** Lucide React.
- **Forms:** React Hook Form + Zod (Validación estricta).

### Backend & Data (Supabase)
- **Database:** PostgreSQL con extensión `pgvector` (Búsqueda Neural).
- **Auth:** Supabase Auth (JWT).
- **Serverless:** Supabase Edge Functions (Deno Runtime).
- **Storage:** Supabase Storage (CDN para imágenes optimizadas).

### Neural Engine (IA)
- **Modelos (producción):** `gemini-2.5-flash` (Analyst/Sommelier) + `gemini-2.5-flash-lite` (Edge Functions auxiliares) + `gemini-embedding-001` (Embeddings 3072d vía v1beta).
- **Orquestación:** Dual Engine Pattern (Extracción estructurada + Generación creativa).
- **API:** Gemini REST API (`v1` para generation, `v1beta` para embeddings).

---

## 2. ARQUITECTURA DEL SISTEMA

### Flujo de Datos Unidireccional
```text
Supabase (DB/Functions) → Services (@/services) → Hooks (@/hooks) → Components/Pages
```

### Capas Definidas
1.  **Servicios:** Interacción directa con el cliente Supabase. No contienen lógica de UI.
2.  **Hooks:** La "Cerebro" de la UI. Encapsulan la lógica de negocio y queries de TanStack.
3.  **UI (Tactical):** Componentes visuales "Thin" con feedback auditivo y háptico inyectado.

### Módulos de IA (Edge Functions)
- `customer-intelligence`: Orquestador principal de chat y búsqueda neural.
- `inventory-oracle`: Predicción de stock y sugerencias de compra.
- `loyalty-intelligence`: Motor de gamificación y recompensas.
- `embeddings-processor`: Generación de vectores para búsqueda semántica.
- *(Total: 12 funciones descentralizadas)*.

---

## 3. FILOSOFÍA DE DESARROLLO

1.  **Digital Luxury:** Cada interacción debe sentirse premium (glassmorphism, micro-animaciones, haptics).
2.  **Zero Waste:** No código muerto. Modularidad extrema (borrar un módulo no rompe el resto).
3.  **Resiliencia:** El sistema debe de-gradar con elegancia si la IA o un servicio falla.
4.  **IA-First:** La interfaz está diseñada para ser asistida por Cesarin, no solo controlada por el usuario.

---

## 4. DICCIONARIO DE DATOS REAL (Core Tables)

### Productos & Catálogo
- **`products`**: `id`, `name`, `price`, `stock`, `embedding (vector)`, `sku`, `section (vape|420)`, `ai_sales_note`, `specs (JSONB)`, `badges (TEXT[])`.
- **`categories`**: `id`, `name`, `slug`, `section`, `parent_id`.
- **`product_variations`**: Gestión de sabores, colores y miligramos. Vinculado a `product_attributes`.
- **`collections`**: Agrupaciones transversales de productos (Bestsellers, Temáticos).

### Inteligencia & CRM
- **`customer_profiles`**: Perfiles de usuario con `ia_context (JSONB)` para memoria RAM cognitiva.
- **`ai_configs`**: Configuración global de la personalidad de Cesarin (temperature, tone, mode).
- **`ai_rules`**: Reglas de comportamiento prioritarias (Integralidad, Ventas, Logística).
- **`ai_customer_memory`**: CRM 360 (Intereses, ticket promedio, nivel de frustración).
- **`ai_analytics`**: Logs de interacción neural para auto-aprendizaje.

### Vistas Estratégicas
- **`customer_intelligence_360`**: Vista RFM que clasifica clientes en (Campeón, Leal, En Riesgo, Nuevo).

---

- ✅ **Estabilidad:** 100% de errores de tipos eliminados.
- ✅ **IA:** Implementado Doble Motor (Flash + Pro) con Neural Debugger.
- ✅ **Admin Refactor P1:** Ontología extendida (Specs/Variants) y nuevo Editor de 4 pestañas.
- ✅ **Persistencia:** Sesiones de simulación con TTL de 7 días y auto-cierre inteligente.
- 🚀 **Next:** Phase 2 - Advanced Variant Orchestration & Stock Logic.
