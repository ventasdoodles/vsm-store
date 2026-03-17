

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
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'models/gemini-embedding-2-preview',
                        content: { parts: [{ text: args.query }] },
                        outputDimensionality: 1536
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
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${geminiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: 'models/gemini-embedding-2-preview',
                        content: { parts: [{ text: args.query }] },
                        outputDimensionality: 1536
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
            output, 
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
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2-preview:embedContent?key=${geminiKey}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            model: 'models/gemini-embedding-2-preview',
                            content: { parts: [{ text: args.query }] },
                            outputDimensionality: 1536
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
            output += `\nURGENCIA: ${res.urgencyLevel.toUpperCase()}`;

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
                    results.push({
                        name: call.name,
                        status,
                        output,
                        summary,
                        args: call.args,
                        latency_ms: Date.now() - start,
                        metadata: res.metadata
                    });
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
