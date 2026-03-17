# Supabase Real Architecture — VSM Store

> **Advertencia:** Este archivo es solo para documentación técnica. No ejecutar como script.

---

## Tablas

### addresses
- id uuid PK
- customer_id uuid FK → customer_profiles(id)
- type text ('shipping', 'billing')
- label text
- full_name text
- street text
- number text
- colony text
- city text (default 'Xalapa')
- state text (default 'Veracruz')
- zip_code text
- phone text
- notes text
- is_default boolean (default false)
- created_at timestamptz

### admin_customer_notes
- customer_id uuid PK, FK → customer_profiles(id)
- tags text[]
- custom_fields jsonb
- notes text
- updated_at timestamptz

### admin_users
- id uuid PK, FK → auth.users(id)
- role text ('admin', 'super_admin', 'viewer')
- created_at timestamptz

### ai_analytics
- id uuid PK
- customer_id uuid FK → auth.users(id)
- session_id text
- query text
- detected_intent text
- recommended_product_ids text[]
- to_whatsapp boolean
- sentiment text
- created_at timestamptz
- frustration_detected boolean
- ai_logic_debug jsonb

### ai_configs
- id uuid PK
- key text UNIQUE
- name text
- voice_tone text
- behavior_mode text
- welcome_message text
- is_active boolean
- created_at timestamptz
- updated_at timestamptz
- temperature numeric
- top_p numeric

### ai_customer_memory
- id uuid PK
- customer_id uuid UNIQUE, FK → auth.users(id)
- detected_interests text[]
- last_recommendation text
- frustration_level integer
- ticket_average numeric
- session_count integer
- last_interaction_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### ai_intents
- id uuid PK
- name text UNIQUE
- description text
- keywords text[]
- is_active boolean
- created_at timestamptz

### ai_rules
- id uuid PK
- config_id uuid FK → ai_configs(id)
- category text
- content text
- priority integer
- is_enabled boolean
- created_at timestamptz

### app_logs
- id uuid PK
- level text ('info', 'warn', 'error', 'debug')
- category text
- message text
- details jsonb
- user_id uuid FK → auth.users(id)
- url text
- user_agent text
- created_at timestamptz

### brands
- id uuid PK
- name text UNIQUE
- logo_url text
- is_active boolean
- sort_order integer
- created_at timestamptz
- updated_at timestamptz

### categories
- id uuid PK
- name text
- slug text
- section section_type
- parent_id uuid FK → categories(id)
- description text
- order_index integer
- is_active boolean
- created_at timestamptz
- image_url text
- is_popular boolean

### collections
- id uuid PK
- name text
- slug text UNIQUE
- description text
- image_url text
- is_active boolean
- created_at timestamptz

### coupons
- code text PK
- description text
- discount_type text ('percentage', 'fixed')
- discount_value numeric
- min_purchase numeric
- max_uses integer
- used_count integer
- valid_from timestamptz
- valid_until timestamptz
- is_active boolean
- created_at timestamptz

### customer_coupons
- id uuid PK
- customer_id uuid FK → customer_profiles(id)
- coupon_code text FK → coupons(code)
- order_id uuid FK → orders(id)
- used_at timestamptz

### customer_profiles
- id uuid PK, FK → auth.users(id)
- full_name text
- phone text
- whatsapp text
- birthdate date
- customer_tier text ('bronze', 'silver', 'gold', 'platinum')
- total_orders integer
- total_spent numeric
- favorite_category_id uuid FK → categories(id)
- created_at timestamptz
- updated_at timestamptz
- account_status text ('active', 'suspended', 'banned')
- suspension_end timestamptz
- avatar_url text
- referral_code text UNIQUE
- ia_context jsonb
- ai_preferences jsonb

### customer_wishlists
- id uuid PK
- customer_id uuid FK → auth.users(id)
- product_id uuid FK → products(id)
- created_at timestamptz

### flash_deals
- id uuid PK
- product_id uuid FK → products(id)
- flash_price numeric
- max_qty integer
- sold_count integer
- starts_at timestamptz
- ends_at timestamptz
- is_active boolean
- priority integer
- created_at timestamptz
- updated_at timestamptz

### loyalty_points
- id uuid PK
- customer_id uuid FK → customer_profiles(id)
- points integer
- transaction_type text ('earned', 'spent', 'expired')
- description text
- order_id uuid FK → orders(id)
- created_at timestamptz

### orders
- id uuid PK
- order_number text UNIQUE
- customer_id uuid FK → customer_profiles(id)
- items jsonb
- subtotal numeric
- shipping_cost numeric
- discount numeric
- total numeric
- status text ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
- payment_method text ('whatsapp', 'mercadopago', 'cash', 'transfer', 'card')
- payment_status text ('pending', 'paid', 'failed', 'refunded')
- shipping_address_id uuid FK → addresses(id)
- billing_address_id uuid FK → addresses(id)
- tracking_notes text
- whatsapp_sent boolean
- whatsapp_sent_at timestamptz
- created_at timestamptz
- updated_at timestamptz

### product_attribute_values
- id uuid PK
- attribute_id uuid FK → product_attributes(id)
- value text
- created_at timestamptz

### product_attributes
- id uuid PK
- name text UNIQUE
- created_at timestamptz
- is_variant_capable boolean
- applicability jsonb

### product_collections
- product_id uuid FK → products(id)
- collection_id uuid FK → collections(id)

### product_tags
- name text PK
- label text
- created_at timestamptz

### product_variant_options
- variant_id uuid FK → product_variants(id)
- attribute_value_id uuid FK → product_attribute_values(id)

### product_variants
- id uuid PK
- product_id uuid FK → products(id)
- sku text UNIQUE
- price numeric
- stock integer
- images text[]
- is_active boolean
- created_at timestamptz
- updated_at timestamptz

### products
- id uuid PK
- name text
- slug text
- description text
- short_description text
- price numeric
- compare_at_price numeric
- stock integer
- sku text
- section section_type
- category_id uuid FK → categories(id)
- tags text[]
- status product_status
- images text[]
- is_featured boolean
- is_new boolean
- is_bestseller boolean
- is_active boolean
- created_at timestamptz
- updated_at timestamptz
- cover_image text
- is_featured_until timestamptz
- is_new_until timestamptz
- is_bestseller_until timestamptz
- ai_is_featured boolean
- ai_sales_note text
- ai_exclude boolean
- specs jsonb
- badges text[]

### smart_loyalty_propositions
- id uuid PK
- customer_id uuid FK → customer_profiles(id)
- coupon_code text FK → coupons(code)
- generated_code text
- personalized_message text
- discount_value numeric
- discount_type text ('percentage', 'fixed')
- expires_at timestamptz
- is_claimed boolean
- created_at timestamptz

### store_knowledge
- id uuid PK
- title text
- content text
- embedding (user-defined)
- category text
- source_type text
- source_id text
- metadata jsonb
- is_active boolean
- created_at timestamptz
- updated_at timestamptz

### store_settings
- id bigint PK (default 1)
- site_name text
- description text
- logo_url text
- whatsapp_number text
- whatsapp_default_message text
- social_links jsonb
- location_address text
- location_city text
- location_map_url text
- created_at timestamptz
- updated_at timestamptz
- bank_account_info text
- payment_methods jsonb
- hero_sliders jsonb
- loyalty_config jsonb
- flash_deals_end timestamptz
- featured_categories jsonb
- loyalty_tiers_config jsonb

### testimonials
- id uuid PK
- customer_name text
- customer_location text
- avatar_url text
- rating smallint
- title text
- body text
- section text
- category_id uuid FK → categories(id)
- product_id uuid FK → products(id)
- verified_purchase boolean
- is_featured boolean
- is_active boolean
- sort_order integer
- review_date date
- created_at timestamptz
- updated_at timestamptz

### user_notifications
- id uuid PK
- user_id uuid FK → auth.users(id)
- title text
- message text
- type text ('info', 'warning', 'alert', 'success')
- is_read boolean
- created_at timestamptz

### wheel_attempts
- id uuid PK
- customer_id uuid FK → customer_profiles(id)
- prize_id uuid FK → wheel_config(id)
- result_data jsonb
- created_at timestamptz

### wheel_config
- id uuid PK
- label text
- type text
- value jsonb
- probability double precision
- color text
- is_active boolean
- created_at timestamptz

---

## Triggers

- products: trigger_products_updated_at (UPDATE)
- customer_profiles: trg_customer_profiles_updated_at (UPDATE)
- orders: trg_orders_updated_at (UPDATE), trg_orders_set_number (INSERT), trg_orders_update_customer_stats (INSERT/UPDATE)
- testimonials: trg_testimonials_updated_at (UPDATE)
- brands: trigger_brands_updated_at (UPDATE)
- flash_deals: trg_flash_deals_updated_at (UPDATE)
- ai_customer_memory: trigger_customer_memory_updated_at (UPDATE)
- store_knowledge: store_knowledge_updated_at (UPDATE)

---

## Constraints, Índices, Relaciones
- Todas las FK, PK, UNIQUE, CHECK están incluidas en la definición de cada tabla.
- Para ver índices y constraints adicionales, ejecutar los queries del archivo export_supabase_schema.sql.

---

## Enums y Tipos
- section_type: 'vape', '420'
- product_status: 'active', 'legacy', 'discontinued', 'coming_soon'

---

## Storage Buckets
- customer-evidence: solo admins
- product-images: lectura pública, escritura admin

---

## Funciones y Triggers
- update_updated_at_column()
- trg_set_order_number()
- trg_update_customer_stats()
- handle_store_knowledge_updated_at()

---

> Si necesitas detalles de una tabla, constraint, trigger o función específica, comparte el resultado del query correspondiente y lo documento.
