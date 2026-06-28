import { compactCesarinResponseText } from './persona.ts';
import {
    geminiEmbedText,
    geminiGenerateContentJson,
} from '../_shared/gemini-api.ts';

const PUBLIC_WEB_MODEL = 'gemini-2.5-flash';

export interface ToolResult {
    name: string;
    status: 'success' | 'error';
    output: string;
    latency_ms: number;
    args?: Record<string, unknown>;
    summary?: string;
    metadata?: Record<string, unknown>;
}

export interface ToolCall {
    name: string;
    args: Record<string, unknown>;
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

export function collectWebSources(candidate: Record<string, any>): Array<{ title: string; url: string }> {
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

function extractGeminiText(result: Record<string, any>): string {
    const parts = result?.candidates?.[0]?.content?.parts ?? [];
    const text = parts
        .map((part: Record<string, any>) => typeof part?.text === 'string' ? part.text : '')
        .filter(Boolean)
        .join(' ')
        .trim();

    return compactCesarinResponseText(compactPublicToolText(text));
}

function extractGroundingSources(result: Record<string, any>): Array<{ title: string; url: string }> {
    return collectWebSources(result?.candidates?.[0] ?? {}).slice(0, 4);
}

function extractGroundingQueries(result: Record<string, any>): string[] {
    const candidate = result?.candidates?.[0] ?? {};
    const queries = candidate?.groundingMetadata?.webSearchQueries
        ?? candidate?.grounding_metadata?.web_search_queries
        ?? [];

    return Array.isArray(queries)
        ? queries.filter((entry: unknown): entry is string => typeof entry === 'string').slice(0, 4)
        : [];
}

function extractUrlContextMetadata(result: Record<string, any>): Array<{ retrieved_url: string; status: string }> {
    const candidate = result?.candidates?.[0] ?? {};
    const urlMetadata = candidate?.urlContextMetadata?.urlMetadata
        ?? candidate?.url_context_metadata?.url_metadata
        ?? [];

    return Array.isArray(urlMetadata)
        ? urlMetadata
            .map((entry: Record<string, any>) => ({
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
    return geminiGenerateContentJson({
        apiKey: input.geminiKey,
        model: PUBLIC_WEB_MODEL,
        body: {
            contents: [{ parts: [{ text: input.prompt }] }],
            tools: [{ [input.tool]: {} }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 320,
            },
        },
        errorContext: `Gemini ${input.tool} HTTP error`,
    });
}

export async function public_web_search(args: { query?: string }, geminiKey: string): Promise<{ output: string, summary: string, metadata?: Record<string, unknown> }> {
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

export async function public_url_context(args: { query?: string; url?: string; urls?: string[] }, geminiKey: string): Promise<{ output: string, summary: string, metadata?: Record<string, unknown> }> {
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
 * Formal Tool: search_products
 * Retrieves products via neural vector match, fallback to featured.
 */
async function search_products(args: { query: string }, supabase: any, geminiKey: string, precomputedEmbedding?: number[]): Promise<{ output: string, summary: string }> {
    if (!args.query) return { output: "Error: No query provided.", summary: "Error: No query" };

    try {
        let embedding = precomputedEmbedding;

        if (!embedding) {
            embedding = await geminiEmbedText({
                apiKey: geminiKey,
                text: args.query,
                taskType: 'RETRIEVAL_QUERY',
            });
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

        const output = filteredProducts.map((p: Record<string, any>) => `- ${p.name} ($${p.price}) | Stock: ${p.stock > 0 ? 'Disponible' : 'Agotado'}`).join('\n');
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

function buildInventoryOutlookTruth(input: {
    productName: string;
    currentStock: number;
    daysUntilOut?: number | null;
    depletionDate?: string | null;
    urgencyLevel?: string | null;
    hasProjection: boolean;
    projectionUnavailableReason?: string;
}): { output: string; summary: string } {
    const availability = input.currentStock > 0 ? 'DISPONIBLE' : 'AGOTADO';
    const lines = [
        `PRODUCTO: ${input.productName}`,
        `DISPONIBILIDAD_ACTUAL: ${availability}`,
        `STOCK_ACTUAL: ${input.currentStock}`,
    ];

    if (input.hasProjection && input.currentStock > 0 && typeof input.daysUntilOut === 'number') {
        let outlook = `OUTLOOK_ESTIMADO: ${input.daysUntilOut} dias restantes`;
        if (input.depletionDate) {
            outlook += `; fecha estimada: ${input.depletionDate}`;
        }
        lines.push(outlook);
        if (input.urgencyLevel) {
            lines.push(`URGENCIA_ESTIMADA: ${String(input.urgencyLevel).toUpperCase()}`);
        }
        lines.push('NOTA: La proyeccion es secundaria a la disponibilidad actual y puede cambiar.');
        return {
            output: lines.join('\n'),
            summary: `Disponibilidad actual: ${input.currentStock} en stock. Outlook estimado: ${input.daysUntilOut} dias.`,
        };
    }

    if (input.currentStock <= 0) {
        lines.push('OUTLOOK_ESTIMADO: No disponible mientras siga agotado.');
        lines.push('NOTA: No hay base aqui para prometer regreso o restock.');
        return {
            output: lines.join('\n'),
            summary: 'Disponibilidad actual: agotado. Sin base para prometer regreso.',
        };
    }

    lines.push(`OUTLOOK_ESTIMADO: ${input.projectionUnavailableReason || 'No disponible.'}`);
    lines.push('NOTA: La disponibilidad actual manda; sin suficiente senal para proyectar salida.');
    return {
        output: lines.join('\n'),
        summary: `Disponibilidad actual: ${input.currentStock} en stock. Outlook no disponible.`,
    };
}

/**
 * Formal Tool: get_inventory_outlook
 * Resolves product and fetches a stock depletion projection from the oracle.
 */
async function get_inventory_outlook(args: { query?: string, product_id?: string }, supabase: any, geminiKey: string, precomputedEmbedding?: number[]): Promise<{ output: string, summary: string, signal_quality: string, resolution_path: string, velocity_30d?: number }> {
    let productId = args.product_id;
    let productName = "Producto desconocido";
    const resolutionPath = productId ? "direct_id" : "semantic_search";
    
    try {
        // 1. Resolve Product ID if not provided
        if (!productId && args.query) {
            let embedding = precomputedEmbedding;
            if (!embedding) {
                embedding = await geminiEmbedText({
                    apiKey: geminiKey,
                    text: args.query,
                    taskType: 'RETRIEVAL_QUERY',
                });
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

        if (currentStock <= 0) {
            const truth = buildInventoryOutlookTruth({
                productName,
                currentStock,
                hasProjection: false,
            });

            return {
                output: truth.output,
                summary: truth.summary,
                signal_quality: "insufficient",
                resolution_path: "current_oos"
            };
        }

        // 3. Invoke Inventory Oracle
        const { data: oracle, error: oracleError } = await supabase.functions.invoke('inventory-oracle', {
            body: { productId, currentStock }
        });

        if (!oracleError && oracle && !oracle.error) {
            const res = oracle as any;
            const signalQuality = res.urgencyLevel === 'low' && res.daysUntilOut > 100 ? 'insufficient' : 'high';
            const truth = buildInventoryOutlookTruth({
                productName,
                currentStock,
                daysUntilOut: res.daysUntilOut,
                depletionDate: res.depletionDate,
                urgencyLevel: res.urgencyLevel,
                hasProjection: true,
            });

            return {
                output: truth.output,
                summary: truth.summary,
                signal_quality: signalQuality,
                resolution_path: resolutionPath === "direct_id" ? "full_oracle_direct" : "full_oracle_semantic"
            };
        }

        // 4. Fallback to DB stock only
        const truth = buildInventoryOutlookTruth({
            productName,
            currentStock,
            hasProjection: false,
            projectionUnavailableReason: 'No disponible.',
        });
        return {
            output: truth.output,
            summary: truth.summary,
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
async function check_compatibility(args: { query: string }, supabase: any): Promise<{ output: string, summary: string, metadata?: Record<string, unknown> }> {
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
        aliases?.forEach((a: Record<string, any>) => {
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
        const outputLines = relations.map((r: Record<string, any>) => {
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
                case 'search_products': {
                    const res = await search_products(call.args as unknown as { query: string }, supabase, geminiKey, precomputedEmbedding);
                    output = res.output;
                    summary = res.summary;
                    break;
                }
                case 'track_order': {
                    const res = await track_order(call.args as unknown as { order_number?: string, tracking_number?: string }, supabase);
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
                    const res = await get_inventory_outlook(call.args as unknown as { query?: string, product_id?: string }, supabase, geminiKey, precomputedEmbedding);
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
                    const res = await check_compatibility(call.args as unknown as { query: string }, supabase);
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
                    const res = await executePublicWebSearch((call.args || {}) as unknown as { query?: string }, geminiKey);
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
                    const res = await executePublicUrlContext((call.args || {}) as unknown as { query?: string; url?: string; urls?: string[] }, geminiKey);
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

