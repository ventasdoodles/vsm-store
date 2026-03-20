-- Wave 191: Compatibility & Concepts Layer
-- Directional, explicit relations with scope-aware hardening.

-- 1. Product Concepts: Entities for compatibility mapping
CREATE TABLE IF NOT EXISTS public.product_concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    concept_type TEXT NOT NULL CHECK (concept_type IN (
        'brand', 'device', 'coil', 'pod', 'battery', 'liquid_type', 'connector', 'device_class', 'accessory'
    )),
    brand TEXT,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Concept Aliases: Naming variants for resolution
CREATE TABLE IF NOT EXISTS public.concept_aliases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_id UUID NOT NULL REFERENCES public.product_concepts(id) ON DELETE CASCADE,
    alias TEXT NOT NULL,
    locale TEXT DEFAULT 'es-MX',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(concept_id, alias)
);

-- 3. Compatibility Relations: The directional graph
CREATE TABLE IF NOT EXISTS public.compatibility_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    concept_a_id UUID NOT NULL REFERENCES public.product_concepts(id) ON DELETE CASCADE,
    concept_b_id UUID NOT NULL REFERENCES public.product_concepts(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN (
        'uses_coil', 'uses_pod', 'uses_battery', 'uses_liquid', 'recommended_for_liquid', 'has_connector', 'replaces'
    )),
    scope TEXT NOT NULL CHECK (scope IN ('specific_model', 'class_generalization')),
    status TEXT NOT NULL CHECK (status IN ('confirmed_compatible', 'confirmed_incompatible', 'unknown_unconfirmed')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(concept_a_id, concept_b_id, relation_type)
);

-- Indices for resolution performance
CREATE INDEX IF NOT EXISTS idx_concept_aliases_alias ON public.concept_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_compatibility_relations_a ON public.compatibility_relations(concept_a_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_relations_b ON public.compatibility_relations(concept_b_id);

-- RLS
ALTER TABLE public.product_concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concept_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_relations ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (needed for Edge Function reads)
-- Admin users (metadata->>'role' = 'admin') can write

CREATE POLICY "Allow service_role full access" ON public.product_concepts
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service_role full access aliases" ON public.concept_aliases
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Allow service_role full access relations" ON public.compatibility_relations
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Public concepts read (only via Edge Function/Service Role per plan, 
-- but we might need public read if the user wants it later. 
-- For now, sticking to SERVICE_ROLE only per plan §5)

-- Admin write policies (assuming standard auth.users metadata role pattern)
CREATE POLICY "Admins can manage concepts" ON public.product_concepts
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can manage aliases" ON public.concept_aliases
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can manage relations" ON public.compatibility_relations
    FOR ALL TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
