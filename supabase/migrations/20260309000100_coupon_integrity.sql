-- 20260309: Inteligencia de Cupones y Propuestas IA
-- Propósito: Corregir race conditions y preparar terreno para IA Loyalty.

-- 1. Función RPC para incrementar usos de cupones de forma atómica
-- Evita el error manual de update desde el cliente (Race Condition #8)
CREATE OR REPLACE FUNCTION increment_coupon_uses(target_coupon_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE coupons
    SET current_uses = current_uses + 1
    WHERE id = target_coupon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Tabla para propuestas de lealtad basadas en IA
-- Aquí se guardarán los cupones y mensajes generados por la Edge Function del motor de IA.
CREATE TABLE IF NOT EXISTS public.smart_loyalty_propositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
    generated_code TEXT NOT NULL,
    personalized_message TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    segment_at_generation TEXT NOT NULL, -- Segmento RFM que gatilló la oferta
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
    is_claimed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS para smart_loyalty_propositions
ALTER TABLE public.smart_loyalty_propositions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los clientes pueden ver sus propias propuestas de IA" 
ON public.smart_loyalty_propositions FOR SELECT 
USING (auth.uid() = customer_id);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_smart_propositions_customer ON public.smart_loyalty_propositions(customer_id);
CREATE INDEX IF NOT EXISTS idx_smart_propositions_active ON public.smart_loyalty_propositions(customer_id) WHERE NOT is_claimed AND expires_at > now();

COMMENT ON TABLE public.smart_loyalty_propositions IS 'Almacena ofertas personalizadas generadas por el motor de IA para cada segmento de cliente.';
