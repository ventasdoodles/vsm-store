# ADMIN PANEL - PLAN DE IMPLEMENTACIÓN MODULAR

## Arquitectura

### Separación Completa

vsm-store/              # E-commerce público (actual)
├── src/
├── public/
└── ...
vsm-admin/              # Admin panel (nuevo proyecto)
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   ├── stores/
│   └── ...
├── public/
└── ...

### Deploy Separado

- Store: vsm-store.pages.dev
- Admin: vsm-admin.pages.dev (o admin.vsmstore.app)

### Mismo Backend

- Comparten Supabase (mismas tablas)
- RLS diferente para admin
- Política: admin_role = true

---

## Componentes Reutilizables

### Del Store al Admin (copiar/adaptar)

**Services (90% reutilizable):**

- ✅ `src/services/products.service.ts` - CRUD ya existe
- ✅ `src/services/categories.service.ts` - CRUD ya existe
- ✅ `src/services/orders.service.ts` - Agregar updateStatus
- ✅ `src/services/coupons.service.ts` - Ya completo
- ✅ `src/lib/supabase.ts` - Misma config

**Types (100% reutilizable):**

- ✅ `src/types/product.ts`
- ✅ `src/types/category.ts`
- ✅ `src/types/order.ts`
- ✅ Todos los types se comparten

**Config (100% reutilizable):**

- ✅ `src/config/site.ts`
- ✅ `.env` (mismas credenciales Supabase)

**Componentes UI (parcialmente):**

- ✅ `LoadingSkeleton.tsx`
- ⚠️ Forms (adaptar para admin)
- ❌ Resto específico de tienda

---

## Schema de BD - Extensión para Admin

### Nueva Tabla: admin_users

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin', 'viewer')),
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS para admin
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything" ON products
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE admin_users.id = auth.uid()
    )
  );

-- Aplicar política similar a: categories, orders, coupons, etc.
```

### Extensión: upload de imágenes

```sql
-- Bucket en Supabase Storage
-- Crear en dashboard: products-images
-- Políticas: admin puede subir/borrar
```

---

## Implementación Modular (6 fases)

### FASE 1: Setup y Auth (1 hora)

**Crear proyecto:**

```bash
npm create vite@latest vsm-admin -- --template react-ts
cd vsm-admin
npm install
npm install @supabase/supabase-js zustand react-query lucide-react tailwindcss
```

**Copiar del store:**

- `src/lib/supabase.ts`
- `src/types/` (todos)
- `src/services/` (solo los CRUD)
- `.env`
- `tailwind.config.js`

**Crear auth admin:**

- Login simple (email/password)
- Verificar que user está en admin_users
- Redirect si no es admin

**Entregable:**

- Admin login funcional
- Conexión a Supabase
- Scaffold básico

---

### FASE 2: Dashboard (1 hora)

**Página principal con métricas:**

**Cards superiores:**

- Total ventas hoy
- Pedidos pendientes
- Productos con stock bajo
- Nuevos clientes hoy

**Gráficos:**

- Ventas últimos 7 días (línea)
- Productos más vendidos (barras)
- Categorías más populares (dona)

**Lista rápida:**

- Últimos 5 pedidos
- Últimas 5 notificaciones

**Componentes:**

- `DashboardCard.tsx` (card con stat)
- `MiniChart.tsx` (gráfico simple)
- `RecentOrders.tsx` (tabla pequeña)

**Entregable:**

- Dashboard visual completo
- Métricas en tiempo real
- Sin romper nada del store

---

### FASE 3: Gestión de Productos (2 horas)

**Lista de productos:**

- Tabla con todos los productos
- Columnas: Imagen, Nombre, SKU, Precio, Stock, Categoría, Status
- Búsqueda y filtros
- Paginación (50 por página)
- Botones: Editar, Eliminar, Ver en tienda

**Form crear/editar:**

- Todos los campos de Product
- Upload de imágenes (múltiples):
  - Drag & drop
  - Preview
  - Reordenar
  - Upload a Supabase Storage
  - Guardar URLs en products.images
- Editor de tags (agregar/quitar)
- Select de categoría (jerárquico)
- Toggle is_featured, is_new, is_bestseller
- Input de stock
- Validación completa

**Gestión de imágenes:**

- Servicio para upload a Supabase Storage
- Generar thumbnails (opcional)
- Borrar imágenes viejas al actualizar

**Componentes:**

- `ProductsTable.tsx`
- `ProductForm.tsx`
- `ImageUploader.tsx`
- `TagInput.tsx`

**Entregable:**

- CRUD productos completo
- Upload de imágenes funcional
- Actualización en store en tiempo real

---

### FASE 4: Gestión de Pedidos (1.5 horas)

**Lista de pedidos:**

- Tabla con filtros por status
- Columnas: # Orden, Cliente, Fecha, Total, Status, Pago
- Búsqueda por cliente/orden
- Click abre detalle

**Detalle de pedido:**

- Toda la info del pedido
- Items con imágenes
- Cliente: nombre, teléfono, dirección
- Timeline de status (igual que store)
- Tracking notes (editable)

**Actualizar status:**

- Dropdown con opciones
- Al cambiar:
  - Guardar en BD
  - Agregar nota a tracking_notes
  - Trigger notificación al cliente (si está implementado)
  - Email al cliente (futuro)

**Imprimir orden:**

- Versión para imprimir (PDF)
- Incluye: orden, items, dirección

**Componentes:**

- `OrdersTable.tsx`
- `OrderDetail.tsx`
- `StatusUpdater.tsx`
- `PrintOrder.tsx`

**Entregable:**

- Ver todos los pedidos
- Actualizar status
- Cliente recibe notificación (si conectado)

---

### FASE 5: Gestión de Inventario (1 hora)

**Vista de inventario:**

- Tabla con stock actual
- Alertas de stock bajo (< threshold)
- Botón "Ajustar stock"

**Ajustar stock:**

- Modal rápido
- Input: nueva cantidad
- Dropdown: razón (restock, ajuste, daño, etc)
- Guardar en inventory_movements
- Actualizar products.stock_quantity

**Historial de movimientos:**

- Por producto
- Tabla: Fecha, Tipo, Cantidad, Orden (si aplica)

**Componentes:**

- `InventoryTable.tsx`
- `StockAdjuster.tsx`
- `MovementHistory.tsx`

**Entregable:**

- Control de inventario funcional
- Historial completo
- Alertas de stock bajo

---

### FASE 6: Gestión de Cupones y Clientes (0.5 horas)

**Cupones:**

- Lista de cupones
- Crear/editar cupón
- Ver uso (quién lo usó, cuándo)
- Activar/desactivar

**Clientes:**

- Lista de clientes
- Ver perfil completo
- Historial de pedidos por cliente
- Total gastado
- Tier actual
- Puntos de lealtad

**Componentes:**

- `CouponsTable.tsx`
- `CouponForm.tsx`
- `CustomersTable.tsx`
- `CustomerDetail.tsx`

**Entregable:**

- Gestión completa de cupones
- Vista de clientes
- Analytics por cliente

---

## Navegación del Admin

### Sidebar

- 🏠 Dashboard
- 📦 Productos
- 📋 Pedidos
- 📊 Inventario
- 🎫 Cupones
- 👥 Clientes
- ⚙️ Configuración
- 🚪 Cerrar sesión

---

## Seguridad

### RLS Policies necesarias

```sql
-- Solo admins pueden crear/editar/borrar
CREATE POLICY "Admin full access" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- Aplicar a todas las tablas
```

### Auth flow

1. Login con email/password
2. Verificar auth.users
3. Verificar admin_users
4. Si no es admin → error
5. JWT con rol admin

---

## Testing Incremental

Después de cada fase:

1. ✅ Deploy admin a Cloudflare Pages
2. ✅ Verificar que store sigue funcionando
3. ✅ Probar funcionalidad nueva
4. ✅ Commit con mensaje claro
5. ✅ Siguiente fase

---

## Prevención de Errores

### Reglas

- ❌ NUNCA modificar tablas de producción sin backup
- ❌ NUNCA borrar datos, solo marcar como deleted
- ✅ Usar transacciones para operaciones múltiples
- ✅ Validar en frontend Y backend
- ✅ Logs de todas las acciones de admin

---

## Deploy Separado

### Dos repos en GitHub

- ventasdoodles/vsm-store (ya existe)
- ventasdoodles/vsm-admin (nuevo)

### Dos proyectos en Cloudflare

- vsm-store → vsm-store.pages.dev
- vsm-admin → vsm-admin.pages.dev

### Variables de entorno

Mismas credenciales Supabase, pero admin tiene:
VITE_ADMIN_MODE=true

---

## Cronograma Sugerido

**Sesión 1 (2 horas):**

- Fase 1: Setup + Auth
- Fase 2: Dashboard

**Sesión 2 (2 horas):**

- Fase 3: Productos (parte 1)

**Sesión 3 (2 horas):**

- Fase 3: Productos (parte 2, imágenes)
- Fase 4: Pedidos (parte 1)

**Sesión 4 (2 horas):**

- Fase 4: Pedidos (parte 2)
- Fase 5: Inventario
- Fase 6: Cupones y clientes

---
