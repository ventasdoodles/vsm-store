-- ============================================================
-- VSM Store - Sistema de Usuarios, Ordenes y Lealtad
-- Migración 002
-- Fecha: 11 febrero 2026
-- ============================================================

-- ============================================================
-- 1. CUSTOMER PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    whatsapp TEXT,
    birthdate DATE,
    customer_tier TEXT DEFAULT 'bronze' CHECK (customer_tier IN ('bronze', 'silver', 'gold', 'platinum')),
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    favorite_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE customer_profiles IS 'Perfil extendido de clientes, vinculado 1:1 con auth.users';
COMMENT ON COLUMN customer_profiles.customer_tier IS 'bronze < silver < gold < platinum según total_spent';

-- ============================================================
-- 2. ADDRESSES
-- ============================================================
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('shipping', 'billing')),
    label TEXT,                          -- casa, oficina, etc
    full_name TEXT,                      -- nombre para envíos
    street TEXT NOT NULL,
    number TEXT NOT NULL,
    colony TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Xalapa',
    state TEXT NOT NULL DEFAULT 'Veracruz',
    zip_code TEXT NOT NULL,
    phone TEXT,
    notes TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE addresses IS 'Direcciones de envío/facturación por cliente';

-- ============================================================
-- 3. ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
    items JSONB NOT NULL,                -- [{product_id, name, price, quantity, image}]
    subtotal DECIMAL(10,2) NOT NULL,
    shipping_cost DECIMAL(10,2) DEFAULT 0,
    discount DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'transfer', 'card')),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    billing_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    tracking_notes TEXT,
    whatsapp_sent BOOLEAN DEFAULT false,
    whatsapp_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE orders IS 'Pedidos de la tienda, con items en JSONB';

-- ============================================================
-- 4. COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    description TEXT,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10,2) NOT NULL,
    min_purchase DECIMAL(10,2) DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE coupons IS 'Cupones de descuento (porcentaje o monto fijo)';

-- ============================================================
-- 5. CUSTOMER COUPONS (uso de cupones)
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    coupon_code TEXT NOT NULL REFERENCES coupons(code) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    used_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE customer_coupons IS 'Registro de cupones usados por cada cliente';

-- ============================================================
-- 6. LOYALTY POINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('earned', 'spent', 'expired')),
    description TEXT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE loyalty_points IS 'Transacciones del programa de puntos de lealtad';

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_addresses_customer_id ON addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(customer_id, is_default) WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_customer_coupons_customer ON customer_coupons(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_coupons_code ON customer_coupons(coupon_code);

CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_created ON loyalty_points(customer_id, created_at DESC);

-- ============================================================
-- FUNCIONES ÚTILES
-- ============================================================

-- Función reutilizable: actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Generar número de orden secuencial: VSM-0001, VSM-0002, ...
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(order_number FROM 5) AS INTEGER)
    ), 0) + 1
    INTO next_num
    FROM orders;

    RETURN 'VSM-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Calcular tier según total gastado
CREATE OR REPLACE FUNCTION calculate_tier(spent DECIMAL)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN spent >= 50000 THEN 'platinum'
        WHEN spent >= 20000 THEN 'gold'
        WHEN spent >= 5000  THEN 'silver'
        ELSE 'bronze'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Balance actual de puntos de lealtad
CREATE OR REPLACE FUNCTION get_customer_points_balance(p_customer_id UUID)
RETURNS INTEGER AS $$
DECLARE
    balance INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        CASE
            WHEN transaction_type = 'earned' THEN points
            WHEN transaction_type = 'spent' THEN -points
            WHEN transaction_type = 'expired' THEN -points
            ELSE 0
        END
    ), 0)
    INTO balance
    FROM loyalty_points
    WHERE customer_id = p_customer_id;

    RETURN balance;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at en customer_profiles
CREATE TRIGGER trg_customer_profiles_updated_at
    BEFORE UPDATE ON customer_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at en orders
CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-generar order_number antes de insertar orden
CREATE OR REPLACE FUNCTION trg_set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_set_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trg_set_order_number();

-- Actualizar total_orders, total_spent y tier cuando se crea/entrega una orden
CREATE OR REPLACE FUNCTION trg_update_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
    new_total_orders INTEGER;
    new_total_spent DECIMAL(10,2);
    new_tier TEXT;
BEGIN
    -- Solo recalcular si la orden se acaba de entregar, o es insert
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.status = 'delivered' AND OLD.status <> 'delivered') THEN
        IF NEW.customer_id IS NOT NULL THEN
            SELECT
                COUNT(*),
                COALESCE(SUM(total), 0)
            INTO new_total_orders, new_total_spent
            FROM orders
            WHERE customer_id = NEW.customer_id
              AND status = 'delivered';

            new_tier := calculate_tier(new_total_spent);

            UPDATE customer_profiles SET
                total_orders = new_total_orders,
                total_spent = new_total_spent,
                customer_tier = new_tier
            WHERE id = NEW.customer_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_update_customer_stats
    AFTER INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION trg_update_customer_stats();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- customer_profiles: usuario solo ve su propio perfil
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON customer_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON customer_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON customer_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- addresses: usuario solo ve sus propias direcciones
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
    ON addresses FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own addresses"
    ON addresses FOR INSERT
    WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own addresses"
    ON addresses FOR UPDATE
    USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own addresses"
    ON addresses FOR DELETE
    USING (customer_id = auth.uid());

-- orders: usuario solo ve sus propios pedidos
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
    ON orders FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own orders"
    ON orders FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- coupons: lectura pública, escritura solo admin (via service_role)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
    ON coupons FOR SELECT
    USING (is_active = true);

-- customer_coupons: usuario solo ve los suyos
ALTER TABLE customer_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coupon usage"
    ON customer_coupons FOR SELECT
    USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own coupon usage"
    ON customer_coupons FOR INSERT
    WITH CHECK (customer_id = auth.uid());

-- loyalty_points: usuario solo ve sus propios puntos
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own points"
    ON loyalty_points FOR SELECT
    USING (customer_id = auth.uid());

-- ============================================================
-- FIN DE MIGRACIÓN 002
-- ============================================================
