-- 🎡 SISTEMA DE RULETA DE PREMIOS (WAVE 22)
-- Definición de premios, configuraciones e historial de giros.

-- 1. Tabla de configuración de segmentos de la ruleta
CREATE TABLE IF NOT EXISTS public.wheel_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label TEXT NOT NULL,           -- Nombre visible (ej: "100 V-Coins")
    type TEXT NOT NULL,            -- 'points', 'coupon', 'empty'
    value JSONB,                   -- { amount: 100 } o { code: 'PROMO10' }
    probability FLOAT NOT NULL,    -- 0.0 a 1.0 (suma de todos debe ser 1.0)
    color TEXT,                    -- Color hexadecimal para el segmento
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de intentos/giros de clientes
CREATE TABLE IF NOT EXISTS public.wheel_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    prize_id UUID REFERENCES public.wheel_config(id),
    result_data JSONB,             -- Copia de lo que ganó en ese momento
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. RLS Policies
ALTER TABLE public.wheel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_attempts ENABLE ROW LEVEL SECURITY;

-- Configuración es visible para todos
CREATE POLICY "Wheel config is public" ON public.wheel_config
    FOR SELECT TO authenticated, anon USING (true);

-- Intentos solo visibles/creables por el dueño
CREATE POLICY "Users can view their own attempts" ON public.wheel_attempts
    FOR SELECT TO authenticated USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert their own attempts" ON public.wheel_attempts
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);

-- 4. Datos iniciales (Seed)
INSERT INTO public.wheel_config (label, type, value, probability, color) VALUES
('100 V-Coins', 'points', '{"amount": 100}', 0.20, '#3b82f6'),
('Cupón 10%', 'coupon', '{"discount": 10, "type": "percentage"}', 0.25, '#10b981'),
('Envío Gratis', 'coupon', '{"type": "free_shipping"}', 0.15, '#f59e0b'),
('500 V-Coins', 'points', '{"amount": 500}', 0.05, '#8b5cf6'),
('Sigue participando', 'empty', '{}', 0.35, '#4b5563');

-- 5. Función para verificar si puede girar hoy (1 vez cada 24h)
CREATE OR REPLACE FUNCTION public.can_user_spin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    last_spin TIMESTAMPTZ;
BEGIN
    SELECT created_at INTO last_spin
    FROM public.wheel_attempts
    WHERE customer_id = user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF last_spin IS NULL OR last_spin < (now() - interval '24 hours') THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
