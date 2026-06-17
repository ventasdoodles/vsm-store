export const GEMINI_API_VERSION = 'v1beta' as const;
export const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001' as const;
export const GEMINI_EMBEDDING_DIMENSIONALITY = 768;

type GeminiJsonValue =
  | string
  | number
  | boolean
  | null
  | GeminiJsonValue[]
  | { [key: string]: GeminiJsonValue };

function buildGeminiApiUrl(model: string, action: 'generateContent' | 'embedContent' | 'streamGenerateContent'): string {
  return `https://generativelanguage.googleapis.com/${GEMINI_API_VERSION}/models/${model}:${action}`;
}

async function parseGeminiError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.error?.message || `Gemini HTTP ${response.status}`;
  } catch {
    return await response.text() || `Gemini HTTP ${response.status}`;
  }
}

function normalizeAndValidateGeminiEmbedding(embedding: unknown, expectedDimensions: number): number[] {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Gemini embedding response did not include values');
  }

  if (embedding.length !== expectedDimensions) {
    throw new Error(
      `Gemini embedding dimension mismatch: expected ${expectedDimensions}, got ${embedding.length}`,
    );
  }

  if (embedding.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error('Gemini embedding response included non-numeric values');
  }

  return embedding as number[];
}
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 800;

async function sleepAbortAware(ms: number, signal?: AbortSignal | null) {
  if (signal?.aborted) {
    const err = new Error('Aborted');
    err.name = 'AbortError';
    throw err;
  }
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timeoutId);
      const err = new Error('Aborted');
      err.name = 'AbortError';
      reject(err);
    };
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort);
  });
}

async function fetchWithRetry(url: string, options: RequestInit, errorContext: string): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(url, options);

      // Retry on 429 (Rate Limit) or 50x (Server Error)
      if (!response.ok && (response.status === 429 || response.status >= 500)) {
        if (attempt >= MAX_RETRIES) {
          console.warn(`[Gemini API] Max retries (${MAX_RETRIES}) reached for ${errorContext}. Final HTTP status: ${response.status}`);
          return response; // Return failing response so honest degradation can trigger
        }
        const is429 = response.status === 429;
        console.warn(`[Gemini API] ${is429 ? 'Rate limited (429)' : `Server error (${response.status})`} for ${errorContext}. Attempt ${attempt + 1}/${MAX_RETRIES} backing off...`);
        
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        const jitter = Math.random() * (backoff * 0.3); // 30% jitter to prevent thundering herd
        await sleepAbortAware(backoff + jitter, options.signal as AbortSignal | undefined);
        attempt++;
        continue;
      }
      return response;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw error; // Respect explicit abort signals (like caller timeouts) immediately
      }
      const msg = error instanceof Error ? error.message : String(error);
      if (attempt >= MAX_RETRIES) {
        console.error(`[Gemini API] Network fetch failed after ${MAX_RETRIES} retries for ${errorContext}: ${msg}`);
        throw error;
      }
      console.warn(`[Gemini API] Network error for ${errorContext}: ${msg}. Attempt ${attempt + 1}/${MAX_RETRIES} backing off...`);
      const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
      const jitter = Math.random() * (backoff * 0.3);
      await sleepAbortAware(backoff + jitter, options.signal as AbortSignal | undefined);
      attempt++;
    }
  }
}
export async function geminiGenerateContent(input: {
  apiKey: string;
  model: string;
  body: Record<string, GeminiJsonValue>;
  signal?: AbortSignal;
}): Promise<Response> {
  return fetchWithRetry(buildGeminiApiUrl(input.model, 'generateContent'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': input.apiKey,
    },
    body: JSON.stringify(input.body),
    signal: input.signal,
  }, `generateContent (${input.model})`);
}

export async function geminiStreamGenerateContent(input: {
  apiKey: string;
  model: string;
  body: Record<string, GeminiJsonValue>;
  signal?: AbortSignal;
}): Promise<Response> {
  return fetchWithRetry(buildGeminiApiUrl(input.model, 'streamGenerateContent') + '?alt=sse', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': input.apiKey,
    },
    body: JSON.stringify(input.body),
    signal: input.signal,
  }, `streamGenerateContent (${input.model})`);
}

export async function geminiGenerateContentJson<T>(input: {
  apiKey: string;
  model: string;
  body: Record<string, GeminiJsonValue>;
  signal?: AbortSignal;
  errorContext: string;
}): Promise<T> {
  const response = await geminiGenerateContent(input);
  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as any)?.error?.message || `${input.errorContext}: Gemini HTTP ${response.status}`);
  }

  return data as T;
}

export async function geminiEmbedText(input: {
  apiKey: string;
  text: string;
  title?: string;
  taskType?: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY';
  outputDimensionality?: number;
}): Promise<number[]> {
  const response = await fetchWithRetry(buildGeminiApiUrl(GEMINI_EMBEDDING_MODEL, 'embedContent'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': input.apiKey,
    },
    body: JSON.stringify({
      model: `models/${GEMINI_EMBEDDING_MODEL}`,
      content: { parts: [{ text: input.text }] },
      title: input.title,
      taskType: input.taskType,
      outputDimensionality: input.outputDimensionality ?? GEMINI_EMBEDDING_DIMENSIONALITY,
    }),
  }, 'embedContent');

  if (!response.ok) {
    throw new Error(await parseGeminiError(response));
  }

  const result = await response.json();
  const embedding = result?.embedding?.values;
  const expectedDimensions = input.outputDimensionality ?? GEMINI_EMBEDDING_DIMENSIONALITY;

  return normalizeAndValidateGeminiEmbedding(embedding, expectedDimensions);
}

export function getGeminiRuntimePolicy() {
  return {
    api_version: GEMINI_API_VERSION,
    generation: {
      api_version: GEMINI_API_VERSION,
    },
    embeddings: {
      api_version: GEMINI_API_VERSION,
      model: GEMINI_EMBEDDING_MODEL,
      output_dimensionality: GEMINI_EMBEDDING_DIMENSIONALITY,
    },
  };
}
