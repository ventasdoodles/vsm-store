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

export type CustomerPreferenceCategory =
  | 'flavor'
  | 'budget'
  | 'format'
  | 'brand'
  | 'intensity'
  | 'experience';

export type CustomerPreferenceEvidence =
  | 'inferred'
  | 'explicit'
  | 'confirmed'
  | 'rejected';

export type CustomerPreferenceSource =
  | 'turn_text'
  | 'analyst_signal'
  | 'interest_inference';

export interface CustomerPreferenceSignalInput {
  category: CustomerPreferenceCategory;
  value: string;
  evidence: Extract<CustomerPreferenceEvidence, 'inferred' | 'explicit' | 'rejected'>;
  label?: string | null;
  source?: CustomerPreferenceSource;
}

export interface StoredCustomerPreferenceSignal {
  category: CustomerPreferenceCategory;
  value: string;
  label: string;
  evidence: CustomerPreferenceEvidence;
  hits: number;
  last_at: string;
  source: CustomerPreferenceSource;
}

export type StoredCustomerPreferenceSignalMap = Record<string, StoredCustomerPreferenceSignal>;

export interface CustomerPreferenceSummary {
  confirmed_likes: string[];
  explicit_likes: string[];
  weak_tendencies: string[];
  rejected_preferences: string[];
  format_preferences: string[];
  brand_affinity: string[];
  budget_posture: string | null;
  intensity_posture: string | null;
  experience_posture: string | null;
}

export interface CustomerMemoryRow {
  detected_interests?: string[] | null;
  interests_metadata?: Record<string, InterestMetadata> | null;
  preference_signals?: StoredCustomerPreferenceSignalMap | null;
  preference_summary?: CustomerPreferenceSummary | null;
  last_interaction_at?: string | null;
}

export interface MemoryPersistInput {
  interests?: string[];
  preferenceSignals?: CustomerPreferenceSignalInput[];
}

export interface MemoryPersistResult {
  ok: boolean;
  merged_interests: string[];
  metadata_count: number;
  preference_signal_count: number;
  preference_summary: CustomerPreferenceSummary;
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

const FLAVOR_VALUES = [
  'frutal',
  'dulce',
  'fresco',
  'menta',
  'ice',
  'tabaco',
  'cremoso',
  'tropical',
  'mango',
  'fresa',
  'sandia',
  'melon',
  'uva',
  'mora',
  'cereza',
  'caramelo',
];

const FORMAT_VALUES = ['desechable', 'pod', 'sales', 'liquido', 'cartucho', 'kit', 'mod'];
const INTENSITY_VALUES = ['suave', 'intenso'];
const EXPERIENCE_VALUES = ['simple', 'avanzado'];
const BUDGET_VALUES = ['barato', 'premium'];

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function normalizePreferenceValue(category: CustomerPreferenceCategory, value: string): string {
  const normalized = normalizeText(value);

  if (category === 'format') {
    if (normalized === 'pods') return 'pod';
    if (normalized === 'sales de nicotina') return 'sales';
    if (normalized === 'liquidos') return 'liquido';
  }

  if (category === 'flavor') {
    if (normalized === 'mentol' || normalized === 'mentolado') return 'menta';
    if (normalized === 'hielo') return 'ice';
  }

  if (category === 'experience') {
    if (normalized === 'sencillo' || normalized === 'facil') return 'simple';
    if (normalized === 'pro') return 'avanzado';
  }

  if (category === 'budget') {
    if (normalized === 'economico' || normalized === 'economica') return 'barato';
    if (normalized === 'caro' || normalized === 'mas pro') return 'premium';
  }

  if (category === 'intensity') {
    if (normalized === 'fuerte') return 'intenso';
  }

  return normalized;
}

function buildPreferenceKey(category: CustomerPreferenceCategory, value: string): string {
  return `${category}:${normalizePreferenceValue(category, value)}`;
}

function derivePreferenceLabel(category: CustomerPreferenceCategory, value: string): string {
  const normalizedValue = normalizePreferenceValue(category, value);

  switch (category) {
    case 'budget':
      return normalizedValue === 'premium' ? 'abierto a subirle un poco' : 'cuida precio';
    case 'intensity':
      return normalizedValue === 'intenso' ? 'perfiles intensos' : 'perfiles suaves';
    case 'experience':
      return normalizedValue === 'avanzado' ? 'algo mas avanzado' : 'algo sencillo';
    default:
      return normalizedValue;
  }
}

function isAllowedPreferenceValue(category: CustomerPreferenceCategory, value: string): boolean {
  const normalizedValue = normalizePreferenceValue(category, value);

  switch (category) {
    case 'flavor':
      return FLAVOR_VALUES.includes(normalizedValue);
    case 'format':
      return FORMAT_VALUES.includes(normalizedValue);
    case 'intensity':
      return INTENSITY_VALUES.includes(normalizedValue);
    case 'experience':
      return EXPERIENCE_VALUES.includes(normalizedValue);
    case 'budget':
      return BUDGET_VALUES.includes(normalizedValue);
    case 'brand':
      return normalizedValue.length >= 3 && normalizedValue.length <= 32;
    default:
      return false;
  }
}

function pickStrongerCurrentTurnSignal(
  current: CustomerPreferenceSignalInput | undefined,
  next: CustomerPreferenceSignalInput,
): CustomerPreferenceSignalInput {
  if (!current) return next;

  const rank = {
    rejected: 3,
    explicit: 2,
    inferred: 1,
  } as const;

  return rank[next.evidence] >= rank[current.evidence] ? next : current;
}

function dedupePreferenceSignals(signals: CustomerPreferenceSignalInput[]): CustomerPreferenceSignalInput[] {
  const signalMap = new Map<string, CustomerPreferenceSignalInput>();

  signals.forEach((signal) => {
    const key = buildPreferenceKey(signal.category, signal.value);
    const current = signalMap.get(key);
    signalMap.set(key, pickStrongerCurrentTurnSignal(current, signal));
  });

  return Array.from(signalMap.values());
}

function pushIfMatch(
  accumulator: CustomerPreferenceSignalInput[],
  input: CustomerPreferenceSignalInput,
): void {
  if (!isAllowedPreferenceValue(input.category, input.value)) return;
  accumulator.push({
    ...input,
    value: normalizePreferenceValue(input.category, input.value),
    label: input.label ?? derivePreferenceLabel(input.category, input.value),
    source: input.source ?? 'turn_text',
  });
}

export function normalizeAnalystPreferenceSignals(rawSignals: unknown): CustomerPreferenceSignalInput[] {
  if (!Array.isArray(rawSignals)) return [];

  const allowedCategories: CustomerPreferenceCategory[] = [
    'flavor',
    'budget',
    'format',
    'brand',
    'intensity',
    'experience',
  ];
  const allowedEvidence = ['inferred', 'explicit', 'rejected'] as const;

  return rawSignals.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const candidate = item as Record<string, unknown>;
    const category = candidate.category;
    const value = candidate.value;
    const evidence = candidate.evidence;
    const label = candidate.label;

    if (
      typeof category !== 'string' ||
      typeof value !== 'string' ||
      typeof evidence !== 'string' ||
      !allowedCategories.includes(category as CustomerPreferenceCategory) ||
      !allowedEvidence.includes(evidence as (typeof allowedEvidence)[number]) ||
      !isAllowedPreferenceValue(category as CustomerPreferenceCategory, value)
    ) {
      return [];
    }

    return [{
      category: category as CustomerPreferenceCategory,
      value: normalizePreferenceValue(category as CustomerPreferenceCategory, value),
      evidence: evidence as CustomerPreferenceSignalInput['evidence'],
      label: typeof label === 'string' && label.trim().length > 0
        ? label.trim()
        : derivePreferenceLabel(category as CustomerPreferenceCategory, value),
      source: 'analyst_signal',
    }];
  });
}

export function extractPreferenceSignalsFromTurn(query: string): CustomerPreferenceSignalInput[] {
  const normalized = normalizeText(query);
  const signals: CustomerPreferenceSignalInput[] = [];

  const positiveContext = /(me gustan?|me late|me laten|prefiero|soy mas de|me voy mas por|quiero algo|busco algo|recomiendame algo)/;
  const negativeContext = /(no quiero|no me gusta|no me laten|evita|sin|no tan)/;

  FLAVOR_VALUES.forEach((flavor) => {
    const positivePattern = new RegExp(`${positiveContext.source}[^.]{0,40}\\b${flavor}\\b`);
    const negativePattern = new RegExp(`${negativeContext.source}[^.]{0,20}\\b${flavor}\\b`);

    if (negativePattern.test(normalized)) {
      pushIfMatch(signals, { category: 'flavor', value: flavor, evidence: 'rejected' });
    } else if (positivePattern.test(normalized)) {
      pushIfMatch(signals, { category: 'flavor', value: flavor, evidence: 'explicit' });
    }
  });

  if (/(barato|economico|economica|presupuesto|no tan caro)/.test(normalized)) {
    pushIfMatch(signals, { category: 'budget', value: 'barato', evidence: 'explicit' });
  } else if (/(premium|algo mas pro|mas pro|subirle un poco)/.test(normalized)) {
    pushIfMatch(signals, { category: 'budget', value: 'premium', evidence: 'explicit' });
  }

  if (/(suave|tranqui|leve)/.test(normalized)) {
    pushIfMatch(signals, { category: 'intensity', value: 'suave', evidence: 'explicit' });
  } else if (/(fuerte|intenso|pegador)/.test(normalized)) {
    pushIfMatch(signals, { category: 'intensity', value: 'intenso', evidence: 'explicit' });
  }

  if (/(algo sencillo|simple|facil|sin tanto rollo)/.test(normalized)) {
    pushIfMatch(signals, { category: 'experience', value: 'simple', evidence: 'explicit' });
  } else if (/(algo mas avanzado|pro|avanzado)/.test(normalized)) {
    pushIfMatch(signals, { category: 'experience', value: 'avanzado', evidence: 'explicit' });
  }

  FORMAT_VALUES.forEach((format) => {
    const positivePattern = new RegExp(`${positiveContext.source}[^.]{0,40}\\b${format}\\b`);
    const negativePattern = new RegExp(`${negativeContext.source}[^.]{0,20}\\b${format}\\b`);

    if (negativePattern.test(normalized)) {
      pushIfMatch(signals, { category: 'format', value: format, evidence: 'rejected' });
    } else if (positivePattern.test(normalized)) {
      pushIfMatch(signals, { category: 'format', value: format, evidence: 'explicit' });
    }
  });

  return dedupePreferenceSignals(signals);
}

export function inferPreferenceSignalsFromInterests(interests: string[] = []): CustomerPreferenceSignalInput[] {
  const signals: CustomerPreferenceSignalInput[] = [];

  interests.forEach((interest) => {
    const normalized = normalizeText(interest);

    if (FLAVOR_VALUES.includes(normalized)) {
      pushIfMatch(signals, { category: 'flavor', value: normalized, evidence: 'inferred', source: 'interest_inference' });
      return;
    }

    if (FORMAT_VALUES.includes(normalized)) {
      pushIfMatch(signals, { category: 'format', value: normalized, evidence: 'inferred', source: 'interest_inference' });
      return;
    }

    if (normalized === 'barato' || normalized === 'economico') {
      pushIfMatch(signals, { category: 'budget', value: 'barato', evidence: 'inferred', source: 'interest_inference' });
      return;
    }

    if (normalized === 'suave' || normalized === 'fuerte' || normalized === 'intenso') {
      pushIfMatch(signals, {
        category: 'intensity',
        value: normalized === 'fuerte' ? 'intenso' : normalized,
        evidence: 'inferred',
        source: 'interest_inference',
      });
    }
  });

  return dedupePreferenceSignals(signals);
}

export function collectCustomerPreferenceSignals(input: {
  query: string;
  interests?: string[] | null;
  analystSignals?: unknown;
}): CustomerPreferenceSignalInput[] {
  return dedupePreferenceSignals([
    ...extractPreferenceSignalsFromTurn(input.query),
    ...inferPreferenceSignalsFromInterests(input.interests ?? []),
    ...normalizeAnalystPreferenceSignals(input.analystSignals),
  ]);
}

function mergeCustomerPreferenceSignals(
  existingSignals: StoredCustomerPreferenceSignalMap = {},
  incomingSignals: CustomerPreferenceSignalInput[],
): StoredCustomerPreferenceSignalMap {
  const merged: StoredCustomerPreferenceSignalMap = { ...existingSignals };
  const now = new Date().toISOString();

  incomingSignals.forEach((signal) => {
    const key = buildPreferenceKey(signal.category, signal.value);
    const existing = merged[key];
    const nextLabel = signal.label?.trim() || derivePreferenceLabel(signal.category, signal.value);

    if (!existing) {
      merged[key] = {
        category: signal.category,
        value: normalizePreferenceValue(signal.category, signal.value),
        label: nextLabel,
        evidence: signal.evidence,
        hits: 1,
        last_at: now,
        source: signal.source ?? 'turn_text',
      };
      return;
    }

    const incomingIsRejected = signal.evidence === 'rejected';
    const existingIsRejected = existing.evidence === 'rejected';

    if (existingIsRejected && !incomingIsRejected) {
      merged[key] = {
        ...existing,
        label: nextLabel,
        evidence: signal.evidence === 'explicit' ? 'explicit' : 'inferred',
        hits: 1,
        last_at: now,
        source: signal.source ?? existing.source,
      };
      return;
    }

    const nextHits = existing.hits + 1;
    let nextEvidence: CustomerPreferenceEvidence = signal.evidence;

    if (incomingIsRejected) {
      nextEvidence = 'rejected';
    } else if (signal.evidence === 'explicit') {
      nextEvidence = existing.evidence === 'confirmed' || nextHits >= 2 ? 'confirmed' : 'explicit';
    } else if (signal.evidence === 'inferred') {
      if (existing.evidence === 'confirmed') {
        nextEvidence = 'confirmed';
      } else if (existing.evidence === 'explicit') {
        nextEvidence = 'confirmed';
      } else if (nextHits >= 3) {
        nextEvidence = 'confirmed';
      } else {
        nextEvidence = 'inferred';
      }
    }

    merged[key] = {
      ...existing,
      label: nextLabel,
      evidence: nextEvidence,
      hits: nextEvidence === 'rejected' ? nextHits : nextHits,
      last_at: now,
      source: signal.source ?? existing.source,
    };
  });

  return merged;
}

function dedupeSummaryItems(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function sortSignalsForSummary(signals: StoredCustomerPreferenceSignal[]): StoredCustomerPreferenceSignal[] {
  return [...signals].sort((left, right) => {
    if (right.hits !== left.hits) return right.hits - left.hits;
    return new Date(right.last_at).getTime() - new Date(left.last_at).getTime();
  });
}

function pickStrongestPosture(
  signals: StoredCustomerPreferenceSignal[],
  category: CustomerPreferenceCategory,
): string | null {
  const matches = sortSignalsForSummary(
    signals.filter((signal) => signal.category === category && signal.evidence !== 'rejected'),
  );
  return matches[0]?.label ?? null;
}

export function summarizeCustomerPreferenceSignals(
  preferenceSignals: StoredCustomerPreferenceSignalMap = {},
): CustomerPreferenceSummary {
  const signals = sortSignalsForSummary(Object.values(preferenceSignals));

  return {
    confirmed_likes: dedupeSummaryItems(
      signals
        .filter((signal) => signal.evidence === 'confirmed' && !['budget', 'intensity', 'experience'].includes(signal.category))
        .map((signal) => signal.label)
        .slice(0, 3),
    ),
    explicit_likes: dedupeSummaryItems(
      signals
        .filter((signal) => signal.evidence === 'explicit' && !['budget', 'intensity', 'experience'].includes(signal.category))
        .map((signal) => signal.label)
        .slice(0, 3),
    ),
    weak_tendencies: dedupeSummaryItems(
      signals
        .filter((signal) => signal.evidence === 'inferred')
        .map((signal) => signal.label)
        .slice(0, 3),
    ),
    rejected_preferences: dedupeSummaryItems(
      signals
        .filter((signal) => signal.evidence === 'rejected')
        .map((signal) => signal.label)
        .slice(0, 3),
    ),
    format_preferences: dedupeSummaryItems(
      signals
        .filter((signal) => signal.category === 'format' && ['explicit', 'confirmed'].includes(signal.evidence))
        .map((signal) => signal.label)
        .slice(0, 2),
    ),
    brand_affinity: dedupeSummaryItems(
      signals
        .filter((signal) => signal.category === 'brand' && ['explicit', 'confirmed'].includes(signal.evidence))
        .map((signal) => signal.label)
        .slice(0, 2),
    ),
    budget_posture: pickStrongestPosture(signals, 'budget'),
    intensity_posture: pickStrongestPosture(signals, 'intensity'),
    experience_posture: pickStrongestPosture(signals, 'experience'),
  };
}

export function hasCustomerPreferenceSummary(summary?: CustomerPreferenceSummary | null): boolean {
  if (!summary) return false;

  return [
    summary.confirmed_likes.length,
    summary.explicit_likes.length,
    summary.weak_tendencies.length,
    summary.rejected_preferences.length,
    summary.format_preferences.length,
    summary.brand_affinity.length,
    summary.budget_posture ? 1 : 0,
    summary.intensity_posture ? 1 : 0,
    summary.experience_posture ? 1 : 0,
  ].some((count) => count > 0);
}

export function buildCustomerPreferencePromptSummary(
  summary?: CustomerPreferenceSummary | null,
): string | null {
  if (!hasCustomerPreferenceSummary(summary)) return null;

  const sections: string[] = [];

  if (summary?.confirmed_likes?.length) {
    sections.push(`GUSTOS CONFIRMADOS: ${summary.confirmed_likes.join(', ')}.`);
  }

  if (summary?.explicit_likes?.length) {
    sections.push(`GUSTOS EXPLICITOS RECIENTES: ${summary.explicit_likes.join(', ')}.`);
  }

  if (summary?.rejected_preferences?.length) {
    sections.push(`EVITA O RECHAZO EXPLICITO: ${summary.rejected_preferences.join(', ')}.`);
  }

  if (summary?.weak_tendencies?.length) {
    sections.push(`TENDENCIAS DEBILES (usas solo como sesgo suave): ${summary.weak_tendencies.join(', ')}.`);
  }

  if (summary?.budget_posture) {
    sections.push(`POSTURA DE PRESUPUESTO: ${summary.budget_posture}.`);
  }

  if (summary?.intensity_posture) {
    sections.push(`POSTURA DE INTENSIDAD: ${summary.intensity_posture}.`);
  }

  if (summary?.experience_posture) {
    sections.push(`POSTURA DE USO: ${summary.experience_posture}.`);
  }

  if (summary?.format_preferences?.length) {
    sections.push(`FORMATOS QUE YA LE LATEN: ${summary.format_preferences.join(', ')}.`);
  }

  if (summary?.brand_affinity?.length) {
    sections.push(`MARCAS CON SENAL UTIL: ${summary.brand_affinity.join(', ')}.`);
  }

  return sections.join(' ');
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
 * Updates interest strength metadata based only on interests truly observed in the current turn.
 * Historical interests remain in metadata, but do not gain fake reinforcement unless re-observed.
 */
export function updateInterestsMetadata(
  existing: Record<string, InterestMetadata> = {},
  observedInterests: string[],
): Record<string, InterestMetadata> {
  const updated: Record<string, InterestMetadata> = { ...existing };
  const now = new Date().toISOString();

  [...new Set(observedInterests.map((term) => term.toLowerCase().trim()).filter(Boolean))].forEach((clean) => {
    const prev = existing[clean];

    updated[clean] = {
      hits: (prev?.hits || 0) + 1,
      last_at: now,
    };
  });

  return updated;
}

function normalizePersistInput(input: MemoryPersistInput | string[]): Required<MemoryPersistInput> {
  if (Array.isArray(input)) {
    return {
      interests: input,
      preferenceSignals: [],
    };
  }

  return {
    interests: input.interests ?? [],
    preferenceSignals: input.preferenceSignals ?? [],
  };
}

export async function persistMemory(
  supabase: MemorySupabaseClient,
  customerId: string,
  input: MemoryPersistInput | string[],
): Promise<MemoryPersistResult> {
  console.warn(`[Memory] Persisting for customer: ${customerId}`);

  const normalizedInput = normalizePersistInput(input);
  const observedInterests = sanitizeAndMergeInterests([], normalizedInput.interests);

  const readBuilder = supabase
    .from('ai_customer_memory')
    .select('detected_interests, interests_metadata, preference_signals, preference_summary')
    .eq('customer_id', customerId);

  const { data: currentMemory, error: readError } = await readBuilder.maybeSingle();
  if (readError) {
    const message = readError.message || 'Unknown read error';
    console.error(`[Memory] Failed for ${customerId}: ${message}`);
    return {
      ok: false,
      merged_interests: [],
      metadata_count: 0,
      preference_signal_count: 0,
      preference_summary: summarizeCustomerPreferenceSignals({}),
      error: message,
    };
  }

  const mergedInterests = sanitizeAndMergeInterests(
    currentMemory?.detected_interests || [],
    observedInterests,
  );

  const updatedMetadata = updateInterestsMetadata(
    currentMemory?.interests_metadata || {},
    observedInterests,
  );

  const mergedPreferenceSignals = mergeCustomerPreferenceSignals(
    currentMemory?.preference_signals || {},
    normalizedInput.preferenceSignals,
  );
  const preferenceSummary = summarizeCustomerPreferenceSignals(mergedPreferenceSignals);

  const writeBuilder = supabase.from('ai_customer_memory');
  const { error: writeError } = await writeBuilder.upsert({
    customer_id: customerId,
    detected_interests: mergedInterests,
    interests_metadata: updatedMetadata,
    preference_signals: mergedPreferenceSignals,
    preference_summary: preferenceSummary,
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
      preference_signal_count: Object.keys(mergedPreferenceSignals).length,
      preference_summary: preferenceSummary,
      error: message,
    };
  }

  console.warn(
    `[Memory] Success for ${customerId}. Active: ${mergedInterests.length}, Metadata: ${Object.keys(updatedMetadata).length}, Preference signals: ${Object.keys(mergedPreferenceSignals).length}`,
  );

  return {
    ok: true,
    merged_interests: mergedInterests,
    metadata_count: Object.keys(updatedMetadata).length,
    preference_signal_count: Object.keys(mergedPreferenceSignals).length,
    preference_summary: preferenceSummary,
    error: null,
  };
}
