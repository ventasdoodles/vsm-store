-- Fix AI Catalog Sync (Soft Delete Visibility)
-- Ensures that products marked as is_active = false or status != 'active' are completely invisible to semantic search

DROP FUNCTION IF EXISTS match_products(vector, float, int, int);

CREATE OR REPLACE FUNCTION match_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  min_stock int default 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  cover_image text,
  section text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.cover_image,
    p.section::text AS section,
    1 - (p.embedding <=> query_embedding) AS similarity
  FROM products p
  WHERE 1 - (p.embedding <=> query_embedding) > match_threshold
    AND p.stock >= min_stock
    AND p.status = 'active'
    AND p.is_active = true
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
