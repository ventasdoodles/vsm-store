export const GEMINI_API_VERSION = 'v1beta' as const;
export const GEMINI_EMBEDDING_MODEL = 'gemini-embedding-001' as const;
export const GEMINI_EMBEDDING_DIMENSIONALITY = 3072;

type GeminiJsonValue =
  | string
  | number
  | boolean
  | null
  | GeminiJsonValue[]
  | { [key: string]: GeminiJsonValue };

function buildGeminiApiUrl(model: string, action: 'generateContent' | 'embedContent'): string {
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

export async function geminiGenerateContent(input: {
  apiKey: string;
  model: string;
  body: Record<string, GeminiJsonValue>;
  signal?: AbortSignal;
}): Promise<Response> {
  return fetch(buildGeminiApiUrl(input.model, 'generateContent'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': input.apiKey,
    },
    body: JSON.stringify(input.body),
    signal: input.signal,
  });
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
  const response = await fetch(buildGeminiApiUrl(GEMINI_EMBEDDING_MODEL, 'embedContent'), {
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
  });

  if (!response.ok) {
    throw new Error(await parseGeminiError(response));
  }

  const result = await response.json();
  const embedding = result?.embedding?.values;

  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Gemini embedding response did not include values');
  }

  return embedding;
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
