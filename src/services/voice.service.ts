/**
 * voice.service - VSM Store
 * 
 * Servicio para la lógica y gestión de voice.
 * @module services/voice.service
 */

import { supabase } from '@/lib/supabase';

/**
 * Servicio para interactuar con la inteligencia de voz de VSM
 */
export const voiceIntelligenceService = {
    /**
     * Procesa una transcripción de voz para extraer la intención de búsqueda real via Gemini
     */
    async processTranscript(transcript: string): Promise<{ searchQuery: string; isComplex: boolean }> {
        try {
            const { data, error } = await supabase.functions.invoke('voice-intelligence', {
                body: { transcript }
            });

            if (error) throw error;
            
            return {
                searchQuery: data.searchQuery || transcript,
                isComplex: data.isComplex || false
            };
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[voiceIntelligenceService] Error:', error);
            }
            // Fallback al texto original si la IA falla
            return { searchQuery: transcript, isComplex: false };
        }
    }
};
