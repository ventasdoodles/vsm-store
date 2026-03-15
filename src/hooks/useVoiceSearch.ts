import { useState, useCallback, useEffect, useRef } from 'react';
import { voiceDiagnostic } from '@/services/VoiceDiagnosticService';

// ... (API types remain the same)

// Web Speech API Types
interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: {
        [key: number]: {
            [key: number]: { transcript: string };
            isFinal: boolean;
        };
        length: number;
    };
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

// Minimal interface for SpeechRecognition
interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
}

interface VoiceSearchOptions {
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    language?: string;
}

interface SpeechRecognitionConstructor {
    new (): SpeechRecognitionInstance;
}

/**
 * Hook para gestionar el reconocimiento de voz (Web Speech API)
 * VSM Voice Assistant Core - Wave 137: Sovereign Voice
 */
export function useVoiceSearch(options: VoiceSearchOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const fallbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const optionsRef = useRef(options);

    // Actualizar referencia de opciones
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (_err) {
                // Ignorar
            }
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            try {
                mediaRecorderRef.current.stop();
            } catch (_err) {
                // Ignorar
            }
        }
        if (fallbackTimeoutRef.current) {
            clearTimeout(fallbackTimeoutRef.current);
            fallbackTimeoutRef.current = null;
        }
        setIsListening(false);
        setIsDiagnosing(false);
    }, []);

    const startListening = useCallback(async () => {
        // 1. Limpieza y estado inicial
        setError(null);
        setTranscript('');
        setIsDiagnosing(true);
        
        // 2. Validación Básica de Contexto
        if (!voiceDiagnostic.isSecureContext()) {
            setError('La búsqueda por voz requiere una conexión segura (HTTPS).');
            setIsDiagnosing(false);
            return;
        }

        // 3. Fallback de Grabación (El motor de salvación)
        const startFallbackRecording = async () => {
            console.warn('[VoiceSearch] Native engine unavailable or failed. Switching to Hybrid AI Fallback...');
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorderRef.current = mediaRecorder;
                audioChunksRef.current = [];

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) audioChunksRef.current.push(event.data);
                };

                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    setIsDiagnosing(true); // Procesando en la nube
                    setTranscript('Procesando audio...');
                    
                    try {
                        console.log('[VoiceSearch] Audio captured for AI Processing:', audioBlob.size, 'bytes');
                        // TODO: Implementar upload y transcripción vía Gemini
                        optionsRef.current.onResult?.('Búsqueda por voz (Modo Híbrido)');
                    } catch (err) {
                        setError('Error al procesar la grabación.');
                    } finally {
                        setIsDiagnosing(false);
                        stream.getTracks().forEach(track => track.stop());
                    }
                };

                mediaRecorder.start();
                setIsListening(true);
                setIsDiagnosing(false);
                setTranscript('Escuchando (Modo Híbrido)...');
            } catch (err) {
                console.error('[VoiceSearch] Fallback failed:', err);
                setError('No se pudo acceder al micrófono para la búsqueda.');
                setIsDiagnosing(false);
            }
        };

        // 4. Intentar Motor Nativo
        const w = window as unknown as { 
            SpeechRecognition?: SpeechRecognitionConstructor; 
            webkitSpeechRecognition?: SpeechRecognitionConstructor; 
        };
        const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            await startFallbackRecording();
            return;
        }

        try {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = optionsRef.current.language || 'es-MX';

            recognition.onstart = () => {
                if (fallbackTimeoutRef.current) {
                    clearTimeout(fallbackTimeoutRef.current);
                    fallbackTimeoutRef.current = null;
                }
                setIsListening(true);
                setIsDiagnosing(false);
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                const current = event.resultIndex;
                const resultTranscript = event.results[current]?.[0]?.transcript || '';
                setTranscript(resultTranscript);
                
                if (event.results[current]?.isFinal) {
                    optionsRef.current.onResult?.(resultTranscript);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('[VoiceSearch] Engine Error:', event.error);
                if (fallbackTimeoutRef.current) {
                    clearTimeout(fallbackTimeoutRef.current);
                    fallbackTimeoutRef.current = null;
                }
                
                // Si el error indica bloqueo o falta de servicio, saltamos al fallback
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    void startFallbackRecording();
                } else {
                    setError(voiceDiagnostic.getDetailedErrorMessage(event.error));
                    setIsListening(false);
                    setIsDiagnosing(false);
                }
                optionsRef.current.onError?.(event.error);
            };

            recognition.onend = () => {
                // Solo detenemos si no estamos en proceso de fallback
                if (!fallbackTimeoutRef.current && mediaRecorderRef.current?.state === 'inactive') {
                    setIsListening(false);
                    setIsDiagnosing(false);
                }
            };

            recognitionRef.current = recognition;
            
            // PROGRAMAR FALLBACK: Si en 1.5s no hay onstart, forzamos grabación
            fallbackTimeoutRef.current = setTimeout(() => {
                console.warn('[VoiceSearch] Native engine timeout. Forcing fallback...');
                try {
                    recognition.abort();
                } catch (_e) { /* ignore */ }
                void startFallbackRecording();
            }, 1500);

            recognition.start();
        } catch (err) {
            console.error('[VoiceSearch] Native failure:', err);
            await startFallbackRecording();
        }
    }, []);

    // Cleanup
    useEffect(() => {
        return () => stopListening();
    }, [stopListening]);

    return {
        isListening,
        isDiagnosing,
        transcript,
        error,
        startListening,
        stopListening
    };
}
