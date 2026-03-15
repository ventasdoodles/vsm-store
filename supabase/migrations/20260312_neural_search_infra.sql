-- Wave 120: Neural Commerce Infrastructure
-- Enable pgvector extension for semantic search
create extension if not exists vector;

-- Add embedding column to products for semantic discovery
-- Using 1536 dimensions (Standard for Gemini/OpenAI embeddings)
alter table products add column if not exists embedding vector(1536);

-- Create a spatial index for faster similarity searches (Cosine distance)
create index if not exists products_embedding_idx on products 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- RPC for Neural/Semantic Search
create or replace function match_products (
  query_embedding vector(1536),
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
  similarity float
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
    p.section,
    1 - (p.embedding <=> query_embedding) as similarity
  from products p
  where 1 - (p.embedding <=> query_embedding) > match_threshold
    and p.stock >= min_stock
    and p.status = 'published'
  order by p.embedding <=> query_embedding
  limit match_count;
end;
$$;
