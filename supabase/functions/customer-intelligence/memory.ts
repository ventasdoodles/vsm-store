export const GENERIC_INTERESTS = new Set([
  'vape',
  'vaping',
  'e-liquid',
  'vapeo',
  'store',
  'tienda',
  'producto',
  'hola',
  'cesar',
  'cesarin',
  'asistente',
  'asistencia',
  'vsm',
  'ayuda',
  'comprar',
  'precio',
  'costo',
  'gracias',
  'buenos',
  'dias',
  'tardes',
  'noches',
]);

export interface InterestMetadata {
  hits: number;
  last_at: string;
}

export interface CustomerMemoryRow {
  detected_interests?: string[] | null;
  interests_metadata?: Record<string, InterestMetadata> | null;
}

export interface MemoryPersistResult {
  ok: boolean;
  merged_interests: string[];
  metadata_count: number;
  error: string | null;
}

type QueryResult<T> = Promise<{ data: T; error: { message?: string } | null }>;

interface MemorySelectBuilder {
  select(columns: string): MemorySelectBuilder;
  eq(column: string, value: string): MemorySelectBuilder;
  maybeSingle(): QueryResult<CustomerMemoryRow | null>;
  upsert(payload: Record<string, unknown>, options: { onConflict: string }): QueryResult<null>;
}

export interface MemorySupabaseClient {
  from(table: 'ai_customer_memory'): MemorySelectBuilder;
}

/**
 * Sanitizes and merges new interests with existing ones.
 * Rules: Deduplicate, ignore generic, limit to 10.
 */
export function sanitizeAndMergeInterests(existing: string[] = [], newInterests: string[] = []): string[] {
  const combined = new Set(existing.map((interest) => interest.toLowerCase().trim()));

  newInterests.forEach((interest) => {
    const clean = interest.toLowerCase().trim();
    if (clean && !GENERIC_INTERESTS.has(clean) && clean.length > 2) {
      combined.add(clean);
    }
  });

  return Array.from(combined).slice(-10);
}

/**
 * Updates interest strength metadata based on repetition and recency.
 * Rules: Alignment with active capped set, increment hits, update last_at.
 */
export function updateInterestsMetadata(
  existing: Record<string, InterestMetadata> = {},
  activeInterests: string[]
): Record<string, InterestMetadata> {
  const updated: Record<string, InterestMetadata> = {};
  const now = new Date().toISOString();

  activeInterests.forEach((term) => {
    const clean = term.toLowerCase().trim();
    const prev = existing[clean];

    updated[clean] = {
      hits: (prev?.hits || 0) + 1,
      last_at: now,
    };
  });

  return updated;
}

export async function persistMemory(
  supabase: MemorySupabaseClient,
  customerId: string,
  newInterests: string[]
): Promise<MemoryPersistResult> {
  console.warn(`[Memory] Persisting for customer: ${customerId}`);

  const readBuilder = supabase
    .from('ai_customer_memory')
    .select('detected_interests, interests_metadata')
    .eq('customer_id', customerId);

  const { data: currentMemory, error: readError } = await readBuilder.maybeSingle();
  if (readError) {
    const message = readError.message || 'Unknown read error';
    console.error(`[Memory] Failed for ${customerId}: ${message}`);
    return {
      ok: false,
      merged_interests: [],
      metadata_count: 0,
      error: message,
    };
  }

  const mergedInterests = sanitizeAndMergeInterests(
    currentMemory?.detected_interests || [],
    newInterests
  );

  const updatedMetadata = updateInterestsMetadata(
    currentMemory?.interests_metadata || {},
    mergedInterests
  );

  const writeBuilder = supabase.from('ai_customer_memory');
  const { error: writeError } = await writeBuilder.upsert({
    customer_id: customerId,
    detected_interests: mergedInterests,
    interests_metadata: updatedMetadata,
    last_interaction_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'customer_id',
  });

  if (writeError) {
    const message = writeError.message || 'Unknown write error';
    console.error(`[Memory] Failed for ${customerId}: ${message}`);
    return {
      ok: false,
      merged_interests: mergedInterests,
      metadata_count: Object.keys(updatedMetadata).length,
      error: message,
    };
  }

  console.warn(
    `[Memory] Success for ${customerId}. Active: ${mergedInterests.length}, Metadata: ${Object.keys(updatedMetadata).length}`
  );

  return {
    ok: true,
    merged_interests: mergedInterests,
    metadata_count: Object.keys(updatedMetadata).length,
    error: null,
  };
}
