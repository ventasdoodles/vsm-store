-- Tabla para registrar propuestas de lealtad inteligentes generadas por IA
CREATE TABLE IF NOT EXISTS public.smart_loyalty_propositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.customer_profiles(id) ON DELETE CASCADE,
    coupon_code TEXT REFERENCES public.coupons(code) ON DELETE SET NULL, -- FK correcto según DB
    generated_code TEXT NOT NULL,
    personalized_message TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    expires_at TIMESTAMPTZ NOT NULL,
    is_claimed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_smart_loyalty_customer_id ON public.smart_loyalty_propositions(customer_id);
CREATE INDEX IF NOT EXISTS idx_smart_loyalty_expires_at ON public.smart_loyalty_propositions(expires_at);

-- Habilitar RLS
ALTER TABLE public.smart_loyalty_propositions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view their own propositions"
    ON public.smart_loyalty_propositions
    FOR SELECT
    USING (auth.uid() = customer_id);

CREATE POLICY "Users can update (claim) their own propositions"
    ON public.smart_loyalty_propositions
    FOR UPDATE
    USING (auth.uid() = customer_id)
    WITH CHECK (auth.uid() = customer_id);

-- Opcional: Policy para Service Role / Webhooks 
CREATE POLICY "Service role full access on smart_loyalty_propositions"
    ON public.smart_loyalty_propositions
    FOR ALL
    USING (current_user = 'postgres' OR current_user = 'service_role');
