/**
 * useVoiceSearch - VSM Store
 * 
 * Custom hook para la lógica y gestión de VoiceSearch.
 * @module hooks/useVoiceSearch
 */

import { useState, useCallback, useEffect, useRef } from 'react';

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
 * VSM Voice Assistant Core - Mobile-First Resilience
 */
export function useVoiceSearch(options: VoiceSearchOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    const optionsRef = useRef(options);

    // Actualizar referencia de opciones para evitar cierres obsoletos
    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    /**
     * Valida si el entorno es seguro para usar reconocimiento de voz
     */
    const validateSecureContext = useCallback(() => {
        const isSecure = window.isSecureContext || 
                         window.location.protocol === 'https:' || 
                         window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
        
        if (!isSecure) {
            const msg = 'La búsqueda por voz requiere una conexión segura (HTTPS).';
            setError(msg);
            return false;
        }
        return true;
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (_err) {
                // Ignorar errores de parada
            }
        }
    }, []);

    const startListening = useCallback(() => {
        // 1. Limpieza de errores previos
        setError(null);
        setTranscript('');

        // 2. Validación proactiva de contexto seguro
        if (!validateSecureContext()) return;

        // 3. Obtener el constructor (On-demand para móviles)
        const w = window as unknown as { 
            SpeechRecognition?: SpeechRecognitionConstructor; 
            webkitSpeechRecognition?: SpeechRecognitionConstructor; 
        };
        const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setError('Tu navegador no soporta búsqueda por voz.');
            return;
        }

        try {
            // 4. Instancia nueva para cada sesión (Estrategia de resiliencia móvil)
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = optionsRef.current.language || 'es-MX';

            recognition.onstart = () => {
                setIsListening(true);
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
                console.error('[VoiceSearch] Error:', event.error);
                setIsListening(false);
                
                switch (event.error) {
                    case 'not-allowed':
                        setError('Acceso denegado al micrófono. Actívalo en la configuración del sitio.');
                        break;
                    case 'no-speech':
                        setError('No se detectó voz. Intenta de nuevo.');
                        break;
                    case 'audio-capture':
                        setError('Revisa la conexión de tu micrófono.');
                        break;
                    case 'network':
                        setError('Falla de red al procesar voz.');
                        break;
                    default:
                        setError('Error en reconocimiento de voz.');
                }
                optionsRef.current.onError?.(event.error);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();

        } catch (err) {
            console.error('[VoiceSearch] Start error:', err);
            setError('No se pudo iniciar el micrófono.');
            setIsListening(false);
        }
    }, [validateSecureContext]);

    // Limpieza al desmontar
    useEffect(() => {
        return () => stopListening();
    }, [stopListening]);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening
    };
}
