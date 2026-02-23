# VSM Store — Referencia del Schema de Base de Datos

Documentación completa de todas las tablas, columnas, constraints, triggers, funciones y políticas RLS de VSM Store en Supabase (PostgreSQL).

**Última actualización:** 23 febrero 2026

---

## Migraciones aplicadas (en orden)

| Archivo | Fecha | Descripción |
|---|---|---|
| `001_initial_schema.sql` | 11 feb 2026 | Schema base: categories, products, enums, seed |
| `002_users_system.sql` | 11 feb 2026 | customer_profiles, addresses, orders, coupons, loyalty_points |
| `003_admin_users.sql` | 11 feb 2026 | admin_users, RLS admin para products y categories |
| `20240214125700_add_payment_fields.sql` | 14 feb 2026 | Campos de MercadoPago en orders |
| `20260216145500_create_store_settings.sql` | 16 feb 2026 | Tabla store_settings (singleton) |
| `20260216_admin_customer_notes.sql` | 16 feb 2026 | admin_customer_notes, storage bucket customer-evidence |
| `20260216_bank_account_info.sql` | 16 feb 2026 | Columna bank_account_info en store_settings |
| `20260216_expiring_badges_and_cover.sql` | 16 feb 2026 | cover_image, is_featured_until, is_new_until, is_bestseller_until en products |
| `20260216_god_mode_notifications.sql` | 16 feb 2026 | account_status, suspension_end en customer_profiles; tabla user_notifications |
| `20260216_monitoring_system.sql` | 16 feb 2026 | Tabla app_logs (logging de errores) |
| `20260222_add_payment_methods_settings.sql` | 22 feb 2026 | Columna payment_methods JSONB en store_settings |
| `20260222_add_sliders_loyalty_settings.sql` | 22 feb 2026 | Columnas hero_sliders y loyalty_config en store_settings |
| `20260223_add_tracking_number.sql` | 23 feb 2026 | Columna tracking_number en orders |
| `20260223_fix_db_constraints.sql` | 23 feb 2026 | Corrección de constraints, RLS incompletos, trigger de registro |
| `20260223_enhance_categories.sql` | 23 feb 2026 | Columnas image_url e is_popular en categories |

---

## Tablas

### `categories`
Árbol de categorías del catálogo (máximo 2 niveles).

| Columna | Tipo | Nullable | Default | Descripción |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | PK |
| `name` | TEXT | NO | — | Nombre visible |
| `slug` | TEXT | NO | — | URL friendly. UNIQUE(slug, section) |
| `section` | section_type | NO | — | `vape` \| `420` |
| `parent_id` | UUID | YES | NULL | FK → categories(id). NULL = categoría raíz |
| `description` | TEXT | YES | NULL | Descripción para SEO/menú |
| `image_url` | TEXT | YES | NULL | URL de imagen representativa |
| `is_popular` | BOOLEAN | NO | false | Badge trending 🔥 en tienda |
| `order_index` | INTEGER | NO | 0 | Posición en menú |
| `is_active` | BOOLEAN | NO | true | Visibilidad en tienda |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Auto |

**Índices:** `section`, `parent_id`

---

### `products`
Catálogo de productos.

| Columna | Tipo | Nullable | Default | Descripción |
|---|---|---|---|---|
| `id` | UUID | NO | gen_random_uuid() | PK |
| `name` | TEXT | NO | — | Nombre |
| `slug` | TEXT | NO | — | UNIQUE(slug, section) |
| `description` | TEXT | YES | — | Descripción larga |
| `short_description` | TEXT | YES | — | Descripción corta para cards |
| `price` | DECIMAL(10,2) | NO | — | Precio de venta |
| `compare_at_price` | DECIMAL(10,2) | YES | — | Precio anterior (tachado) |
| `stock` | INTEGER | NO | 0 | Inventario disponible |
| `sku` | TEXT | YES | — | Código interno |
| `section` | section_type | NO | — | `vape` \| `420` |
| `category_id` | UUID | NO | — | FK → categories(id) |
| `tags` | TEXT[] | NO | `{}` | Array de etiquetas |
| `status` | product_status | NO | `active` | `active`\|`legacy`\|`discontinued`\|`coming_soon` |
| `images` | TEXT[] | NO | `{}` | URLs de galería |
| `cover_image` | TEXT | YES | NULL | Imagen principal (puede diferir de galería) |
| `is_featured` | BOOLEAN | NO | false | Badge ⭐ Destacado |
| `is_featured_until` | TIMESTAMPTZ | YES | NULL | Expiración automática del badge |
| `is_new` | BOOLEAN | NO | false | Badge ✨ Nuevo |
| `is_new_until` | TIMESTAMPTZ | YES | NULL | Expiración automática |
| `is_bestseller` | BOOLEAN | NO | false | Badge 📈 Bestseller |
| `is_bestseller_until` | TIMESTAMPTZ | YES | NULL | Expiración automática |
| `is_active` | BOOLEAN | NO | true | Visibilidad en tienda |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Auto |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Auto (via trigger) |

**Índices:** `section`, `category_id`, `is_active`, `is_featured` (parcial)  
**Trigger:** `trigger_products_updated_at` → actualiza `updated_at`

---

### `customer_profiles`
Perfil extendido de clientes, 1:1 con `auth.users`.

| Columna | Tipo | Nullable | Default | Descripción |
|---|---|---|---|---|
| `id` | UUID | NO | — | PK = auth.users(id) |
| `full_name` | TEXT | NO | — | Nombre completo |
| `phone` | TEXT | YES | — | Teléfono |
| `whatsapp` | TEXT | YES | — | WhatsApp (puede diferir del teléfono) |
| `birthdate` | DATE | YES | — | Fecha de nacimiento |
| `customer_tier` | TEXT | NO | `bronze` | `bronze`\|`silver`\|`gold`\|`platinum` — calculado automáticamente |
| `account_status` | TEXT | NO | `active` | `active`\|`suspended`\|`banned` |
| `suspension_end` | TIMESTAMPTZ | YES | — | Fin de suspensión temporal |
| `total_orders` | INTEGER | NO | 0 | Actualizado por trigger al entregar orden |
| `total_spent` | DECIMAL(10,2) | NO | 0 | Acumulado de órdenes entregadas |
| `favorite_category_id` | UUID | YES | — | FK → categories(id) |
| `created_at` | TIMESTAMPTZ | NO | NOW() | Auto |
| `updated_at` | TIMESTAMPTZ | NO | NOW() | Auto (via trigger) |

**Trigger:** `trg_customer_profiles_updated_at`  
**Trigger de creación automática:** `on_auth_user_created` en `auth.users` → `handle_new_auth_user()`

---

### `addresses`
Direcciones de envío/facturación por cliente.

| Columna | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | UUID | NO | PK |
| `customer_id` | UUID | NO | FK → customer_profiles(id) CASCADE DELETE |
| `type` | TEXT | YES | `shipping` \| `billing` |
| `label` | TEXT | YES | Casa, oficina, etc. |
| `full_name` | TEXT | YES | Nombre para el paquete |
| `street` | TEXT | NO | Calle |
| `number` | TEXT | NO | Número exterior/interior |
| `colony` | TEXT | NO | Colonia |
| `city` | TEXT | NO | Default: Xalapa |
| `state` | TEXT | NO | Default: Veracruz |
| `zip_code` | TEXT | NO | CP |
| `phone` | TEXT | YES | Teléfono de contacto |
| `notes` | TEXT | YES | Indicaciones especiales |
| `is_default` | BOOLEAN | NO | false |
| `created_at` | TIMESTAMPTZ | NO | NOW() |

---

### `orders`
Pedidos de la tienda.

| Columna | Tipo | Nullable | Descripción |
|---|---|---|---|
| `id` | UUID | NO | PK |
| `order_number` | TEXT | NO | UNIQUE. Format: `VSM-0001`. Auto via trigger |
| `customer_id` | UUID | YES | FK → customer_profiles(id) SET NULL |
| `items` | JSONB | NO | Array `[{product_id, name, price, quantity, image}]` |
| `subtotal` | DECIMAL(10,2) | NO | — |
| `shipping_cost` | DECIMAL(10,2) | NO | 0 |
| `discount` | DECIMAL(10,2) | NO | 0 |
| `total` | DECIMAL(10,2) | NO | — |
| `status` | TEXT | NO | `pending`\|`confirmed`\|`processing`\|`shipped`\|`delivered`\|`cancelled` |
| `payment_method` | TEXT | YES | `whatsapp`\|`mercadopago`\|`cash`\|`transfer`\|`card` |
| `payment_status` | TEXT | YES | `pending`\|`paid`\|`failed`\|`refunded` |
| `shipping_address_id` | UUID | YES | FK → addresses(id) |
| `billing_address_id` | UUID | YES | FK → addresses(id) |
| `tracking_notes` | TEXT | YES | Notas internas de seguimiento |
| `tracking_number` | TEXT | YES | Número de guía DHL u otro courier |
| `whatsapp_sent` | BOOLEAN | NO | false |
| `whatsapp_sent_at` | TIMESTAMPTZ | YES | — |
| `mp_preference_id` | TEXT | YES | ID de preferencia MercadoPago |
| `mp_payment_id` | TEXT | YES | ID del pago confirmado (webhook) |
| `mp_payment_data` | JSONB | YES | Respuesta completa de MP (debug) |
| `created_at` | TIMESTAMPTZ | NO | NOW() |
| `updated_at` | TIMESTAMPTZ | NO | NOW() (trigger) |

**Triggers:** `trg_orders_set_number` (auto order_number), `trg_orders_updated_at`, `trg_orders_update_customer_stats`

---

### `coupons`
Cupones de descuento.

| Columna | Tipo | Nullable | Descripción |
|---|---|---|---|
| `code` | TEXT | NO | PK (código del cupón) |
| `description` | TEXT | YES | — |
| `discount_type` | TEXT | YES | `percentage` \| `fixed` |
| `discount_value` | DECIMAL(10,2) | NO | Valor del descuento |
| `min_purchase` | DECIMAL(10,2) | NO | 0 — Mínimo de compra requerido |
| `max_uses` | INTEGER | YES | NULL = ilimitado |
| `used_count` | INTEGER | NO | 0 |
| `valid_from` | TIMESTAMPTZ | NO | NOW() |
| `valid_until` | TIMESTAMPTZ | YES | NULL = sin expiración |
| `is_active` | BOOLEAN | NO | true |
| `created_at` | TIMESTAMPTZ | NO | NOW() |

---

### `customer_coupons`
Registro de cupones usados por cliente.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `customer_id` | UUID | FK → customer_profiles |
| `coupon_code` | TEXT | FK → coupons(code) |
| `order_id` | UUID | FK → orders(id) SET NULL |
| `used_at` | TIMESTAMPTZ | Cuándo se usó |

---

### `loyalty_points`
Transacciones del programa de puntos.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `customer_id` | UUID | FK → customer_profiles |
| `points` | INTEGER | Cantidad de puntos (siempre positivo) |
| `transaction_type` | TEXT | `earned` \| `spent` \| `expired` |
| `description` | TEXT | Descripción de la transacción |
| `order_id` | UUID | FK → orders(id) SET NULL |
| `created_at` | TIMESTAMPTZ | — |

**Función:** `get_customer_points_balance(p_customer_id UUID)` → balance actual (earned - spent - expired)

---

### `store_settings`
Tabla singleton (siempre 1 fila con id=1).

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | BIGINT | PK = 1 (CONSTRAINT single_row CHECK id=1) |
| `site_name` | TEXT | Nombre de la tienda |
| `description` | TEXT | Descripción general |
| `logo_url` | TEXT | URL del logo |
| `whatsapp_number` | TEXT | Número para checkout WhatsApp |
| `whatsapp_default_message` | TEXT | Mensaje predeterminado |
| `social_links` | JSONB | `{facebook, instagram, youtube, tiktok}` |
| `location_address` | TEXT | — |
| `location_city` | TEXT | — |
| `location_map_url` | TEXT | — |
| `bank_account_info` | TEXT | Datos para transferencia bancaria |
| `payment_methods` | JSONB | `{transfer, mercadopago, cash}` booleanos |
| `hero_sliders` | JSONB | Array de slides para MegaHero |
| `loyalty_config` | JSONB | `{points_per_currency, currency_per_point_unit, active}` |
| `created_at` | TIMESTAMPTZ | — |
| `updated_at` | TIMESTAMPTZ | — |

---

### `admin_users`
Usuarios con acceso al panel de administración.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK = auth.users(id) |
| `role` | TEXT | `admin` \| `super_admin` \| `viewer` |
| `created_at` | TIMESTAMPTZ | — |

> ⚠️ RLS está **desactivado** (`DISABLE ROW LEVEL SECURITY`) para que las políticas EXISTS de otras tablas puedan consultar esta tabla sin bucle infinito.

---

### `admin_customer_notes`
Notas internas del admin sobre un cliente (ocultas al usuario).

| Columna | Tipo | Descripción |
|---|---|---|
| `customer_id` | UUID | PK + FK → customer_profiles |
| `tags` | TEXT[] | Etiquetas internas |
| `custom_fields` | JSONB | Campos custom key-value |
| `notes` | TEXT | Notas libres |
| `updated_at` | TIMESTAMPTZ | — |

---

### `user_notifications`
Notificaciones push/in-app enviadas a usuarios.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `user_id` | UUID | FK → auth.users |
| `title` | TEXT | — |
| `message` | TEXT | — |
| `type` | TEXT | `info`\|`warning`\|`alert`\|`success` |
| `is_read` | BOOLEAN | false |
| `created_at` | TIMESTAMPTZ | — |

---

### `app_logs`
Log de errores y eventos de la aplicación.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | UUID | PK |
| `level` | TEXT | `info`\|`warn`\|`error`\|`debug` |
| `category` | TEXT | Ej: `auth`, `cart`, `payment`, `runtime` |
| `message` | TEXT | — |
| `details` | JSONB | Stack trace, contexto adicional |
| `user_id` | UUID | FK → auth.users SET NULL |
| `url` | TEXT | URL donde ocurrió el evento |
| `user_agent` | TEXT | — |
| `created_at` | TIMESTAMPTZ | — |

---

## Enums

| Enum | Valores |
|---|---|
| `section_type` | `vape`, `420` |
| `product_status` | `active`, `legacy`, `discontinued`, `coming_soon` |

---

## Funciones PostgreSQL

| Función | Retorna | Descripción |
|---|---|---|
| `update_updated_at_column()` | TRIGGER | Actualiza `updated_at = NOW()` |
| `generate_order_number()` | TEXT | Genera `VSM-XXXX` secuencial |
| `calculate_tier(spent DECIMAL)` | TEXT | Devuelve tier según gasto acumulado |
| `get_customer_points_balance(UUID)` | INTEGER | Balance actual de puntos (STABLE) |
| `trg_set_order_number()` | TRIGGER | Llama a generate_order_number() en INSERT |
| `trg_update_customer_stats()` | TRIGGER | Actualiza total_orders, total_spent, tier al entregar |
| `handle_new_auth_user()` | TRIGGER | Crea customer_profile automáticamente al registrarse |

---

## Tiers de Clientes

| Tier | Gasto acumulado |
|---|---|
| `bronze` | < $5,000 |
| `silver` | $5,000 – $19,999 |
| `gold` | $20,000 – $49,999 |
| `platinum` | ≥ $50,000 |

El tier se recalcula automáticamente cada vez que una orden pasa a estado `delivered`.

---

## Resumen de RLS por tabla

| Tabla | Público (SELECT) | Cliente (propio) | Admin |
|---|---|---|---|
| `categories` | Solo activas | — | CRUD completo |
| `products` | Solo activos | — | CRUD completo |
| `customer_profiles` | ❌ | Ver/editar propio | Ver/editar todos |
| `addresses` | ❌ | CRUD propio | — |
| `orders` | ❌ | Ver/insertar propias | Ver/editar todas |
| `coupons` | Solo activos | — | CRUD completo |
| `customer_coupons` | ❌ | Ver/insertar propios | — |
| `loyalty_points` | ❌ | Ver propios | CRUD completo |
| `store_settings` | Ver (lectura) | — | Update/Insert |
| `admin_customer_notes` | ❌ | ❌ | CRUD completo |
| `user_notifications` | ❌ | Ver/actualizar propias | Insertar para cualquier user |
| `app_logs` | ❌ | INSERT (anon también) | SELECT completo |
| `admin_users` | — | — | RLS desactivado |

---

## Storage Buckets

| Bucket | Público | Acceso |
|---|---|---|
| `customer-evidence` | ❌ No | Solo admins (upload + view) |
| `product-images` | ✅ Sí | Lectura pública, escritura admin |
