# VSM Store — Module Map

## Storefront (Cliente)

- Exploración de productos (Semantic Search);
- AI Concierge (Cesarin);
- Carrito de compras;
- Checkout (Mercado Pago);
- Rastreo de orden;
- Perfil e historial de reabastecimiento (Replenishment);
- Manejo de objeciones y Out of Stock Recovery.

## Core Domain (`src/lib/domain`)

- **`orders/`**: Manejo de estado de órdenes, vistas y reabastecimiento.
- **`product-search/`**: El cerebro del Concierge (contextos, intenciones, specs, decisiones, promociones, recovery).
- **`ai-capsule/`**: Contratos de Edge Functions y schemas.

## Admin (Dashboard)

- Gestión de catálogo;
- Inventario;
- Órdenes entrantes y status;
- Configuración de promociones;
- Analíticas.

## Services (Backend / Supabase)

- AI Capsule Orchestrator;
- Customer Intelligence (Intent Guardrails, Tool Selection, Soft Continuity);
- Checkout & Payments (Mercado Pago Webhooks);
- Order Management.
