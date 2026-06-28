# VSM Store — Domain Model

## Entidades Principales

### Customer / Cliente

Explora productos, pide asistencia a Cesarin y finaliza órdenes.

Campos: id, nombre, teléfono, preferencias, carrito activo, historial de órdenes (reabastecimiento).

### Product / Producto

Variantes de Vapes (Pods, Desechables, Líquidos).

Campos: id, name, type, price, stock, specs (flavor, device, budget, effect, beginner_friendly).

### AI Capsule / Concierge

El motor de inteligencia que guía al cliente (Cesarin). 
Módulos internos (`src/lib/domain/product-search`):
- `searchIntents`: Detección de intenciones (sabores, presupuestos).
- `searchFacts`: Extracción de especificaciones técnicas.
- `searchPromotions`: Lógica de yields y descuentos.
- `searchReplenishment`: Interceptación de re-órdenes ("lo de siempre").
- `searchRecovery`: Manejo de Out of Stock, alternativas y pivotes.
- `searchDecisions`: Guía de decisiones y manejo de objeciones.

### Order / Órden

El estado de una compra. 
Módulos internos (`src/lib/domain/orders`):
- `orderStatus`: Manejo del ciclo de vida (pending, paid, shippping, delivered).
- `paymentStatus`: Status del gateway de pago.
- `reorderPlan`: Extracción de line items para reabastecimiento directo a carrito.
- `orderViews`: Lógica de UI para presentar el historial al cliente.

## Reglas Críticas

- **Single Responsibility:** Ningún archivo de dominio (`src/lib/domain`) debe superar las 1000 líneas (NO God Classes).
- **Separation of Concerns:** La IA solo sugiere intenciones, la validación final de stock, precios y promociones pertenece al Checkout y a Supabase.
- **Out of Stock Recovery:** Nunca negar un producto agotado sin ofrecer una alternativa (preferiblemente más barata) en el mismo turno de conversación.
