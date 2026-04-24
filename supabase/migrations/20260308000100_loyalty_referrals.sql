-- ============================================
-- VSM Store - Loyalty Boost: Referidos
-- Migración: 20260308_loyalty_referrals.sql
-- Descripción: Añade códigos de referido a perfiles y tabla de seguimiento.
-- ============================================

-- 1. Añadir columna de código de referido a perfiles
ALTER TABLE customer_profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON customer_profiles(referral_code);

-- 2. Función para generar códigos aleatorios (Ej: VSM-X7R2)
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    done BOOLEAN DEFAULT FALSE;
BEGIN
    WHILE NOT done LOOP
        new_code := 'VSM-' || upper(substring(md5(random()::text) from 1 for 6));
        LOCK TABLE customer_profiles IN EXCLUSIVE MODE;
        IF NOT EXISTS (SELECT 1 FROM customer_profiles WHERE referral_code = new_code) THEN
            done := TRUE;
        END IF;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger para asignar código a nuevos usuarios si no tienen uno
CREATE OR REPLACE FUNCTION trigger_set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := generate_unique_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_referral_code ON customer_profiles;
CREATE TRIGGER tr_set_referral_code
BEFORE INSERT ON customer_profiles
FOR EACH ROW
EXECUTE FUNCTION trigger_set_referral_code();

-- 4. Asignar códigos a usuarios existentes que no tengan
UPDATE customer_profiles SET referral_code = generate_unique_referral_code() WHERE referral_code IS NULL;

-- 5. Tabla de seguimiento de referidos
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES customer_profiles(id) NOT NULL,
    referred_id UUID REFERENCES customer_profiles(id) NOT NULL UNIQUE, -- Un usuario solo puede ser referido una vez
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending',
    reward_points_referrer INTEGER DEFAULT 0,
    reward_points_referred INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    UNIQUE(referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

-- 6. Función RPC para procesar recompensas tras primera compra
-- Nota: En un entorno de producción real, esto se llamaría desde un webhook de pago o trigger de pedido
CREATE OR REPLACE FUNCTION process_referral_reward(p_order_id UUID, p_customer_id UUID)
RETURNS VOID AS $$
DECLARE
    v_referrer_id UUID;
    v_reward_referrer INTEGER := 50; -- Configurable
    v_reward_referred INTEGER := 25; -- Configurable
BEGIN
    -- Verificar si el usuario fue referido y está pendiente
    SELECT referrer_id INTO v_referrer_id 
    FROM referrals 
    WHERE referred_id = p_customer_id AND status = 'pending';

    IF v_referrer_id IS NOT NULL THEN
        -- 1. Marcar referido como completado
        UPDATE referrals 
        SET status = 'completed', 
            completed_at = NOW(),
            reward_points_referrer = v_reward_referrer,
            reward_points_referred = v_reward_referred
        WHERE referred_id = p_customer_id;

        -- 2. Otorgar puntos al referente
        INSERT INTO loyalty_points (customer_id, points, transaction_type, description, order_id)
        VALUES (v_referrer_id, v_reward_referrer, 'earned', 'Recompensa por invitación completada', p_order_id);

        -- 3. Otorgar puntos al referido
        INSERT INTO loyalty_points (customer_id, points, transaction_type, description, order_id)
        VALUES (p_customer_id, v_reward_referred, 'earned', 'Bono de bienvenida por invitación', p_order_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para disparar recompensas cuando se paga una orden
CREATE OR REPLACE FUNCTION trg_on_order_paid_referral()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el estado de pago cambia a 'paid'
    IF (NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status <> 'paid')) OR
       (NEW.status = 'delivered' AND (OLD.status IS NULL OR OLD.status <> 'delivered')) THEN
        PERFORM process_referral_reward(NEW.id, NEW.customer_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_order_paid_referral ON orders;
CREATE TRIGGER tr_order_paid_referral
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION trg_on_order_paid_referral();

-- 9. RLS para referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrer puede ver sus referidos" ON referrals
    FOR SELECT USING (auth.uid() = referrer_id);

CREATE POLICY "Referred puede ver su invitación" ON referrals
    FOR SELECT USING (auth.uid() = referred_id);
