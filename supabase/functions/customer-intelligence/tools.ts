import { compactCesarinResponseText } from './persona.ts';

const PUBLIC_WEB_MODEL = 'gemini-2.5-flash';

export interface ToolResult {
    name: string;
    status: 'success' | 'error';
    output: string;
    latency_ms: number;
    args?: any;
    summary?: string;
    metadata?: any;
}

export interface ToolCall {
    name: string;
    args: any;
}
function collectGeminiText(result: any): string {
    const parts = result?.candidates?.[0]?.content?.parts;
    if (!Array.isArray(parts)) return '';

    return parts
        .map((part: any) => typeof part?.text === 'string' ? part.text : '')
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function compactLegacyPublicToolText(input: string, maxSentences = 3): string {
    const normalized = (input || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';

    const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];
    const seen = new Set<string>();
    const compacted: string[] = [];

    for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;
        const key = trimmed
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim();

        if (!key || seen.has(key)) continue;
        seen.add(key);
        compacted.push(trimmed);

        if (compacted.length >= maxSentences) break;
    }

    return compacted.join(' ').replace(/\s+/g, ' ').trim();
}

function normalizePublicUrls(input: unknown): string[] {
    const rawValues = Array.isArray(input)
        ? input
        : typeof input === 'string'
            ? [input]
            : [];
    const urls: string[] = [];
    const seen = new Set<string>();

    for (const rawValue of rawValues) {
        if (typeof rawValue !== 'string') continue;
        try {
            const parsed = new URL(rawValue.trim());
            const hostname = parsed.hostname.toLowerCase();
            if (!/^https?:$/.test(parsed.protocol)) continue;
            if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.local')) continue;
            const normalized = parsed.toString();
            if (seen.has(normalized)) continue;
            seen.add(normalized);
            urls.push(normalized);
        } catch {
            continue;
        }
    }

    return urls.slice(0, 5);
}

function extractLegacyGroundingSources(result: any): Array<{ title: string; uri: string }> {
    const chunks = result?.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (!Array.isArray(chunks)) return [];

    const sources: Array<{ title: string; uri: string }> = [];
    const seen = new Set<string>();

    for (const chunk of chunks) {
        const uri = chunk?.web?.uri;
        if (typeof uri !== 'string' || seen.has(uri)) continue;
        seen.add(uri);
        sources.push({
            title: typeof chunk?.web?.title === 'string' ? chunk.web.title : 'Fuente pública',
            uri,
        });
    }

    return sources.slice(0, 4);
}

function extractLegacyUrlContextMetadata(result: any): Array<{ url: string; status: string }> {
    const urlMetadata = result?.candidates?.[0]?.url_context_metadata?.url_metadata
        ?? result?.candidates?.[0]?.urlContextMetadata?.urlMetadata;
    if (!Array.isArray(urlMetadata)) return [];

    return urlMetadata
        .map((entry: any) => ({
            url: typeof entry?.retrieved_url === 'string'
                ? entry.retrieved_url
                : typeof entry?.retrievedUrl === 'string'
                    ? entry.retrievedUrl
                    : '',
            status: typeof entry?.url_retrieval_status === 'string'
                ? entry.url_retrieval_status
                : typeof entry?.urlRetrievalStatus === 'string'
                    ? entry.urlRetrievalStatus
                    : 'UNKNOWN',
        }))
        .filter((entry: { url: string }) => Boolean(entry.url))
        .slice(0, 5);
}

async function runGeminiNativePublicTool(args: {
    geminiKey: string;
    prompt: string;
    tools: any[];
}): Promise<any> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${PUBLIC_WEB_MODEL}:generateContent?key=${args.geminiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: args.prompt }] }],
                tools: args.tools,
                generationConfig: {
                    temperature: 0.1,
                },
            }),
        },
    );

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result?.error?.message || `HTTP ${response.status}`);
    }

    return result;
}

// Deprecated legacy path kept only for compatibility; active runtime uses public_web_search.
export async function public_web_search_legacy(args: { query: string }, geminiKey: string): Promise<{ output: string, summary: string, metadata?: any }> {
    if (!args.query?.trim()) {
        return {
            output: 'No se proporcionó consulta para web pública.',
            summary: 'Sin consulta para web pública',
        };
    }

    try {
        const prompt = [
            'Responde en español mexicano breve.',
            'Usa Google Search solo para resolver la necesidad pública de esta pregunta.',
            'Máximo tres frases cortas.',
            'No hagas reporte largo, no cierres con CTA y no lo presentes como verdad interna de tienda.',
            `Pregunta: ${args.query.trim()}`,
        ].join(' ');

        const result = await runGeminiNativePublicTool({
            geminiKey,
            prompt,
            tools: [{ google_search: {} }],
        });
        const output = compactLegacyPublicToolText(collectGeminiText(result));
        const sources = extractLegacyGroundingSources(result);

        return {
            output: output || 'No salió una síntesis útil desde web pública.',
            summary: sources.length > 0
                ? `Contexto público verificado con ${sources.length} fuente${sources.length === 1 ? '' : 's'}`
                : 'Contexto público consultado',
            metadata: {
                model: PUBLIC_WEB_MODEL,
                web_search_queries: result?.candidates?.[0]?.groundingMetadata?.webSearchQueries ?? [],
                sources,
            },
        };
    } catch (err) {
        return {
            output: `Error en web pública: ${err instanceof Error ? err.message : String(err)}`,
            summary: 'Error en web pública',
            metadata: { error: true },
        };
    }
}

// Deprecated legacy path kept only for compatibility; active runtime uses public_url_context.
export async function public_url_context_legacy(args: { query?: string, url?: string, urls?: string[] }, geminiKey: string): Promise<{ output: string, summary: string, metadata?: any }> {
    const urls = normalizePublicUrls(args.urls?.length ? args.urls : args.url ? [args.url] : []);

    if (urls.length === 0) {
        return {
            output: 'No se proporcionó una URL pública válida.',
            summary: 'Sin URL pública válida',
        };
    }

    try {
        const prompt = [
            'Lee solo las URLs dadas y responde en español mexicano breve.',
            'Máximo tres frases cortas.',
            'Quédate en el contexto de esas páginas; no lo conviertas en búsqueda amplia ni en verdad interna de tienda.',
            `Objetivo: ${(args.query || 'Resume lo importante de esta página pública.').trim()}`,
            `URLs: ${urls.join(', ')}`,
        ].join(' ');

        const result = await runGeminiNativePublicTool({
            geminiKey,
            prompt,
            tools: [{ url_context: {} }],
        });
        const output = compactLegacyPublicToolText(collectGeminiText(result));
        const urlMetadata = extractLegacyUrlContextMetadata(result);

        return {
            output: output || 'No salió una síntesis útil desde la URL pública.',
            summary: `Contexto público leído desde ${urlMetadata.length || urls.length} URL${(urlMetadata.length || urls.length) === 1 ? '' : 's'}`,
            metadata: {
                model: PUBLIC_WEB_MODEL,
                urls: urlMetadata.length > 0 ? urlMetadata : urls.map((url) => ({ url, status: 'UNKNOWN' })),
            },
        };
    } catch (err) {
        return {
            output: `Error en URL pública: ${err instanceof Error ? err.message : String(err)}`,
            summary: 'Error en URL pública',
            metadata: { error: true, urls },
        };
    }
}

export function compactPublicToolText(input: string): string {
    const normalized = (input || '').replace(/\s+/g, ' ').trim();
    if (!normalized) return '';

    const sentences = normalized.match(/[^.!?]+[.!?]?/g) ?? [normalized];
    const trimmed = sentences
        .map((sentence) => sentence.trim())
        .filter(Boolean)
        .slice(0, 4)
        .join(' ')
        .trim();

    return trimmed.length > 900 ? `${trimmed.slice(0, 897).trim()}...` : trimmed;
}

export function extractPublicUrls(input: string): string[] {
    const matches = input.match(/https?:\/\/[^\s<>"')\]]+/gi) ?? [];
    return Array.from(
        new Set(matches.map((url) => url.replace(/[),.;!?]+$/g, '')).filter(Boolean))
    ).slice(0, 3);
}

export function collectWebSources(candidate: any): Array<{ title: string; url: string }> {
    const sources: Array<{ title: string; url: string }> = [];

    const groundingChunks = candidate?.groundingMetadata?.groundingChunks
        ?? candidate?.grounding_metadata?.grounding_chunks
        ?? [];
    for (const chunk of groundingChunks) {
        const web = chunk?.web ?? chunk?.web_chunk ?? null;
        const url = web?.uri ?? web?.url ?? null;
        const title = web?.title ?? web?.domain ?? url ?? null;
        if (!url || !title) continue;
        sources.push({ title, url });
    }

    const urlMetadata = candidate?.urlContextMetadata?.urlMetadata
        ?? candidate?.url_context_metadata?.url_metadata
        ?? [];
    for (const entry of urlMetadata) {
        const url = entry?.retrievedUrl ?? entry?.retrieved_url ?? null;
        if (!url) continue;
        sources.push({ title: url, url });
    }

    return sources.filter((source, index, list) => list.findIndex((entry) => entry.url === source.url) === index).slice(0, 5);
}

function extractGeminiText(result: any): string {
    const parts = result?.candidates?.[0]?.content?.parts ?? [];
    const text = parts
        .map((part: any) => typeof part?.text === 'string' ? part.text : '')
        .filter(Boolean)
        .join(' ')
        .trim();

    return compactCesarinResponseText(compactPublicToolText(text));
}

function extractGroundingSources(result: any): Array<{ title: string; url: string }> {
    return collectWebSources(result?.candidates?.[0] ?? {}).slice(0, 4);
}

function extractGroundingQueries(result: any): string[] {
    const candidate = result?.candidates?.[0] ?? {};
    const queries = candidate?.groundingMetadata?.webSearchQueries
        ?? candidate?.grounding_metadata?.web_search_queries
        ?? [];

    return Array.isArray(queries)
        ? queries.filter((entry: unknown): entry is string => typeof entry === 'string').slice(0, 4)
        : [];
}

function extractUrlContextMetadata(result: any): Array<{ retrieved_url: string; status: string }> {
    const candidate = result?.candidates?.[0] ?? {};
    const urlMetadata = candidate?.urlContextMetadata?.urlMetadata
        ?? candidate?.url_context_metadata?.url_metadata
        ?? [];

    return Array.isArray(urlMetadata)
        ? urlMetadata
            .map((entry: any) => ({
                retrieved_url: entry?.retrievedUrl || entry?.retrieved_url || '',
                status: entry?.urlRetrievalStatus || entry?.url_retrieval_status || 'UNKNOWN',
            }))
            .filter((entry) => Boolean(entry.retrieved_url))
            .slice(0, 5)
        : [];
}

function extractUrlsFromArgs(args: { query?: string; url?: string; urls?: string[] }): string[] {
    const queryUrls = extractPublicUrls(args.query || '');
    const explicitUrls = [
        ...(Array.isArray(args.urls) ? args.urls : []),
        ...(typeof args.url === 'string' ? [args.url] : []),
    ];

    return Array.from(new Set(
        [...explicitUrls, ...queryUrls]
            .map((url) => typeof url === 'string' ? url.replace(/[),.;!?]+$/g, '') : '')
            .filter(Boolean),
    )).slice(0, 3);
}

async function runNativePublicGeminiTool(input: {
    tool: 'google_search' | 'url_context';
    prompt: string;
    geminiKey: string;
}): Promise<any> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${PUBLIC_WEB_MODEL}:generateContent?key=${input.geminiKey}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: input.prompt }] }],
                tools: [{ [input.tool]: {} }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 320,
                },
            }),
        },
    );

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error?.message || `Gemini ${input.tool} HTTP ${response.status}`);
    }

    return data;
}

export async function public_web_search(args: { query?: string }, geminiKey: string): Promise<{ output: string, summary: string, metadata?: any }> {
    const query = args.query?.trim();
    if (!query) {
        return {
            output: 'No se proporciono una consulta publica para buscar.',
            summary: 'Sin consulta publica',
            metadata: { sources: [], queries: [] },
        };
    }

    const result = await runNativePublicGeminiTool({
        tool: 'google_search',
        prompt: [
            'Usa Google Search solo para reunir contexto publico actual y resumelo en espanol.',
            'Devuelve como maximo 3 frases cortas.',
            'No inventes certeza privada ni promociones catalogo de la tienda.',
            `Consulta: ${query}`,
        ].join('\n'),
        geminiKey,
    });

    const sources = extractGroundingSources(result);

    return {
        output: extractGeminiText(result) || 'No obtuve contexto publico suficientemente claro.',
        summary: sources.length > 0
            ? `Contexto publico consultado en ${sources.length} fuentes.`
            : 'Contexto publico consultado sin fuentes explicitas.',
        metadata: {
            sources,
            queries: extractGroundingQueries(result),
        },
    };
}

export async function public_url_context(args: { query?: string; url?: string; urls?: string[] }, geminiKey: string): Promise<{ output: string, summary: string, metadata?: any }> {
    const urls = extractUrlsFromArgs(args);
    if (urls.length === 0) {
        return {
            output: 'No se proporciono una URL publica valida.',
            summary: 'Sin URL publica',
            metadata: { urls: [] },
        };
    }

    const result = await runNativePublicGeminiTool({
        tool: 'url_context',
        prompt: [
            'Lee solo las URL publicas incluidas y resume el contexto util en espanol.',
            'Devuelve como maximo 3 frases cortas y no inventes contenido no recuperado.',
            `Tarea: ${args.query?.trim() || 'Resume el contexto publico de esta pagina.'}`,
            `URLS: ${urls.join(' ')}`,
        ].join('\n'),
        geminiKey,
    });

    const urlMetadata = extractUrlContextMetadata(result);

    return {
        output: extractGeminiText(result) || 'No pude extraer contexto util de la URL publica.',
        summary: `Contexto de URL publica consultado para ${urls.length} enlace${urls.length > 1 ? 's' : ''}.`,
        metadata: {
            urls: urlMetadata.length > 0 ? urlMetadata : urls.map((url) => ({
                retrieved_url: url,
                status: 'UNKNOWN',
            })),
        },
    };
}

async function executePublicWebSearch(args: { query?: string }, geminiKey: string): Promise<{ output: string; summary: string; metadata: Record<string, unknown> }> {
    const result = await public_web_search(args, geminiKey);
    return {
        output: result.output,
        summary: result.summary,
        metadata: result.metadata ?? {},
    };
}

async function executePublicUrlContext(args: { query?: string; urls?: string[]; url?: string }, geminiKey: string): Promise<{ output: string; summary: string; metadata: Record<string, unknown> }> {
    const result = await public_url_context(args, geminiKey);
    return {
        output: result.output,
        summary: result.summary,
        metadata: result.metadata ?? {},
    };
}

/**
 * Formal Tool: get_store_policy
 * Retrieves knowledge from the RAG store.
 */
async function get_store_policy(args: { query: string }, supabase: any, geminiKey: string, precomputedEmbedding?: number[]): Promise<{ output: string, summary: string, metadata?: { chunks_found: number } }> {
    if (!args.query) return { output: "Error: No query provided.", summary: "Error: No query" };
    
    try {
        let embedding = precomputedEmbedding;

        if (!embedding) {
            const embedRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'models/gemini-embedding-001',
                        content: { parts: [{ text: args.query }] },
                        outputDimensionality: 3072
                    })
                }
            );
            const embedData = await embedRes.json();
            embedding = embedData.embedding?.values;
        }

        if (!embedding) return { output: "No se pudo generar el embedding.", summary: "Error: No embedding" };

        const { data: matches, error } = await supabase.rpc('match_knowledge', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 3
        });

        if (error || !matches || matches.length === 0) {
            return { 
                output: "No se encontró información específica en las políticas.", 
                summary: "Sin coincidencias en políticas",
                metadata: { chunks_found: 0 }
            };
        }

        const output = matches.map((m: any) => `[${m.category}] ${m.content}`).join('\n\n');
        return { 
            output, 
            summary: `Encontradas ${matches.length} coincidencias de políticas`,
            metadata: { chunks_found: matches.length }
        };
    } catch (err) {
        return { 
            output: `Error: ${err}`, 
            summary: "Error en recuperación de políticas",
            metadata: { chunks_found: 0 }
        };
    }
}

/**
 * Formal Tool: search_products
 * Retrieves products via neural vector match, fallback to featured.
 */
async function search_products(args: { query: string }, supabase: any, geminiKey: string, precomputedEmbedding?: number[]): Promise<{ output: string, summary: string }> {
    if (!args.query) return { output: "Error: No query provided.", summary: "Error: No query" };

    try {
        let embedding = precomputedEmbedding;

        if (!embedding) {
            const embedRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'models/gemini-embedding-001',
                        content: { parts: [{ text: args.query }] },
                        outputDimensionality: 3072
                    })
                }
            );
            const embedData = await embedRes.json();
            embedding = embedData.embedding?.values;
        }

        if (!embedding) return { output: "No se pudo generar el embedding.", summary: "Error: No embedding" };

        const { data: matches, error } = await supabase.rpc('match_products', {
            query_embedding: embedding,
            match_threshold: 0.4,
            match_count: 5
        });

        if (error) throw error;
        
        let finalProducts = matches || [];
        let fallbackUsed = false;
        
        if (finalProducts.length < 2) {
            const { data: featured } = await supabase
                .from('products')
                .select('name, price, stock')
                .eq('status', 'active')
                .eq('ai_is_featured', true)
                .limit(3);
            
            if (featured) {
                finalProducts = [...finalProducts, ...featured];
                fallbackUsed = true;
            }
        }

        if (finalProducts.length === 0) {
            return { 
                output: "No se encontraron productos relevantes.", 
                summary: "Sin coincidencias de productos" 
            };
        }

        const uniqueNames = new Set<string>();
        const filteredProducts = finalProducts.filter((p: { name: string }) => {
            if (uniqueNames.has(p.name)) return false;
            uniqueNames.add(p.name);
            return true;
        });

        const output = filteredProducts.map((p: any) => `- ${p.name} ($${p.price}) | Stock: ${p.stock > 0 ? 'Disponible' : 'Agotado'}`).join('\n');
        return { 
            output: fallbackUsed ? `[FEATURED_FALLBACK]\n${output}` : output, 
            summary: `Encontrados ${filteredProducts.length} productos${fallbackUsed ? ' (incluye destacados)' : ''}` 
        };
    } catch (err) {
        return { 
            output: `Error: ${err}`, 
            summary: "Error en búsqueda de productos" 
        };
    }
}

/**
 * Formal Tool: track_order
 * Resolves order_number -> tracking_number and fetches real-time carrier status.
 */
async function track_order(args: { order_number?: string, tracking_number?: string }, supabase: any): Promise<{ output: string, summary: string, resolution_path: string, carrier?: string }> {
    let trackingNumber = args.tracking_number?.trim();
    let orderNumber = args.order_number?.trim().toUpperCase();
    let resolutionPath = "initial";
    let dbStatus = "No encontrado";

    // 1. Normalize order_number (e.g., 1001 -> VSM-1001)
    if (orderNumber && !orderNumber.startsWith("VSM-")) {
        orderNumber = `VSM-${orderNumber.padStart(4, '0')}`;
    }

    try {
        // 2. If no tracking number provided, lookup in DB
        if (!trackingNumber && orderNumber) {
            const { data: order, error } = await supabase
                .from('orders')
                .select('tracking_number, status')
                .eq('order_number', orderNumber)
                .maybeSingle();
            
            if (error) throw error;
            if (order) {
                trackingNumber = order.tracking_number;
                dbStatus = order.status;
                resolutionPath = trackingNumber ? "order_lookup" : "db_status_only";
            } else {
                return { 
                    output: `No se encontró el pedido ${orderNumber}.`, 
                    summary: "Pedido no encontrado",
                    resolution_path: "not_found"
                };
            }
        }

        // 3. Resolve via Carrier API if we have a tracking number
        if (trackingNumber) {
            const { data, error } = await supabase.functions.invoke('track-shipment', {
                body: { trackingNumber }
            });

            if (!error && data && !data.error) {
                const res = data as any;
                const output = `STATUS: ${res.statusText}\nCARRIER: ${res.carrier}\nESTIMATED: ${res.estimatedDelivery || 'Pendiente'}\nLAST_EVENT: ${res.events?.[0]?.status || 'Iniciado'}`;
                return { 
                    output, 
                    summary: `Rastreado vía ${res.carrier}: ${res.statusText}`,
                    resolution_path: resolutionPath === "order_lookup" ? "api_via_order" : "api_direct",
                    carrier: res.carrier
                };
            }

            // If API fails or is not configured, fall back to DB status if we have it
            if (dbStatus !== "No encontrado") {
                return {
                    output: `Estado en sistema: ${dbStatus}. (Servicio de rastreo detallado no disponible momentáneamente).`,
                    summary: `Estatus local: ${dbStatus} (Fallback API)`,
                    resolution_path: "db_fallback"
                };
            }
        }

        // 4. Final Fallback/Error
        if (orderNumber && dbStatus !== "No encontrado") {
            return {
                output: `El pedido ${orderNumber} tiene el estatus: ${dbStatus}. Aún no cuenta con número de guía asignado.`,
                summary: `Sin guía: ${dbStatus}`,
                resolution_path: "db_status_only"
            };
        }

        return { 
            output: "Por favor proporciona un número de pedido (ej. VSM-1001) o de guía para rastrear.", 
            summary: "Datos insuficientes para rastreo",
            resolution_path: "insufficient_data"
        };

    } catch (err) {
        return { 
            output: `Error al rastrear: ${err instanceof Error ? err.message : String(err)}`, 
            summary: "Error en rastreo",
            resolution_path: "error"
        };
    }
}

/**
 * Formal Tool: get_inventory_outlook
 * Resolves product and fetches a stock depletion projection from the oracle.
 */
async function get_inventory_outlook(args: { query?: string, product_id?: string }, supabase: any, geminiKey: string, precomputedEmbedding?: number[]): Promise<{ output: string, summary: string, signal_quality: string, resolution_path: string, velocity_30d?: number }> {
    let productId = args.product_id;
    let productName = "Producto desconocido";
    let resolutionPath = productId ? "direct_id" : "semantic_search";
    
    try {
        // 1. Resolve Product ID if not provided
        if (!productId && args.query) {
            let embedding = precomputedEmbedding;
            if (!embedding) {
                const embedRes = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'models/gemini-embedding-001',
                            content: { parts: [{ text: args.query }] },
                            outputDimensionality: 3072
                        })
                    }
                );
                const embedData = await embedRes.json();
                embedding = embedData.embedding?.values;
            }

            if (embedding) {
                const { data: matches } = await supabase.rpc('match_products', {
                    query_embedding: embedding,
                    match_threshold: 0.4,
                    match_count: 1
                });
                if (matches && matches.length > 0) {
                    productId = matches[0].id;
                    productName = matches[0].name;
                }
            }
        }

        if (!productId) {
            return {
                output: "No se encontró el producto para analizar su inventario.",
                summary: "Producto no encontrado",
                signal_quality: "none",
                resolution_path: "not_found"
            };
        }

        // 2. Get current stock for fallback
        const { data: product } = await supabase
            .from('products')
            .select('name, stock')
            .eq('id', productId)
            .single();
        
        if (product) productName = product.name;
        const currentStock = product?.stock || 0;

        // 3. Invoke Inventory Oracle
        const { data: oracle, error: oracleError } = await supabase.functions.invoke('inventory-oracle', {
            body: { productId, currentStock }
        });

        if (!oracleError && oracle && !oracle.error) {
            const res = oracle as any;
            const signalQuality = res.urgencyLevel === 'low' && res.daysUntilOut > 100 ? 'insufficient' : 'high';
            
            let output = `PRODUCTO: ${productName}\nSTOCK_ACTUAL: ${currentStock}\nPROYECCION: ${res.daysUntilOut} días restantes`;
            if (res.depletionDate) output += `\nFECHA_ESTIMADA: ${res.depletionDate}`;
            output += `\nURGENCIA_ESTIMADA: ${res.urgencyLevel.toUpperCase()} (proyección estimada, no garantizada)`;

            return {
                output,
                summary: `Proyección (${res.urgencyLevel}): ${res.daysUntilOut} días`,
                signal_quality: signalQuality,
                resolution_path: resolutionPath === "direct_id" ? "full_oracle_direct" : "full_oracle_semantic"
            };
        }

        // 4. Fallback to DB stock only
        return {
            output: `PRODUCTO: ${productName}\nSTOCK_ACTUAL: ${currentStock}\nPROYECCION: No disponible (datos insuficientes o error en oráculo).`,
            summary: `Stock actual: ${currentStock} (Fallback)`,
            signal_quality: "insufficient",
            resolution_path: "db_only_fallback"
        };

    } catch (err) {
        return {
            output: `Error al consultar proyecciones: ${err instanceof Error ? err.message : String(err)}`,
            summary: "Error en outlook",
            signal_quality: "error",
            resolution_path: "error"
        };
    }
}

/**
 * Formal Tool: check_compatibility
 * Resolves naming variants (aliases) to canonical concepts and fetches relations.
 */
async function check_compatibility(args: { query: string }, supabase: any): Promise<{ output: string, summary: string, metadata?: any }> {
    if (!args.query) return { output: "Error: No se proporcionó una consulta de compatibilidad.", summary: "Sin consulta" };

    try {
        const query = args.query.toLowerCase().trim();
        console.warn(`[Compatibility] Checking for: ${query}`);

        // 1. Resolve potential entities from query using aliases
        // We look for any alias that is contained in the query or vice-versa
        const { data: aliases, error: aliasErr } = await supabase
            .from('concept_aliases')
            .select('concept_id, alias, product_concepts(*)');

        if (aliasErr) throw aliasErr;

        const matchedConcepts = new Map<string, any>();
        aliases?.forEach((a: any) => {
            if (query.includes(a.alias.toLowerCase())) {
                matchedConcepts.set(a.concept_id, a.product_concepts);
            }
        });

        const concepts = Array.from(matchedConcepts.values());
        if (concepts.length === 0) {
            return {
                output: "No identifiqué modelos o piezas específicas en tu pregunta. ¿Podrías decirme el modelo exacto?",
                summary: "Sin conceptos identificados",
                metadata: { matched_count: 0 }
            };
        }

        // 2. Fetch relations for matched concepts
        const conceptIds = concepts.map(c => c.id);
        const { data: relations, error: relErr } = await supabase
            .from('compatibility_relations')
            .select(`
                *,
                concept_a:product_concepts!concept_a_id(*),
                concept_b:product_concepts!concept_b_id(*)
            `)
            .or(`concept_a_id.in.(${conceptIds.join(',')}),concept_b_id.in.(${conceptIds.join(',')})`);

        if (relErr) throw relErr;

        if (!relations || relations.length === 0) {
            const names = concepts.map(c => c.name).join(', ');
            return {
                output: `No tengo información de compatibilidad confirmada para: ${names}.`,
                summary: "Sin relaciones encontradas",
                metadata: { matched_count: concepts.length, relations_count: 0 }
            };
        }

        // 3. Format output with scope-aware phrasing
        const outputLines = relations.map((r: any) => {
            const prefix = r.scope === 'class_generalization' ? "[GENERALIZACION] " : "[ESPECIFICO] ";
            const statusLabel = r.status.replace('_', ' ').toUpperCase();
            return `${prefix}${r.concept_a.name} -> ${r.relation_type.replace('_', ' ')} -> ${r.concept_b.name} | STATUS: ${statusLabel} | NOTAS: ${r.notes || 'N/A'}`;
        });

        return {
            output: outputLines.join('\n'),
            summary: `Encontradas ${relations.length} relaciones para ${concepts.length} conceptos.`,
            metadata: { 
                matched_count: concepts.length, 
                relations_count: relations.length,
                concepts: concepts.map(c => c.name)
            }
        };

    } catch (err) {
        console.error(`[Compatibility] Error:`, err);
        return {
            output: `Error al verificar compatibilidad: ${err instanceof Error ? err.message : String(err)}`,
            summary: "Error en compatibilidad",
            metadata: { error: true }
        };
    }
}

/**
 * Tool Orchestrator
 */
export async function executeTools(toolCalls: ToolCall[], supabase: any, geminiKey: string, precomputedEmbedding?: number[]): Promise<ToolResult[]> {
    const results: ToolResult[] = [];
    
    const executionPromises = toolCalls.map(async (call) => {
        const start = Date.now();
        let output = "";
        let summary = "";
        let status: 'success' | 'error' = 'success';

        try {
            switch (call.name) {
                case 'get_store_policy': {
                    const res = await get_store_policy(call.args, supabase, geminiKey, precomputedEmbedding);
                    output = res.output;
                    summary = res.summary;
                    // Metadata will be included in the return object below
                    break;
                }
                case 'search_products': {
                    const res = await search_products(call.args, supabase, geminiKey, precomputedEmbedding);
                    output = res.output;
                    summary = res.summary;
                    break;
                }
                case 'track_order': {
                    const res = await track_order(call.args, supabase);
                    output = res.output;
                    summary = res.summary;
                    // Inject extra debug metadata if available
                    return {
                        name: call.name,
                        status,
                        output,
                        summary,
                        args: call.args,
                        latency_ms: Date.now() - start,
                        resolution_path: (res as any).resolution_path,
                        carrier: (res as any).carrier
                    };
                }
                case 'get_inventory_outlook': {
                    const res = await get_inventory_outlook(call.args, supabase, geminiKey, precomputedEmbedding);
                    output = res.output;
                    summary = res.summary;
                    return {
                        name: call.name,
                        status,
                        output,
                        summary,
                        args: call.args,
                        latency_ms: Date.now() - start,
                        resolution_path: res.resolution_path,
                        signal_quality: res.signal_quality
                    };
                }
                case 'check_compatibility': {
                    const res = await check_compatibility(call.args, supabase);
                    output = res.output;
                    summary = res.summary;
                    return {
                        name: call.name,
                        status,
                        output,
                        summary,
                        args: call.args,
                        latency_ms: Date.now() - start,
                        metadata: res.metadata
                    };
                }
                case 'public_web_search': {
                    const res = await executePublicWebSearch(call.args || {}, geminiKey);
                    output = res.output;
                    summary = res.summary;
                    return {
                        name: call.name,
                        status,
                        output,
                        summary,
                        args: call.args,
                        latency_ms: Date.now() - start,
                        metadata: res.metadata,
                    };
                }
                case 'public_url_context': {
                    const res = await executePublicUrlContext(call.args || {}, geminiKey);
                    output = res.output;
                    summary = res.summary;
                    return {
                        name: call.name,
                        status,
                        output,
                        summary,
                        args: call.args,
                        latency_ms: Date.now() - start,
                        metadata: res.metadata,
                    };
                }
                default:
                    output = `Tool "${call.name}" not found.`;
                    summary = "Tool no encontrada";
                    status = 'error';
            }
        } catch (err) {
            output = `Execution error in ${call.name}: ${err}`;
            summary = "Error de ejecución";
            status = 'error';
        }

        return {
            name: call.name,
            status,
            output,
            summary,
            args: call.args,
            latency_ms: Date.now() - start
        };
    });

    const settledResults = await Promise.allSettled(executionPromises);
    
    for (const res of settledResults) {
        if (res.status === 'fulfilled') {
            results.push(res.value);
        } else {
            results.push({
                name: 'unknown',
                status: 'error',
                output: `Unhandled error: ${res.reason}`,
                summary: "Error no manejado",
                latency_ms: 0
            });
        }
    }

    return results;
}
