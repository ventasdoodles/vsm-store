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
                console.error('[voiceIntelligenceService] Text Error:', error);
            }
            return { searchQuery: transcript, isComplex: false };
        }
    },

    /**
     * Procesa un audio base64 para transcripción e intención vía Gemini Multimodal
     */
    async processAudio(base64Audio: string, mimeType: string = 'audio/webm'): Promise<{ searchQuery: string; isComplex: boolean }> {
        try {
            const { data, error } = await supabase.functions.invoke('voice-intelligence', {
                body: { 
                    audio: base64Audio,
                    mimeType
                }
            });

            if (error) throw error;

            return {
                searchQuery: data.searchQuery || 'Búsqueda por voz',
                isComplex: data.isComplex || false
            };
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[voiceIntelligenceService] Audio Error:', error);
            }
            return { searchQuery: 'Error en audio', isComplex: false };
        }
    }
};
