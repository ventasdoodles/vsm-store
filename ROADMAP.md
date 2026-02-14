# VSM STORE - ROADMAP A PRODUCCIÓN

## Estado Actual (11 Feb 2026)

### ✅ Completado (12 horas, ~10,000 líneas)

**E-commerce Base:**

- 40 productos en 13 categorías
- Navegación jerárquica
- Búsqueda en tiempo real
- Páginas de detalle
- Carrito funcional
- Checkout con WhatsApp
- PWA instalable

**Sistema de Usuarios:**

- Auth con Supabase
- Perfiles de cliente
- Direcciones múltiples
- Historial de pedidos
- Timeline de status
- Reordenar pedidos

**Programa de Lealtad:**

- 4 tiers (Bronze→Platinum)
- Puntos automáticos
- Canje de puntos
- Dashboard de estadísticas
- Sistema de cupones

**Features Adicionales:**

- Notificaciones in-app
- Redes sociales
- Compartir productos
- Protección de datos
- Formulario de contacto

**Deploy:**

- Cloudflare Pages
- URL: vsm-store.pages.dev
- SSL automático
- GitHub: ventasdoodles/vsm-store

---

## ❌ Pendiente para Producción

### CRÍTICO (Sin esto NO se puede vender - 20 horas)

#### 1. ADMIN PANEL (6 horas) ⭐⭐⭐

**Descripción:** Aplicación separada para gestión del negocio
**URL:** admin.vsm-store.pages.dev (subdominio)
**Prioridad:** MÁXIMA

**Features mínimas:**

- Dashboard con métricas
- CRUD productos
- Upload de imágenes
- Gestión de pedidos
- Actualizar status
- Ver clientes
- Gestión de cupones

**Ver:** ADMIN_PANEL.md para plan detallado

#### 2. PASARELA DE PAGOS (4 horas) ⭐⭐⭐

**Opciones:**

- Stripe (internacional)
- Mercado Pago (México, recomendado)
- PayPal
- Clip/OXXO Pay

**Features:**

- Procesar pagos reales
- Webhooks de confirmación
- Manejo de rechazos
- Múltiples métodos
- 3D Secure

**Dependencias:**

- Requiere Admin Panel para reembolsos
- Integración con sistema de pedidos

#### 3. IMÁGENES REALES (3 horas) ⭐⭐⭐

**Tareas:**

- Fotografiar/obtener 40 productos
- Múltiples ángulos (3-5 por producto)
- Edición básica
- Optimización para web
- Upload a Supabase Storage
- Actualizar BD

**Specs técnicas:**

- Formato: WebP + fallback JPG
- Tamaño: Max 800x800px
- Peso: <150KB por imagen
- Fondo: Blanco o transparente

#### 4. INVENTARIO REAL (2 horas) ⭐⭐

**Features:**

- Stock por producto
- Control de disponibilidad
- Alertas de stock bajo
- Bloqueo temporal en carrito
- Sincronización en tiempo real

**Schema:**

```sql
ALTER TABLE products 
ADD COLUMN stock_quantity INTEGER DEFAULT 0,
ADD COLUMN low_stock_threshold INTEGER DEFAULT 5,
ADD COLUMN allow_backorder BOOLEAN DEFAULT false;

CREATE TABLE inventory_movements (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products,
  quantity_change INTEGER,
  type TEXT, -- sale, restock, adjustment, return
  order_id UUID,
  notes TEXT,
  created_at TIMESTAMP
);
```

#### 5. SISTEMA DE ENVÍOS (3 horas) ⭐⭐

**Proveedores México:**

- FedEx API
- DHL API
- Estafeta API
- Paquetería local

**Features:**

- Cotización automática
- Múltiples opciones
- Tracking real
- Punto de recogida
- Cobertura por código postal

#### 6. FACTURACIÓN FISCAL (2 horas) ⭐

**Requerimientos México:**

- RFC del cliente
- Razón social
- Régimen fiscal
- Uso de CFDI

**Integración:**

- Facturama API (recomendado)
- Descarga XML/PDF
- Envío automático por email
- Storage en Supabase

---

### IMPORTANTE (Para ser profesional - 12 horas)

#### 7. LANDING PAGE ÉPICA (3 horas) ⭐⭐

**Secciones:**

- Hero con video/animación
- Beneficios (envío gratis, garantía, etc)
- Productos destacados
- Testimonios
- Stats del negocio
- Newsletter
- FAQ
- Instagram feed

**Separación:**

- Landing: vsm-store.pages.dev/ (pública)
- Tienda: vsm-store.pages.dev/shop
- Rutas actuales mantienen /vape, /420, etc.

#### 8. EMAIL NOTIFICATIONS (2 horas) ⭐⭐

**Triggers:**

- Bienvenida al registrarse
- Confirmación de pedido
- Status updates (enviado, entregado)
- Recuperación de carrito abandonado
- Promociones

**Servicio:**

- SendGrid (gratis hasta 100/día)
- Resend (moderno, fácil)
- AWS SES (más barato a escala)

#### 9. REVIEWS Y RATINGS (3 horas) ⭐⭐

**Features:**

- Calificación 1-5 estrellas
- Review con texto
- Fotos opcionales (hasta 3)
- Verificación de compra
- Moderación antes de publicar
- Respuestas del vendedor

**Schema:**

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  product_id UUID REFERENCES products,
  customer_id UUID REFERENCES customer_profiles,
  order_id UUID REFERENCES orders,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  images TEXT[],
  verified_purchase BOOLEAN,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP
);
```

#### 10. WISHLIST/FAVORITOS (1 hora) ⭐

Ya implementado parcialmente, solo falta persistencia y página dedicada.

#### 11. COMPARADOR DE PRODUCTOS (2 horas) ⭐

Tabla lado a lado comparando specs de hasta 3 productos.

#### 12. CHAT EN VIVO (2 horas) ⭐

- Widget flotante
- Integración WhatsApp Business API
- O servicio como Crisp/Tawk.to

---

### NICE TO HAVE (Diferenciadores - 10 horas)

#### 13. MICRO-INTERACCIONES (2 horas)

- Producto vuela al carrito
- Confetti al completar compra
- Animaciones de scroll
- Hover effects mejorados
- Loading states elegantes

#### 14. BÚSQUEDA AVANZADA (2 horas)

- Filtros múltiples
- Rango de precio
- Ordenamiento
- Faceted search

#### 15. RECOMENDACIONES IA (3 horas)

- "Productos similares" mejorado
- "Quienes compraron esto también..."
- Basado en historial

#### 16. PROGRAMA DE REFERIDOS (2 horas)

- Link único por usuario
- Descuento al referir
- Tracking de referidos

#### 17. DARK/LIGHT MODE TOGGLE (1 hora)

Actualmente solo dark, agregar opción de tema claro.

---

## Estimación Total

### Tiempo

- Crítico: 20 horas
- Importante: 12 horas
- Nice to have: 10 horas
**TOTAL: 42 horas (~1 semana full-time)**

### Costo Servicios Mensuales

- Supabase: $0 (free tier suficiente)
- Cloudflare Pages: $0
- Dominio (.app): $12/año
- Mercado Pago: Comisión por venta (~3.5%)
- Email (SendGrid): $0 hasta 100/día
- Total: ~$1/mes + comisiones

---

## Próximos Pasos Inmediatos

1. **Admin Panel** (siguiente sesión, 6 horas)
2. **Imágenes reales** (paralelo, fotografía)
3. **Pasarela de pagos** (después de Admin)
4. **Sistema de envíos** (integración)
5. **Facturación** (integración)
