# VSM STORE - KNOWLEDGE BASE PARA CLAUDE PROJECTS

## INFORMACIÓN DEL PROYECTO

**Nombre:** VSM Store  
**Tipo:** E-commerce B2C (Vape & Cannabis)  
**Cliente:** VSM (Vape Store Mexico)  
**Ubicación:** Xalapa, Veracruz, México  
**Developer:** Carlos (@ventasdoodles)  
**Fecha Inicio:** 11 Febrero 2026  
**Estado:** MVP Funcional (98% completo)  

**URLs:**

- Producción: <https://vsm-store.pages.dev>
- Repositorio: <https://github.com/ventasdoodles/vsm-store>
- Admin (futuro): <https://vsm-admin.pages.dev>

---

## CONTEXTO DEL NEGOCIO

VSM es una empresa establecida en Xalapa que está en transición estratégica:

- **Antes:** Venta de productos de vapeo tradicional
- **Ahora:** Expansión a productos herbales/cannabis (legal en México)
- **Modelo:** Dual (vape + 420) durante la transición
- **Mercancía:** Millones de pesos en inventario
- **Clientes:** Recurrentes, requieren seguimiento profesional

**Necesidades críticas:**

- Control de usuarios y pedidos
- Historial de compras
- Facturación fiscal (México)
- Sistema de lealtad para retención
- Admin panel para gestión

---

## STACK TECNOLÓGICO

**Frontend:**

- React 18.3 + TypeScript 5.5
- Vite 5.4 (build tool)
- Tailwind CSS 3.4
- React Router 6.26
- React Query 5.56 (server state)
- Zustand 5.0 (client state)
- Lucide React (iconos)

**Backend:**

- Supabase (PostgreSQL + Auth + Storage)
- RLS policies activas
- 9 tablas relacionadas
- Triggers y funciones SQL

**Deploy:**

- Cloudflare Pages
- GitHub Actions (CI/CD automático)
- SSL automático

**PWA:**

- Service Worker implementado
- Manifest completo
- Instalable en móviles

---

## ARQUITECTURA

### Base de Datos (Supabase)

**Tablas principales:**

1. `categories` (13 filas) - Jerarquía con parent_id
2. `products` (40 filas) - Con images[], tags[], enums
3. `customer_profiles` - Uno por auth.users
4. `addresses` - Múltiples por cliente (shipping/billing)
5. `orders` - Con order_number auto-generado
6. `coupons` - Sistema de descuentos
7. `customer_coupons` - Tracking de uso
8. `loyalty_points` - Programa de recompensas

**Funciones SQL importantes:**

- `generate_order_number()` → VSM-0001, VSM-0002...
- `calculate_tier(total_spent)` → bronze/silver/gold/platinum
- `get_customer_points_balance(customer_id)`

**RLS Policies:**

- Usuarios solo ven sus datos
- Cupones: lectura pública
- Admin: acceso completo (futuro)

### Estructura Frontend

src/
├── components/      # Componentes reutilizables
├── pages/          # Páginas principales
├── services/       # Lógica de negocio + API calls
├── hooks/          # React Query hooks
├── stores/         # Zustand stores (cart, notifications)
├── contexts/       # React contexts (auth)
├── types/          # TypeScript types
├── config/         # Configuración centralizada
└── lib/           # Utilidades (supabase, helpers)

**Configuración centralizada:**
`src/config/site.ts` contiene:

- WhatsApp number
- Redes sociales
- Ubicación física
- Templates de mensajes

---

## FEATURES COMPLETADAS

### E-commerce Core

✅ 40 productos en 13 categorías (Vape: 7, 420: 6)
✅ Navegación jerárquica con subcategorías
✅ Búsqueda en tiempo real (debounce 300ms)
✅ Páginas de detalle con galería
✅ Productos relacionados
✅ Carrito persistente (localStorage)
✅ Checkout con WhatsApp integration
✅ Compartir productos (FB, WA, link)

### Sistema de Usuarios

✅ Auth con Supabase (email/password)
✅ Perfiles automáticos al registrarse
✅ Direcciones múltiples (envío/facturación)
✅ Historial de pedidos completo
✅ Timeline visual de status
✅ Reordenar pedidos anteriores
✅ Rutas protegidas (ProtectedRoute)

### Programa de Lealtad

✅ 4 tiers: Bronze → Silver ($5k) → Gold ($20k) → Platinum ($50k)
✅ Puntos automáticos: cada $100 = 10 pts
✅ Canje: 1000 pts = $100 descuento
✅ Dashboard de lealtad
✅ Progreso visual al siguiente tier
✅ Beneficios por tier (descuentos, envío gratis)

### Cupones

✅ Códigos personalizados
✅ Tipos: percentage, fixed
✅ Validaciones: fechas, max uses, min purchase
✅ Un uso por cliente
✅ Aplicar en checkout

### Estadísticas

✅ Dashboard personalizado
✅ Top 5 productos más comprados
✅ Gráfico gasto mensual
✅ Preferencias del cliente

### Notificaciones

✅ Toasts animados (auto-dismiss 5s)
✅ Centro de notificaciones
✅ Badge count de no leídas
✅ Triggers en eventos clave

### Legal y Contacto

✅ Página protección de datos (/privacy)
✅ Formulario de contacto (/contact)
✅ Redes sociales en footer
✅ Links funcionales

### PWA

✅ Instalable en móviles
✅ Service Worker
✅ Manifest completo
✅ 8 tamaños de iconos
✅ Funciona offline (básico)

---

## PATRONES DE CÓDIGO

### Services

Cada servicio expone funciones async que usan Supabase:

```typescript
// src/services/products.service.ts
export const getProducts = async (options?: GetProductsOptions) => {
  let query = supabase.from('products').select('*, category:categories(*)');
  // filtros, paginación, etc.
  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

### Hooks con React Query

```typescript
// src/hooks/useProducts.ts
export const useProducts = (options?: GetProductsOptions) => {
  return useQuery({
    queryKey: ['products', options],
    queryFn: () => getProducts(options),
    staleTime: 5 * 60 * 1000, // 5 min
  });
};
```

### Stores con Zustand

```typescript
// src/stores/cart.store.ts
interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  // ...
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity) => {
        // lógica
      },
      // ...
    }),
    { name: 'vsm-cart' }
  )
);
```

### Componentes

Funcionales, TypeScript, props tipadas:

```typescript
interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  variant = 'default' 
}) => {
  // JSX
};
```

---

## CONFIGURACIÓN IMPORTANTE

### Variables de Entorno (.env)

VITE_SUPABASE_URL=<https://cvvlorbiwtuhkxolhfie.supabase.co>
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### Site Config (src/config/site.ts)

- WhatsApp: 5212281234567
- Ubicación: Xalapa, Veracruz
- Redes: Facebook, Instagram, YouTube
- Templates de mensajes

### Supabase

- Proyecto: tienda-vsm
- Region: us-east-1
- RLS: Habilitado en todas las tablas

---

## FLUJOS PRINCIPALES

### Flujo de Compra (Usuario Loggeado)

1. Navegar productos → /vape/mods
2. Click producto → /vape/mod-regulado-80w
3. Seleccionar cantidad → Click "Agregar al carrito"
4. Notificación success → Sidebar abre
5. Click "Finalizar compra"
6. Form pre-llenado con perfil
7. Seleccionar dirección guardada
8. Aplicar cupón (opcional)
9. Click "Enviar por WhatsApp"
10. Orden guardada en BD
11. Puntos agregados automáticamente
12. WhatsApp abre con mensaje
13. Redirect a /orders/{order_id}

### Flujo de Compra (Invitado)

1-4. Igual que usuario loggeado
5. Form vacío (llenar datos)
6. Banner sugiriendo registro
7. Sin opción de cupones ni puntos
8-10. Igual (pero sin customer_id)
11. No se guardan puntos
12-13. Igual

### Flujo de Registro

1. Click "Entrar" → Modal AuthModal
2. Tab "Crear cuenta"
3. Llenar: email, password, nombre, teléfono
4. Click "Crear cuenta"
5. Supabase Auth crea usuario
6. Trigger crea customer_profile automáticamente
7. Login automático
8. Redirect a /profile
9. Notificación welcome

---

## DECISIONES DE DISEÑO

### Por qué Zustand para Carrito

- Más simple que Redux
- Persistencia built-in
- No necesita providers
- Performance óptima

### Por qué React Query para Server State

- Cache automático
- Stale time configurable
- Refetch inteligente
- Loading/error states
- Optimistic updates

### Por qué Supabase

- Backend completo sin servidor
- Auth built-in
- PostgreSQL (SQL completo)
- Real-time capabilities
- RLS para seguridad
- Generous free tier

### Por qué Dark Theme por Defecto

- Productos vape/420 se ven mejor
- Reduce fatiga visual
- Moderno y premium
- Menos consumo batería (OLED)

### Por qué WhatsApp en vez de Email

- Clientes mexicanos usan más WhatsApp
- Confirmación instantánea
- Más personal
- Menos spam
- Fácil para dueño gestionar

---

## CONVENCIONES DE CÓDIGO

### Nombres de Archivos

- Componentes: PascalCase.tsx (ProductCard.tsx)
- Services: camelCase.service.ts (products.service.ts)
- Hooks: camelCase.ts con prefix "use" (useProducts.ts)
- Types: camelCase.ts (product.ts)
- Pages: PascalCase.tsx (ProductDetail.tsx)

### Imports

Orden estándar:

1. React
2. Librerías externas
3. Hooks propios
4. Componentes
5. Types
6. Estilos

### TypeScript

- Strict mode activado
- Props siempre tipadas
- Interfaces para objetos complejos
- Types para unions/primitives
- Evitar `any`, usar `unknown` si necesario

### Tailwind

- Mobile-first
- Utility classes preferidas
- Componentes custom solo si se repiten 3+ veces
- Colores del theme (no hardcode)

---

## PROBLEMAS CONOCIDOS Y SOLUCIONES

### Problema: Imágenes genéricas

**Estado:** ~50% productos tienen placeholders de Unsplash
**Solución próxima:** Upload de 40 imágenes reales (3 horas)
**Temporal:** Funciona para demo

### Problema: Sin pasarela de pagos

**Estado:** Solo WhatsApp checkout
**Solución próxima:** Mercado Pago integration (4 horas)
**Temporal:** Funcional para pedidos manuales

### Problema: Sin admin panel

**Estado:** Dueños no pueden gestionar
**Solución próxima:** Admin panel modular (6 horas)
**Plan:** Documentado en ADMIN_PANEL.md
**Temporal:** Gestión directo en Supabase dashboard

### Problema: Sin facturación fiscal

**Estado:** No genera CFDI
**Solución próxima:** Facturama API (2 horas)
**Temporal:** Facturación manual

### Problema: Sin tracking real de envíos

**Estado:** Solo campo de texto (tracking_notes)
**Solución próxima:** Integración FedEx/DHL (3 horas)
**Temporal:** Update manual de status

---

## TESTING

### Manual Testing Checklist

✅ Flujo de compra completo
✅ Registro e inicio de sesión
✅ Agregar/quitar productos del carrito
✅ Crear/editar direcciones
✅ Aplicar cupones
✅ Ver historial de pedidos
✅ Reordenar pedido
✅ Búsqueda de productos
✅ Navegación por categorías
✅ Compartir producto
✅ Formulario de contacto
✅ Responsive mobile/desktop
✅ PWA instalación
✅ Notificaciones toast
✅ Centro de notificaciones

### Automated Testing

❌ No implementado (próxima fase)
Plan: Vitest + React Testing Library

---

## DEPLOYMENT

### Cloudflare Pages

**Config:**

- Build command: `npm run build`
- Output directory: `dist`
- Node version: 18

**Variables de entorno:**

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

**Auto-deploy:**

- Trigger: Push a `main` branch
- Build time: ~2 minutos
- Deploy: ~30 segundos

### GitHub

**Repo:** ventasdoodles/vsm-store
**Branch:** main
**Commits:** ~20 (sesión inicial)

**Estructura de commits:**

- feat: Nueva feature
- fix: Bug fix
- docs: Documentación
- refactor: Refactorización
- style: Cambios visuales

---

## PRÓXIMOS PASOS (ROADMAP)

### CRÍTICO (20h)

1. **Admin Panel (6h)** ⭐⭐⭐
   - Proyecto separado (vsm-admin/)
   - Dashboard con métricas
   - CRUD productos + upload imágenes
   - Gestión de pedidos
   - Ver ADMIN_PANEL.md

2. **Pasarela de Pagos (4h)** ⭐⭐⭐
   - Mercado Pago (recomendado para México)
   - Webhooks
   - Múltiples métodos

3. **Imágenes Reales (3h)** ⭐⭐⭐
   - 40 productos × 3-5 fotos
   - Supabase Storage

4. **Inventario Real (2h)** ⭐⭐
   - Control de stock
   - Alertas stock bajo

5. **Sistema de Envíos (3h)** ⭐⭐
   - API paquetería
   - Cotización automática

6. **Facturación Fiscal (2h)** ⭐
   - CFDI México
   - Facturama API

### IMPORTANTE (12h)

7. Landing page épica (3h)
2. Email notifications (2h)
3. Reviews y ratings (3h)
4. Otros (ver ROADMAP.md)

### Total: ~42 horas adicionales

---

## CÓMO CONTINUAR EL PROYECTO

### Para Nueva Sesión de Desarrollo

1. **Leer documentos clave:**
   - PROJECT_STATUS.md (estado técnico)
   - ROADMAP.md (visión completa)
   - ADMIN_PANEL.md (próximo hito)

2. **Verificar entorno:**

```bash
   git pull origin main
   npm install
   npm run dev
```

1. **Verificar Supabase:**
   - Dashboard: <https://supabase.com/dashboard>
   - Proyecto: tienda-vsm
   - Aplicar migraciones si necesario

2. **Siguiente tarea:**
   - Prioridad 1: Admin Panel Fase 1
   - Ver ADMIN_PANEL.md para plan detallado

### Para Admin Panel

```bash
# Crear nuevo proyecto
npm create vite@latest vsm-admin -- --template react-ts
cd vsm-admin
npm install @supabase/supabase-js zustand react-query

# Copiar archivos del store:
# - src/lib/supabase.ts
# - src/types/*
# - src/services/* (CRUD)
# - .env
```

---

## RECURSOS ÚTILES

### Documentación

- Supabase: <https://supabase.com/docs>
- React Query: <https://tanstack.com/query/latest>
- Tailwind CSS: <https://tailwindcss.com/docs>
- Zustand: <https://docs.pmnd.rs/zustand>

### Servicios Externos

- Mercado Pago: <https://www.mercadopago.com.mx/developers>
- Facturama: <https://api.facturama.mx/>
- SendGrid: <https://sendgrid.com/>
- Cloudflare: <https://dash.cloudflare.com/>

### APIs Envío México

- FedEx: <https://developer.fedex.com>
- DHL: <https://developer.dhl.com>
- Estafeta: <https://www.estafeta.com/Herramientas>

---

## CONTACTO Y SOPORTE

**Developer:** Carlos  
**GitHub:** @ventasdoodles  
**Email:** (agregar si necesario)

**Cliente:** VSM Store  
**Ubicación:** Xalapa, Veracruz, México  
**WhatsApp:** +52 228 123 4567

---

## NOTAS IMPORTANTES PARA CLAUDE

1. **Este es un proyecto real con dinero real** - El cliente vende mercancía por millones. Toda funcionalidad debe ser robusta.

2. **México-specific** - Considerar:
   - Pesos mexicanos (MXN)
   - CFDI para facturación
   - Zonas de envío mexicanas
   - WhatsApp como canal principal

3. **Dual business model** - Productos vape Y 420 son igualmente importantes. No favorecer uno sobre otro.

4. **No romper lo existente** - Al agregar features, nunca modificar schema de producción sin backup. Usar migraciones.

5. **TypeScript strict** - Mantener 0 errores. Tipado completo.

6. **Mobile-first** - Mayoría de clientes usan móvil. Probar siempre responsive.

7. **Dark theme** - No cambiar a light sin consultar. Es decisión de diseño intencional.

8. **Componentes reutilizables** - Antes de crear nuevo componente, ver si existe algo similar.

9. **Documentar cambios** - Actualizar PROJECT_STATUS.md y ROADMAP.md al completar features.

10. **Commit messages claros** - Usar convención: tipo(scope): mensaje

---

## HISTORIAL DE SESIONES

### Sesión 1 - 11 Febrero 2026 (12 horas)

**Objetivo:** MVP funcional completo  
**Completado:**

- E-commerce base (40 productos)
- Sistema de usuarios completo
- Programa de lealtad
- Cupones
- Notificaciones
- PWA
- Legal y contacto
- Deploy a producción

**Herramientas:**

- Claude Sonnet 4.5 (estrategia)
- Antigravity Opus 4.6 (desarrollo)
- Antigravity Gemini 3 Pro (fixes)

**Resultado:** vsm-store.pages.dev en vivo

### Sesión 2 - (Pendiente)

**Objetivo:** Admin Panel Fase 1-2  
**Duración estimada:** 2 horas  
**Ver:** ADMIN_PANEL.md

---

FIN DE KNOWLEDGE BASE
