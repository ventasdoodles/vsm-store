export interface AnalystPromptContext {
    capabilitySummary: string;
    query: string;
    customerContext: any;
    customerMemory: any;
    customerPreferencePromptSummary: string | null;
    customerCommercialMemoryGuidance: string | null;
    softContinuityPromptBlock: string | null;
    customerProactiveInsights: any | null;
}

export function buildAnalystSystemPrompt(capabilitySummary: string, behaviorRules: import('../infrastructure/behavior-rules.repo.ts').AIBehaviorRule[] = []): string {
    const rulesText = behaviorRules.length > 0
        ? `\n        REGLAS DEL DUEÑO (MÁXIMA PRIORIDAD):\n${behaviorRules.map(r => `        - [${r.type}] ${r.rule_text}`).join('\n')}`
        : '';

    return `
        Eres "The Analyst", el motor de decision por turno de VSM Store.
        Decide primero si este turno se resuelve mejor con respuesta directa, una pregunta corta o una capacidad real de tienda.
        No empujes catalogo, politicas, carrito ni herramientas por reflejo.
        ${rulesText}
        
        REGLA DE TURNO PRIMARIO:
        - El intent debe reflejar el turno actual más importante, no la inercia del historial.
        - Si el mensaje trae dos necesidades, elige una primera y deja la otra como secondary_intents.
        - No mezcles varias necesidades en una sola salida robótica.
        
        CAPABILITY BOX:
        ${capabilitySummary}
        
        REGLAS DE CAPACIDAD:
        - Por defecto gana model_turn_reasoning si el turno se puede resolver honestamente sin lookup ni accion real.
        - OWN_FUNCTION gana cuando hace falta verdad privada, estado interno o accion real.
        - NATIVE_PUBLIC solo entra si hace falta contexto publico externo de verdad; no por reflejo.
        - Si primero conviene aclarar, deja "tool_calls" en [] aunque exista una capacidad posible.
        - REGLA DE requires_semantic_expansion: false para nombres específicos; true solo para conceptos o preferencias vagas.
        - Usa OUT_OF_DOMAIN si el cliente pregunta por algo completamente ajeno a vapeo, 420 y la tienda. Deja "tool_calls" vacío [].
        
        ATAJOS DE CLASIFICACION SOLO SI EL TURNO LO PIDE:
        - KITS, starter setup o hardware upgrade -> KIT_ASSEMBLY.
        - ALGO MAS BARATO / price friction / trade-down -> BUDGET_RESCUE.
        - CHECKOUT readiness / close-now friction / payment-method / shipping-cost readiness -> CHECKOUT_READINESS.
        - COMPATIBILIDAD/FIT -> COMPATIBILITY_CHECK.
        - URL explicita o verificacion publica externa real -> PUBLIC_INFO.
        - FUERA DE DOMINIO -> OUT_OF_DOMAIN sin herramientas.
        - SOLO usa UNKNOWN si el mensaje es realmente indescifrable.
    `;
}

export function buildAnalystUserPromptBlocks(context: AnalystPromptContext): string {
    const blocks = [
        `MENSAJE: "${context.query || 'Audio Context'}"`,
        `CONTEXTO CLIENTE: ${JSON.stringify(context.customerContext || 'Nuevo')}`,
    ];

    if (context.customerMemory) {
        blocks.push(`
        --- MEMORIA PERSISTENTE (SESIÓN ANTERIOR) ---
        ESTA INFORMACIÓN ES SOLO PARA SESGAR BÚSQUEDAS Y DESAMBIGUAR.
        LOS INTERESES AL INICIO DE LA LISTA TIENEN MAYOR FRECUENCIA/PESO HISTÓRICO.
        REGLA: EL DESEO ACTUAL DEL USUARIO SIEMPRE TIENE PRIORIDAD ABSOLUTA.
        ${context.customerMemory.prioritized_interests?.length ? `INTERESES PREVIOS (ORDENADOS POR PESO): ${context.customerMemory.prioritized_interests.join(', ')}` : ''}
        ${context.customerPreferencePromptSummary ? `RESUMEN LIGERO DE GUSTOS: ${context.customerPreferencePromptSummary}` : ''}
        ${context.customerCommercialMemoryGuidance ? `GUIA COMERCIAL DE CONTINUIDAD: ${context.customerCommercialMemoryGuidance}` : ''}
        REGLAS:
        - Lo actual manda sobre lo historico.
        - Una tendencia debil no es verdad dura.
        - Solo usa esta memoria si ayuda a recomendar mejor o a evitar algo que ya rechazo.
        - Si la memoria ya da una direccion util y el turno viene abierto, puedes aterrizar mas rapido sin preguntar de mas.
        ÚLTIMA INTERACCIÓN: ${context.customerMemory.last_interaction_at}
        `);
    }

    if (context.softContinuityPromptBlock) {
        blocks.push(`
        ${context.softContinuityPromptBlock}
        REGLA DE CONTINUIDAD:
        - Si usas continuidad, que sea una frase corta y humilde.
        - Si el turno actual cambio de carril, no arrastres el carril previo.
        - No abras catalogo, carrito ni politicas solo por contexto previo.
        `);
    }

    if (context.customerProactiveInsights) {
        const insights = context.customerProactiveInsights;
        let proactiveText = '';
        if (insights.items_due_for_replenishment?.length) {
            proactiveText += `- REPLENISHMENT: El cliente compró hace días líquidos/desechables que podrían estar por terminarse (${insights.items_due_for_replenishment.map((i:any) => i.product_name).join(', ')}). Si dice hola, sugiere cordialmente reponerlos.\n`;
        }
        if (insights.owned_hardware_models?.length) {
            proactiveText += `- KITTING DE HARDWARE: El cliente es dueño de estos equipos: ${insights.owned_hardware_models.join(', ')}. Si pide consumibles (resistencias, pods, repuestos) y no especifica el modelo, ASUME que son para estos equipos directamente, sin hacerle perder tiempo preguntando.\n`;
        }
        if (insights.customer_tier) {
            proactiveText += `- LEALTAD: Nivel actual: ${insights.customer_tier}. Si vas a recomendar o vender algo extra, puedes mencionar de forma casual su nivel para hacerlo sentir especial.\n`;
        }

        if (proactiveText.length > 0) {
            blocks.push(`
        --- GANCHOS COMERCIALES PROACTIVOS ---
        INFORMACIÓN DE COMPRAS PASADAS REALES.
        ${proactiveText}
        REGLA PROACTIVA: Usa esta información COMO UN EJECUTIVO DE CUENTA. 
        - Si el usuario sólo dice hola y tienes Replenishment, recomiéndale de vuelta su producto.
        - Si el usuario busca algo y tienes Kitting, NO PREGUNTES para qué equipo es si ya lo tienes en la lista.
        - Sé natural y no presiones.
        `);
        }
    }

    return blocks.filter(Boolean).join('\n');
}
