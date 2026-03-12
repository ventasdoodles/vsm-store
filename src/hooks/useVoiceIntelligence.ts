/**
 * // ─── HOOK: useVoiceIntelligence ───
 * // Arquitectura: Custom Hook
 * // Propósito central: Procesar búsqueda por voz usando IA (OpenAI Whisper / base AI).
 * // Cumple con regla §1.1 (Component -> Hook -> Service).
 */
import { useMutation } from '@tanstack/react-query';
import { voiceIntelligenceService } from '@/services/voice.service';

export function useVoiceIntelligence() {
    return useMutation({
        mutationFn: (text: string) => voiceIntelligenceService.processTranscript(text),
        onError: (error) => {
            console.error('[useVoiceIntelligence] Error processing transcript:', error);
        }
    });
}
