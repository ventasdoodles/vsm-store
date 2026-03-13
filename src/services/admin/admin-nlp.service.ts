import { supabase } from '@/lib/supabase';

export interface NLPIntent {
    action: 'search' | 'navigate' | 'filter' | 'unknown';
    target?: string;
    params?: Record<string, string | number>;
    originalQuery: string;
}

/** Internal interface for Supabase Function response */
interface NLPResponse {
    action: NLPIntent['action'];
    target?: string;
    params?: Record<string, string | number>;
    message?: string;
}

/**
 * Admin NLP Service [Wave 60 - Quantum Administration]
 * 
 * Orchestrates Natural Language Processing for administrative tasks.
 * Communicates with the 'customer-intelligence' Edge Function to parse 
 * user intents and generate AI-driven communication copies.
 * 
 * Strictly follows §1.8 by using Supabase Functions for secure AI inferencing.
 */
export const adminNLPService = {
    /**
     * Parses a natural language query into a structured intent.
     * Used by the AdminCommandPalette for voice and text-based navigation/search.
     * @param text The raw input from the user (transcribed or typed)
     * @returns A promise that resolves to an NLPIntent object.
     */
    async parseAdminIntent(text: string): Promise<NLPIntent> {
        try {
            const { data, error } = await supabase.functions.invoke<NLPResponse>('customer-intelligence', {
                body: { 
                    action: 'parse_admin_intent', 
                    query: text 
                }
            });

            if (error) throw error;
            
            return {
                action: (data?.action as NLPIntent['action']) || 'unknown',
                target: data?.target,
                params: data?.params,
                originalQuery: text
            };
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('NLP Parse Error:', error);
            }
            return {
                action: 'unknown',
                originalQuery: text
            };
        }
    },

    /**
     * Genera un mensaje de WhatsApp para el proveedor sugerido por IA
     */
    async generateSupplierOrderCopy(productName: string, currentStock: number, sku: string): Promise<string> {
        try {
            const { data, error } = await supabase.functions.invoke('customer-intelligence', {
                body: { 
                    action: 'generate_supplier_copy', 
                    productName,
                    currentStock,
                    sku
                }
            });

            if (error) throw error;
            return data.message || `Hola, necesito reabastecer ${productName} (SKU: ${sku}). Actualmente tenemos ${currentStock} unidades.`;
        } catch (_error) {
            return `Hola, necesito cotización para reabastecer ${productName} (SKU: ${sku}).`;
        }
    }
};
