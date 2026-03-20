-- Add specs (JSONB) to match_products RPC return shape.
-- Allows semantic response drafting to use curated product facts.
-- Minimum safe change: one column added to RETURNS TABLE and SELECT.
drop function if exists match_products(vector(768), float, int, int);
create or replace function match_products (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  min_stock int default 0
)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  cover_image text,
  section text,
  similarity float,
  ai_sales_note text,
  specs jsonb
)
language plpgsql
as $$
begin
  return query
  select
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.cover_image,
    p.section::text AS section,
    1 - (p.embedding <=> query_embedding) AS similarity,
    p.ai_sales_note,
    p.specs
  from products p
  where 1 - (p.embedding <=> query_embedding) > match_threshold
    and p.stock >= min_stock
    and p.status = 'active'
  order by p.embedding <=> query_embedding
  limit match_count;
end;
$$;
