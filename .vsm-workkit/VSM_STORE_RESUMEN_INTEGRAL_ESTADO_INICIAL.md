# VSM Store — Resumen Integral y Handoff Operativo

## 0. Estado Real del Proyecto

Sistema operativo y marco canónico para gobernar el desarrollo, auditoría y aseguramiento de calidad de **VSM Store**.

Dominio real de la plataforma:

- Catálogo de productos (Vapes, dispositivos, accesorios);
- Categorías, variantes, inventario y filtros;
- Carrito de compras, cupones de descuento y persistencia;
- Flujo de checkout con pasarela Mercado Pago y estados de orden;
- Integración de envíos y rastreo (DHL / Estafeta);
- Asistente inteligente Cesarin (AI Concierge con Supabase Edge Functions + Gemini);
- Panel administrativo completo (productos, órdenes, clientes, analítica, configuración);
- Sistema de autenticación e historial de pedidos del cliente.

## 1. Arquitectura y Principios de Ingeniería

```text
Supabase DB / Edge Functions → Services Layer → Hooks & Stores (Zustand/Query) → UI Components / Pages
```

Principios técnicos:

- Modularidad estricta y eliminación de clases gigantes ("god classes");
- Sin dependencias circulares;
- Lógica de negocio y de cálculo desacoplada del JSX;
- Transición auditable de estados de órdenes (`pending`, `paid`, `shipped`, `delivered`, `cancelled`);
- Tipado estricto con TypeScript y validación en tiempo de ejecución con esquemas Zod;
- Evidencia verificable antes de declarar funcionalidad completada.

## 2. Escalera de Evidencia (Evidence Ladder)

1. Compilación y chequeo de tipos (`tsc --noEmit`).
2. Pruebas unitarias de lógica y contratos (`npm run test:core`).
3. Verificación de build y manifests de release (`npm run build:verify`).
4. Pruebas en navegador local / UI QA.
5. Verificación de estados y consultas en Supabase.
6. Pruebas end-to-end simuladas (Checkout, Mercado Pago webhook, Cesarin).

## 3. Roles y Disciplina Operativa

- **ChatGPT:** Orquestador (estrategia, diseño funcional, planificación).
- **Codex:** Auditor independiente y compuerta de aceptación (readiness, auditoría de diffs, QA read-only).
- **Antigravity:** Ejecutor (código, pruebas locales, commits y pushes autorizados).
- **Usuario:** Product Owner y decisor final.
