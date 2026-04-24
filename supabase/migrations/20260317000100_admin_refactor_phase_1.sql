-- Admin Refactor Phase 1: Catalog Ontology (Wave 160)
-- 1. Evolve Product Attributes
ALTER TABLE public.product_attributes 
ADD COLUMN IF NOT EXISTS is_variant_capable BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS applicability JSONB DEFAULT '{"sections": ["vape", "420"]}';

-- 2. Add Structured Specs and Badges to Products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS specs JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- 3. Collections System
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_collections (
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, collection_id)
);

-- 4. Initial Migration: Move legacy flags to badges array
-- We keep the columns for now to avoid breaking existing queries, but sync data.
UPDATE public.products 
SET badges = ARRAY_REMOVE(
    ARRAY[
        CASE WHEN is_new = true THEN 'new' ELSE NULL END,
        CASE WHEN is_featured = true THEN 'featured' ELSE NULL END,
        CASE WHEN is_bestseller = true THEN 'bestseller' ELSE NULL END,
        CASE WHEN ai_is_featured = true THEN 'ai-featured' ELSE NULL END
    ], 
    NULL
);

-- 5. RLS for Collections
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collections visible públicamente" ON public.collections
    FOR SELECT USING (is_active = true);

CREATE POLICY "Product collections visible públicamente" ON public.product_collections
    FOR SELECT USING (true);
