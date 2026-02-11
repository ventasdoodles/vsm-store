# 📋 Próximas Tareas

> Ordenadas por prioridad. Máximo 5 tareas visibles.

## 1. 🗄️ Database Schema (Bloque 2)

**Descripción:** Crear schema completo en Supabase con migraciones SQL.

**Tareas:**

- [ ] Crear migración: tabla `categories` con seed data (11 categorías)
- [ ] Crear migración: tabla `products` con relaciones
- [ ] Configurar RLS policies (lectura pública, escritura admin)
- [ ] Generar tipos TypeScript desde Supabase (`supabase gen types`)
- [ ] Crear `.env.example` con variables necesarias

**Criterio de éxito:** Las tablas existen en Supabase y se pueden consultar desde el frontend.

---

## 2. 🛍️ Listado de Productos (Bloque 3a)

**Descripción:** Reemplazar placeholders con datos reales de Supabase.

**Tareas:**

- [ ] Hook `useProducts()` con React Query
- [ ] Hook `useCategories()` con React Query
- [ ] Componente `ProductCard` real
- [ ] Componente `ProductGrid` con filtros
- [ ] Página de categoría `/vape/mods`, `/420/fumables`

---

## 3. 🔐 Autenticación (Bloque 4)

**Descripción:** Login/registro con Supabase Auth.

**Tareas:**

- [ ] Página Login/Register
- [ ] Hook `useAuth()`
- [ ] Protección de rutas
- [ ] Perfil de usuario

---

## 4. 🛒 Carrito (Bloque 5)

**Descripción:** Carrito de compras con persistencia.

---

## 5. 📊 Admin Panel (Bloque 6)

**Descripción:** Panel de administración para gestionar productos y pedidos.
