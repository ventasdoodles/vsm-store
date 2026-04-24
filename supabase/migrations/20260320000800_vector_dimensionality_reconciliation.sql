-- ============================================================================
-- Vector Dimensionality Reconciliation - 768d Canon Alignment
-- ============================================================================
-- Context: the neural search infrastructure was originally created with
-- products.embedding vector(768) and store_knowledge.embedding vector(1536).
-- Active Gemini embedding production now standardizes on gemini-embedding-001
-- with outputDimensionality: 768. This migration reconciles replayed schema
-- and RPC truth to that canonical embedding standard.
-- ============================================================================

drop index if exists products_embedding_idx;

alter table products alter column embedding type vector(768)
    using embedding::vector(768);

create index if not exists products_embedding_idx on products
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

drop function if exists match_products(vector(768), float, int, int);
drop function if exists match_products(vector(3072), float, int, int);

create or replace function match_products (
  query_embedding vector(768),
  match_threshold float,
  match_count     int,
  min_stock       int default 0
)
returns table (
  id            uuid,
  name          text,
  slug          text,
  description   text,
  price         numeric,
  cover_image   text,
  section       text,
  similarity    float,
  ai_sales_note text,
  specs         jsonb
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
    p.section::text as section,
    1 - (p.embedding <=> query_embedding) as similarity,
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

drop index if exists store_knowledge_embedding_idx;

alter table store_knowledge alter column embedding type vector(768)
    using embedding::vector(768);

create index if not exists store_knowledge_embedding_idx
    on public.store_knowledge
    using hnsw (embedding vector_cosine_ops)
    with (m = 16, ef_construction = 64);

drop function if exists match_knowledge(vector(768), float, int, text);
drop function if exists match_knowledge(vector(1536), float, int, text);
drop function if exists match_knowledge(vector(3072), float, int, text);

create or replace function public.match_knowledge (
    query_embedding vector(768),
    match_threshold float  default 0.70,
    match_count     int    default 3,
    filter_category text   default null
)
returns table (
    id         uuid,
    title      text,
    content    text,
    category   text,
    source_id  text,
    similarity float
)
language plpgsql
security definer
as $$
begin
    return query
    select
        k.id,
        k.title,
        k.content,
        k.category,
        k.source_id,
        1 - (k.embedding <=> query_embedding) as similarity
    from public.store_knowledge k
    where k.is_active = true
      and k.embedding is not null
      and 1 - (k.embedding <=> query_embedding) > match_threshold
      and (filter_category is null or k.category = filter_category)
    order by k.embedding <=> query_embedding
    limit match_count;
end;
$$;

comment on function public.match_knowledge is
    'Phase 3.2A - Semantic search over store_knowledge. '
    'Reconciled to canonical 768d embedding standard.';
