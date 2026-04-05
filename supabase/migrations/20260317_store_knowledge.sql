-- ============================================================================
-- Phase 3.2A: Knowledge RAG Foundation — Store Knowledge Base
-- Provides non-product factual knowledge retrieval for Cesarin OS
--
-- @author VSM Store / Antigravity
-- @version 1.0.0
-- @wave 169
-- ============================================================================

-- Ensure pgvector is enabled (already done in 20260312_neural_search_infra.sql)
create extension if not exists vector;

-- ----------------------------------------------------------------------------
-- TABLE: store_knowledge
-- Stores chunked knowledge fragments with vector embeddings for RAG retrieval.
-- Each row represents a single semantic chunk of a larger document.
-- ----------------------------------------------------------------------------
create table if not exists public.store_knowledge (
    id          uuid primary key default gen_random_uuid(),

    -- Content
    title       text not null,         -- Human-readable label (e.g., "Política de Envíos")
    content     text not null,         -- The actual text chunk for RAG injection

    -- Vector embedding (gemini-embedding-001, 768 dims)
    embedding   vector(768),

    -- Classification (controlled taxonomy — no free-text drift)
    category    text not null check (category in (
                    'shipping',       -- Shipping policies, DHL, OCURRE rules
                    'payments',       -- Payment methods, transfer instructions
                    'vape_basics',    -- Nicotine types, devices, liquids
                    '420_basics',     -- Cannabis product guide
                    'policies',       -- Returns, privacy, TOS
                    'faq',            -- Common customer questions
                    'onboarding'      -- First-time buyer guide
                )),

    source_type text not null check (source_type in (
                    'manual',              -- Hand-entered by admin
                    'policy_doc',          -- Ingested from markdown/text file
                    'ai_rules_migrated'    -- Temporary: rules migrated from persona.ts
                )),

    -- Source identity for grouping chunks of the same document
    source_id   text,   -- e.g., 'politica-envios-v1', 'faq-vapeo-2026'

    -- Structured chunk metadata
    -- Fields: chunk_index (int), total_chunks (int), source_filename (text),
    --         char_count (int), overlap_chars (int)
    metadata    jsonb not null default '{}'::jsonb,

    -- Lifecycle management
    is_active   boolean not null default true,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

comment on table public.store_knowledge is 
    'Chunked, vectorized knowledge base for Cesarin OS RAG retrieval. '
    'Each row is a semantic chunk of a source document. Phase 3.2A.';

-- ----------------------------------------------------------------------------
-- INDEXES
-- ----------------------------------------------------------------------------

-- HNSW index for cosine similarity search.
-- Chosen over IVFFlat because:
--   1. No minimum row count requirement (IVFFlat needs lists×20 rows to be effective)
--   2. Better recall at small-to-medium dataset sizes
--   3. Native support in Supabase pgvector 0.5+
-- m=16, ef_construction=64 are safe defaults for < 100k chunks.
create index if not exists store_knowledge_embedding_idx
    on public.store_knowledge
    using hnsw (embedding vector_cosine_ops)
    with (m = 16, ef_construction = 64);

-- Index for fast category filtering
create index if not exists store_knowledge_category_idx
    on public.store_knowledge (category)
    where is_active = true;

-- Index for source_id grouping (useful for refreshing a document's chunks)
create index if not exists store_knowledge_source_id_idx
    on public.store_knowledge (source_id)
    where source_id is not null;

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ----------------------------------------------------------------------------
alter table public.store_knowledge enable row level security;

-- Authenticated users can read active knowledge (for Cesarin in storefront)
drop policy if exists "store_knowledge_select_active" on public.store_knowledge;
create policy "store_knowledge_select_active"
    on public.store_knowledge
    for select
    to authenticated
    using (is_active = true);

-- Anon users can also read (Cesarin is accessible without login)
drop policy if exists "store_knowledge_select_active_anon" on public.store_knowledge;
create policy "store_knowledge_select_active_anon"
    on public.store_knowledge
    for select
    to anon
    using (is_active = true);

-- Only service role (edge functions) can write
-- (No explicit policy needed — service role bypasses RLS)

-- ----------------------------------------------------------------------------
-- HELPER: Auto-update updated_at on mutation
-- ----------------------------------------------------------------------------
create or replace function public.handle_store_knowledge_updated_at()
returns trigger language plpgsql as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists store_knowledge_updated_at on public.store_knowledge;
create trigger store_knowledge_updated_at
    before update on public.store_knowledge
    for each row execute function public.handle_store_knowledge_updated_at();

-- ----------------------------------------------------------------------------
-- RPC: match_knowledge
-- Semantic similarity search for RAG retrieval.
-- Used by customer-intelligence in Phase 3.2C.
-- ----------------------------------------------------------------------------
create or replace function public.match_knowledge (
    query_embedding vector(768),
    match_threshold float  default 0.70,
    match_count     int    default 3,
    filter_category text   default null
)
returns table (
    id          uuid,
    title       text,
    content     text,
    category    text,
    source_id   text,
    similarity  float
)
language plpgsql
security definer  -- allows anon callers if needed
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
    'Used by Cesarin OS RAG pipeline (Phase 3.2C+).';
