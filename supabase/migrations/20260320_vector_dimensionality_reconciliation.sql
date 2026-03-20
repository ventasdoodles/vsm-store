-- ============================================================================
-- Vector Dimensionality Reconciliation — 3072d Canon Alignment
-- ============================================================================
-- Context: The neural search infrastructure was originally created with
-- products.embedding vector(768) and store_knowledge.embedding vector(1536).
-- All active embedding producers (seed_products.ts, knowledge-ingestor,
-- seed_runner.ts) and the canonical test suite have since standardized on
-- gemini-embedding-001 with outputDimensionality: 3072. The live database
-- is already operating at 3072d; these migrations reconcile the repo so that
-- a fresh replay or rebuild produces a schema consistent with the current
-- canonical embedding standard and no RPC signature mismatch.
-- ============================================================================

-- ── PRODUCTS ────────────────────────────────────────────────────────────────

-- Drop the spatial index before altering the column type.
-- (PostgreSQL requires dropping dependent indexes before a column type change.)
drop index if exists products_embedding_idx;

-- Reconcile column type from 768d to 3072d.
alter table products alter column embedding type vector(3072);

-- Recreate IVFFlat index (preserves original index strategy).
create index if not exists products_embedding_idx on products
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Drop all known overloads of match_products.
-- Covers: fresh replay (still vector(768)) and live DB (already vector(3072)).
drop function if exists match_products(vector(768), float, int, int);
drop function if exists match_products(vector(3072), float, int, int);

-- Recreate match_products with canonical 3072d signature.
-- Return shape is the current final shape from 20260320_match_products_add_specs.sql.
create or replace function match_products (
  query_embedding vector(3072),
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
    p.section::text          as section,
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

-- ── STORE KNOWLEDGE ─────────────────────────────────────────────────────────

-- Drop the HNSW index before altering the column type.
drop index if exists store_knowledge_embedding_idx;

-- Reconcile column type from 1536d to 3072d.
alter table store_knowledge alter column embedding type vector(3072);

-- Recreate HNSW index (preserves original index strategy from 20260317).
create index if not exists store_knowledge_embedding_idx
    on public.store_knowledge
    using hnsw (embedding vector_cosine_ops)
    with (m = 16, ef_construction = 64);

-- Drop all known overloads of match_knowledge.
-- Covers: fresh replay (still vector(1536)) and live DB (already vector(3072)).
drop function if exists match_knowledge(vector(1536), float, int, text);
drop function if exists match_knowledge(vector(3072), float, int, text);

-- Recreate match_knowledge with canonical 3072d signature.
-- Return shape and behavior unchanged from 20260317_store_knowledge.sql.
create or replace function public.match_knowledge (
    query_embedding vector(3072),
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
    'Phase 3.2A — Semantic search over store_knowledge. '
    'Reconciled to canonical 3072d embedding standard.';
