-- ============================================
-- VSM Store - Schema Inicial
-- Migración: 001_initial_schema.sql
-- Fecha: 2026-02-11
-- ============================================

-- ============================================
-- 1. TIPOS ENUM
-- ============================================

CREATE TYPE section_type AS ENUM ('vape', '420');
CREATE TYPE product_status AS ENUM ('active', 'legacy', 'discontinued', 'coming_soon');

-- ============================================
-- 2. TABLA: categories
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  section section_type NOT NULL,
  parent_id UUID REFERENCES categories(id),
  description TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, section)
);

CREATE INDEX idx_categories_section ON categories(section);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- ============================================
-- 3. TABLA: products
-- ============================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  sku TEXT,
  section section_type NOT NULL,
  category_id UUID REFERENCES categories(id) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status product_status DEFAULT 'active',
  images TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  is_bestseller BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(slug, section)
);

CREATE INDEX idx_products_section ON products(section);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- ============================================
-- 4. TRIGGER: updated_at automático
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Lectura pública para categorías activas
CREATE POLICY "Categories visible públicamente" ON categories
  FOR SELECT USING (is_active = true);

-- Lectura pública para productos activos
CREATE POLICY "Products visible públicamente" ON products
  FOR SELECT USING (is_active = true AND status = 'active');

-- ============================================
-- 6. SEED: Categorías (11 + 2 subcategorías = 13)
-- ============================================

-- === VAPE (5 categorías principales) ===

INSERT INTO categories (name, slug, section, description, order_index) VALUES
  ('Mods', 'mods', 'vape', 'Dispositivos de vapeo: regulados, mecánicos, box mods y pod systems', 1),
  ('Atomizadores', 'atomizadores', 'vape', 'Tanques, RDAs, RTAs y RDTAs para vapeo avanzado', 2),
  ('Líquidos', 'liquidos', 'vape', 'E-liquids en diversas concentraciones y sabores', 3),
  ('Coils', 'coils', 'vape', 'Resistencias y coils prefabricados para todo tipo de atomizador', 4),
  ('Accesorios Vape', 'accesorios-vape', 'vape', 'Baterías, algodón, herramientas y más accesorios de vapeo', 5);

-- Subcategorías de Líquidos
INSERT INTO categories (name, slug, section, parent_id, description, order_index) VALUES
  ('Base Libre', 'base-libre', 'vape', (SELECT id FROM categories WHERE slug = 'liquidos' AND section = 'vape'), 'E-liquids freebase con nicotina regular', 1),
  ('Sales', 'sales', 'vape', (SELECT id FROM categories WHERE slug = 'liquidos' AND section = 'vape'), 'E-liquids con sales de nicotina para MTL', 2);

-- === 420 (6 categorías principales) ===

INSERT INTO categories (name, slug, section, description, order_index) VALUES
  ('Vaporizers', 'vaporizers', '420', 'Vaporizadores de hierba seca y concentrados', 1),
  ('Fumables', 'fumables', '420', 'Flores, pre-rolls y productos para fumar', 2),
  ('Comestibles', 'comestibles', '420', 'Gomitas, chocolates, bebidas y más comestibles infusionados', 3),
  ('Concentrados', 'concentrados', '420', 'Wax, aceites, shatter y otros concentrados', 4),
  ('Tópicos', 'topicos', '420', 'Cremas, bálsamos y productos de uso tópico', 5),
  ('Accesorios 420', 'accesorios-420', '420', 'Grinders, papeles, bongs y accesorios para 420', 6);

-- ============================================
-- 7. SEED: Productos (40 total)
-- ============================================

-- -----------------------------------------------
-- MODS (10 productos) — sección vape
-- -----------------------------------------------

INSERT INTO products (name, slug, description, short_description, price, compare_at_price, stock, sku, section, category_id, tags, status, images, is_featured, is_new, is_bestseller) VALUES
(
  'Mod Regulado 80W Compact',
  'mod-regulado-80w-compact',
  'Mod regulado compacto de 80W con pantalla OLED, control de temperatura y chip avanzado. Ideal para uso diario con batería 18650.',
  'Mod compacto 80W con pantalla OLED',
  899.00, 1099.00, 25, 'VSM-VP-MOD-001', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['regulado', '80w', '510-thread', 'compacto'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Mod+80W'],
  true, false, true
),
(
  'Box Mod 200W Dual Battery',
  'box-mod-200w-dual-battery',
  'Box mod de alta potencia con doble batería 18650, modo VW/TC/Bypass, pantalla a color y construcción en zinc alloy.',
  'Box mod 200W doble batería',
  1850.00, 2200.00, 15, 'VSM-VP-MOD-002', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['regulado', 'potencia-alta', '200w', 'dual-battery'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Box+200W'],
  true, true, false
),
(
  'Mod Mecánico Tubular Pro',
  'mod-mecanico-tubular-pro',
  'Mod mecánico tubular de cobre con switch magnético, conexión 510 híbrida y acabado pulido. Para usuarios avanzados.',
  'Mod mecánico tubular cobre',
  1200.00, NULL, 10, 'VSM-VP-MOD-003', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['mecanico', 'tubular', 'cobre', 'avanzado'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Mech+Mod'],
  false, false, false
),
(
  'Pod System Starter Kit',
  'pod-system-starter-kit',
  'Kit de inicio pod system con batería integrada de 800mAh, cartuchos rellenables y draw activation. Perfecto para principiantes.',
  'Pod system ideal para iniciar',
  450.00, 599.00, 40, 'VSM-VP-MOD-004', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['pod', 'starter-kit', 'principiante', 'mtl'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Pod+Kit'],
  false, true, true
),
(
  'Mod Squonk 100W BF',
  'mod-squonk-100w-bf',
  'Mod squonk bottom-feeder de 100W con botella de silicona de 8ml, chip regulado y compatibilidad con atomizadores BF.',
  'Squonk mod 100W bottom-feeder',
  1650.00, NULL, 8, 'VSM-VP-MOD-005', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['squonk', 'bf', 'regulado', '100w'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Squonk+100W'],
  false, true, false
),
(
  'Mini Mod 40W Stealth',
  'mini-mod-40w-stealth',
  'Mod ultra compacto de 40W con batería integrada de 1500mAh, modo stealth y diseño ergonómico de bolsillo.',
  'Ultra compacto 40W de bolsillo',
  650.00, 799.00, 30, 'VSM-VP-MOD-006', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['mini', 'stealth', 'compacto', '40w'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Mini+40W'],
  false, false, false
),
(
  'Box Mod 150W TC',
  'box-mod-150w-tc',
  'Box mod con control de temperatura avanzado, compatible con NI200, TI y SS316. Pantalla TFT a color y firmware actualizable.',
  'Box mod 150W control de temperatura',
  2100.00, 2499.00, 12, 'VSM-VP-MOD-007', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['regulado', 'tc', '150w', 'firmware'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Mod+150W+TC'],
  true, false, false
),
(
  'Pod Mod AIO 60W',
  'pod-mod-aio-60w',
  'Dispositivo all-in-one de 60W con cartuchos intercambiables, airflow ajustable y batería de 2500mAh.',
  'All-in-one 60W con cartuchos',
  780.00, NULL, 22, 'VSM-VP-MOD-008', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['aio', 'pod-mod', '60w', 'versatil'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=AIO+60W'],
  false, false, true
),
(
  'Mod DNA 250C Premium',
  'mod-dna-250c-premium',
  'Mod premium con chipset DNA 250C de Evolv, pantalla a color, perfiles personalizables y acabado estabilizado en madera.',
  'Premium con chip DNA 250C',
  3200.00, 3800.00, 5, 'VSM-VP-MOD-009', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['premium', 'dna', '250c', 'estabilizado'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=DNA+250C'],
  false, false, false
),
(
  'Mod Pen Style 22mm',
  'mod-pen-style-22mm',
  'Dispositivo tipo pluma de 22mm con batería integrada de 1800mAh, salida directa y botón de disparo ergonómico.',
  'Estilo pluma compacto 22mm',
  380.00, NULL, 35, 'VSM-VP-MOD-010', 'vape',
  (SELECT id FROM categories WHERE slug = 'mods' AND section = 'vape'),
  ARRAY['pen', '22mm', 'directo', 'simple'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Pen+22mm'],
  false, true, false
);

-- -----------------------------------------------
-- LÍQUIDOS BASE LIBRE (5 productos) — sección vape
-- -----------------------------------------------

INSERT INTO products (name, slug, description, short_description, price, compare_at_price, stock, sku, section, category_id, tags, status, images, is_featured, is_new, is_bestseller) VALUES
(
  'E-Liquid Frutas Tropicales 60ml 6mg',
  'eliquid-frutas-tropicales-60ml-6mg',
  'Mezcla tropical de mango, maracuyá y piña en base 70VG/30PG. Sabor intenso y nubes densas. Nicotina freebase 6mg.',
  'Frutas tropicales 60ml freebase',
  280.00, 350.00, 45, 'VSM-VP-LIQ-001', 'vape',
  (SELECT id FROM categories WHERE slug = 'base-libre' AND section = 'vape'),
  ARRAY['freebase', '60ml', 'sabor-frutas', '6mg', '70vg'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Frutas+60ml'],
  true, false, true
),
(
  'E-Liquid Mentolado Ice 120ml 3mg',
  'eliquid-mentolado-ice-120ml-3mg',
  'Explosión de menta glacial con toque de eucalipto. Base 80VG/20PG para máximo vapor. Nicotina 3mg.',
  'Mentolado intenso 120ml',
  399.00, NULL, 30, 'VSM-VP-LIQ-002', 'vape',
  (SELECT id FROM categories WHERE slug = 'base-libre' AND section = 'vape'),
  ARRAY['freebase', '120ml', 'mentolado', '3mg', '80vg'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Mentol+120ml'],
  false, true, false
),
(
  'E-Liquid Postre Vainilla 60ml 3mg',
  'eliquid-postre-vainilla-60ml-3mg',
  'Sabor a natilla de vainilla con notas de caramelo y galleta. Base 70VG/30PG, ideal para sub-ohm.',
  'Postre de vainilla cremoso 60ml',
  260.00, 320.00, 38, 'VSM-VP-LIQ-003', 'vape',
  (SELECT id FROM categories WHERE slug = 'base-libre' AND section = 'vape'),
  ARRAY['freebase', '60ml', 'postre', '3mg', 'cremoso'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Vainilla+60ml'],
  false, false, true
),
(
  'E-Liquid Tabaco Rubio 30ml 12mg',
  'eliquid-tabaco-rubio-30ml-12mg',
  'Tabaco rubio tipo Virginia con toque dulce y ahumado. Base 50VG/50PG perfecta para MTL. Nicotina 12mg.',
  'Tabaco rubio clásico 30ml',
  180.00, NULL, 20, 'VSM-VP-LIQ-004', 'vape',
  (SELECT id FROM categories WHERE slug = 'base-libre' AND section = 'vape'),
  ARRAY['freebase', '30ml', 'tabaco', '12mg', '50vg'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Tabaco+30ml'],
  false, false, false
),
(
  'E-Liquid Berry Mix 100ml 6mg',
  'eliquid-berry-mix-100ml-6mg',
  'Combinación de frutos rojos: fresa, frambuesa y arándano con toque helado. Base 75VG/25PG.',
  'Mix de berries frescas 100ml',
  350.00, 420.00, 28, 'VSM-VP-LIQ-005', 'vape',
  (SELECT id FROM categories WHERE slug = 'base-libre' AND section = 'vape'),
  ARRAY['freebase', '100ml', 'sabor-frutas', '6mg', 'berries'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Berry+100ml'],
  false, true, false
);

-- -----------------------------------------------
-- LÍQUIDOS SALES DE NICOTINA (5 productos) — sección vape
-- -----------------------------------------------

INSERT INTO products (name, slug, description, short_description, price, compare_at_price, stock, sku, section, category_id, tags, status, images, is_featured, is_new, is_bestseller) VALUES
(
  'Nic Salt Mango Lychee 30ml 35mg',
  'nicsalt-mango-lychee-30ml-35mg',
  'Sales de nicotina sabor mango con lychee, golpe suave en garganta ideal para pod systems. 50VG/50PG.',
  'Sales de mango y lychee 30ml',
  250.00, 299.00, 50, 'VSM-VP-SAL-001', 'vape',
  (SELECT id FROM categories WHERE slug = 'sales' AND section = 'vape'),
  ARRAY['nic-salts', 'mtl', '30ml', '35mg', 'pod'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Salt+Mango'],
  true, false, true
),
(
  'Nic Salt Tabaco Clásico 30ml 50mg',
  'nicsalt-tabaco-clasico-30ml-50mg',
  'Sales de nicotina con sabor a tabaco clásico intenso. Alta concentración de 50mg para satisfacción inmediata.',
  'Sales tabaco intenso 50mg',
  270.00, NULL, 35, 'VSM-VP-SAL-002', 'vape',
  (SELECT id FROM categories WHERE slug = 'sales' AND section = 'vape'),
  ARRAY['nic-salts', 'mtl', '30ml', '50mg', 'alto-concentrado'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Salt+Tabaco'],
  false, false, false
),
(
  'Nic Salt Fresa Kiwi 30ml 20mg',
  'nicsalt-fresa-kiwi-30ml-20mg',
  'Combinación refrescante de fresa madura y kiwi ácido en sales de nicotina. Concentración baja-media de 20mg.',
  'Sales fresa kiwi suave 20mg',
  230.00, 280.00, 42, 'VSM-VP-SAL-003', 'vape',
  (SELECT id FROM categories WHERE slug = 'sales' AND section = 'vape'),
  ARRAY['nic-salts', 'mtl', '30ml', '20mg', 'sabor-frutas'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Salt+Fresa'],
  false, true, false
),
(
  'Nic Salt Uva Ice 15ml 50mg',
  'nicsalt-uva-ice-15ml-50mg',
  'Sales de nicotina sabor uva con efecto helado. Formato viajero de 15ml con alta concentración.',
  'Sales uva helada formato mini',
  200.00, NULL, 48, 'VSM-VP-SAL-004', 'vape',
  (SELECT id FROM categories WHERE slug = 'sales' AND section = 'vape'),
  ARRAY['nic-salts', 'mtl', '15ml', '50mg', 'ice'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Salt+Uva'],
  false, false, true
),
(
  'Nic Salt Sandía Mint 30ml 35mg',
  'nicsalt-sandia-mint-30ml-35mg',
  'Sabor a sandía dulce con toque de menta fresca en sales de nicotina. Balance perfecto entre dulzura y frescura.',
  'Sales sandía con menta 35mg',
  260.00, 310.00, 33, 'VSM-VP-SAL-005', 'vape',
  (SELECT id FROM categories WHERE slug = 'sales' AND section = 'vape'),
  ARRAY['nic-salts', 'mtl', '30ml', '35mg', 'sandia'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/60a5fa?text=Salt+Sandia'],
  false, true, false
);

-- -----------------------------------------------
-- VAPORIZERS (10 productos) — sección 420
-- -----------------------------------------------

INSERT INTO products (name, slug, description, short_description, price, compare_at_price, stock, sku, section, category_id, tags, status, images, is_featured, is_new, is_bestseller) VALUES
(
  'Vaporizer Portátil Dry Herb Classic',
  'vaporizer-portatil-dry-herb-classic',
  'Vaporizador portátil de hierba seca con cámara de cerámica, 5 niveles de temperatura y batería recargable de 2600mAh.',
  'Portátil hierba seca 5 temperaturas',
  2500.00, 2999.00, 18, 'VSM-420-VAP-001', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['portable', 'dry-herb', 'recargable', 'ceramica'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Vape+Portatil'],
  true, false, true
),
(
  'Desktop Vape Pro Station',
  'desktop-vape-pro-station',
  'Vaporizador de escritorio profesional con calentamiento por convección, control digital preciso y sistema whip + balloon.',
  'Desktop pro con convección',
  7500.00, 8500.00, 5, 'VSM-420-VAP-002', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['desktop', 'conveccion', 'profesional', 'dual-mode'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Desktop+Pro'],
  true, false, false
),
(
  'Pen Vaporizer Slim 420',
  'pen-vaporizer-slim-420',
  'Vaporizador tipo pluma ultra delgado para concentrados, calentamiento en 5 segundos y carga USB-C rápida.',
  'Pen ultra slim para concentrados',
  1200.00, NULL, 30, 'VSM-420-VAP-003', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['pen', 'concentrados', 'slim', 'usb-c'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Pen+Slim'],
  false, true, false
),
(
  'Vaporizer Hybrid Dual-Use',
  'vaporizer-hybrid-dual-use',
  'Vaporizador híbrido compatible con hierba seca y concentrados. Cámara intercambiable, pantalla OLED y app Bluetooth.',
  'Híbrido hierba + concentrados',
  4200.00, 4999.00, 10, 'VSM-420-VAP-004', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['hibrido', 'dry-herb', 'concentrados', 'bluetooth'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Hybrid+Vape'],
  false, true, true
),
(
  'Vaporizer Budget Starter',
  'vaporizer-budget-starter',
  'Vaporizador económico de hierba seca para principiantes. 3 niveles de temperatura, batería de 1600mAh y cámara de acero.',
  'Económico para principiantes',
  1500.00, 1899.00, 25, 'VSM-420-VAP-005', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['portable', 'dry-herb', 'principiante', 'economico'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Budget+Vape'],
  false, false, true
),
(
  'Vaporizer Premium Gold Edition',
  'vaporizer-premium-gold-edition',
  'Edición especial con acabado dorado, cámara de zirconia, haptic feedback y batería de 3500mAh. Incluye estuche premium.',
  'Edición gold con zirconia',
  6800.00, NULL, 3, 'VSM-420-VAP-006', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['premium', 'gold', 'zirconia', 'edicion-especial'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Gold+Edition'],
  true, true, false
),
(
  'Vaporizer On-Demand Convection',
  'vaporizer-on-demand-convection',
  'Vaporizador de convección on-demand con calentamiento instantáneo, ideal para microdosing y sabor puro.',
  'Convección pura on-demand',
  3800.00, 4300.00, 12, 'VSM-420-VAP-007', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['conveccion', 'on-demand', 'microdosing', 'sabor'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Convection'],
  false, false, false
),
(
  'Vaporizer Session King',
  'vaporizer-session-king',
  'Vaporizador de sesión con cámara XL de 0.5g, 10 niveles de temperatura y vibración al alcanzar temp. objetivo.',
  'Sesión XL 10 temperaturas',
  3200.00, NULL, 14, 'VSM-420-VAP-008', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['session', 'xl', 'portable', 'vibracion'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Session+King'],
  false, false, false
),
(
  'Vaporizer Micro Pod 420',
  'vaporizer-micro-pod-420',
  'Micro vaporizador tipo pod para extractos, compatible con cartuchos 510 y pods propietarios. Batería 650mAh.',
  'Micro pod para extractos',
  800.00, 999.00, 40, 'VSM-420-VAP-009', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['micro', 'pod', '510', 'extractos'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Micro+Pod'],
  false, true, false
),
(
  'Desktop Vape Balloon System',
  'desktop-vape-balloon-system',
  'Vaporizador de escritorio con sistema de bolsas (balloon) exclusivo, calentamiento preciso y partes de acero quirúrgico.',
  'Desktop con sistema balloon',
  5500.00, 6200.00, 7, 'VSM-420-VAP-010', '420',
  (SELECT id FROM categories WHERE slug = 'vaporizers' AND section = '420'),
  ARRAY['desktop', 'balloon', 'acero-quirurgico', 'profesional'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Balloon+Sys'],
  false, false, false
);

-- -----------------------------------------------
-- COMESTIBLES (10 productos) — sección 420
-- -----------------------------------------------

INSERT INTO products (name, slug, description, short_description, price, compare_at_price, stock, sku, section, category_id, tags, status, images, is_featured, is_new, is_bestseller) VALUES
(
  'Gomitas CBD 25mg x10 Frutas',
  'gomitas-cbd-25mg-x10-frutas',
  'Gomitas de CBD de espectro completo, 25mg por pieza. Sabores surtidos: fresa, mango, uva. 10 piezas por paquete.',
  'Gomitas CBD 25mg sabores surtidos',
  350.00, 420.00, 45, 'VSM-420-COM-001', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['cbd', 'gomitas', '25mg', 'full-spectrum', 'vegano'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Gomitas+CBD'],
  true, false, true
),
(
  'Chocolate Dark THC 10mg x4',
  'chocolate-dark-thc-10mg-x4',
  'Tableta de chocolate oscuro 70% cacao infusionada con 10mg de THC por pieza. 4 porciones individuales.',
  'Chocolate oscuro THC 10mg',
  280.00, NULL, 30, 'VSM-420-COM-002', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['thc', 'chocolate', '10mg', 'dark', 'cacao'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Choco+THC'],
  false, true, false
),
(
  'Refresco Hemp Limón 355ml',
  'refresco-hemp-limon-355ml',
  'Refresco artesanal infusionado con extracto de hemp. Sabor limón natural, sin azúcar añadida. 15mg CBD por lata.',
  'Refresco artesanal hemp limón',
  85.00, NULL, 50, 'VSM-420-COM-003', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['cbd', 'bebida', 'hemp', 'sin-azucar', 'limon'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Hemp+Soda'],
  false, false, true
),
(
  'Brownies CBD 50mg x2',
  'brownies-cbd-50mg-x2',
  'Pack de 2 brownies artesanales con 50mg de CBD cada uno. Textura húmeda, sabor a chocolate belga y nuez.',
  'Brownies artesanales CBD 50mg',
  420.00, 499.00, 20, 'VSM-420-COM-004', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['cbd', 'brownie', '50mg', 'artesanal', 'chocolate'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Brownie+CBD'],
  false, true, false
),
(
  'Miel CBD Raw 250ml',
  'miel-cbd-raw-250ml',
  'Miel de abeja pura infusionada con CBD de espectro completo. 500mg CBD total. Ideal para té, tostadas o directa.',
  'Miel pura con CBD 500mg total',
  580.00, 650.00, 15, 'VSM-420-COM-005', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['cbd', 'miel', 'raw', 'full-spectrum', 'natural'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Miel+CBD'],
  true, false, false
),
(
  'Gomitas THC Sour 5mg x20',
  'gomitas-thc-sour-5mg-x20',
  'Gomitas ácidas con 5mg de THC por pieza, 20 piezas por bolsa (100mg total). Sabores cítricos surtidos.',
  'Gomitas ácidas THC 5mg x20',
  450.00, NULL, 25, 'VSM-420-COM-006', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['thc', 'gomitas', '5mg', 'sour', 'citricos'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Sour+Gummies'],
  false, false, true
),
(
  'Té CBD Manzanilla x15 sobres',
  'te-cbd-manzanilla-x15',
  'Infusión de manzanilla con 10mg de CBD por sobre. Caja de 15 sobres. Ideal para relajación nocturna.',
  'Té de manzanilla con CBD',
  320.00, 380.00, 35, 'VSM-420-COM-007', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['cbd', 'te', 'manzanilla', 'relajante', 'nocturno'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Te+CBD'],
  false, true, false
),
(
  'Paletas CBD Sandía x5',
  'paletas-cbd-sandia-x5',
  'Pack de 5 paletas de sandía con 15mg de CBD cada una. Sin gluten, sin azúcar artificial, veganas.',
  'Paletas sandía CBD 15mg x5',
  250.00, NULL, 40, 'VSM-420-COM-008', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['cbd', 'paletas', '15mg', 'vegano', 'sin-gluten'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Paletas+CBD'],
  false, false, false
),
(
  'Caramelos Hard Candy THC 10mg x8',
  'caramelos-hard-candy-thc-10mg-x8',
  'Caramelos duros de menta infusionados con 10mg de THC cada uno. Pack de 8 piezas en lata metálica.',
  'Caramelos de menta THC 10mg',
  380.00, 430.00, 18, 'VSM-420-COM-009', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['thc', 'caramelos', '10mg', 'menta', 'hard-candy'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Candy+THC'],
  false, false, false
),
(
  'Agua Sparkling CBD 500ml x6',
  'agua-sparkling-cbd-500ml-x6',
  'Pack de 6 aguas minerales con gas infusionadas con 20mg de CBD por botella. Sin calorías, sin sabor artificial.',
  'Agua mineral con CBD x6 pack',
  540.00, 630.00, 22, 'VSM-420-COM-010', '420',
  (SELECT id FROM categories WHERE slug = 'comestibles' AND section = '420'),
  ARRAY['cbd', 'bebida', 'sparkling', 'sin-calorias', 'pack'], 'active',
  ARRAY['https://placehold.co/400x400/1e293b/10b981?text=Sparkling+CBD'],
  false, true, false
);

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
