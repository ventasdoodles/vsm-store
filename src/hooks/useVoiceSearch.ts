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

interface VoiceSearchOptions {
    onResult?: (transcript: string) => void;
    onError?: (error: string) => void;
    language?: string;
}

/**
 * Hook para gestionar el reconocimiento de voz (Web Speech API)
 * VSM Voice Assistant Core
 */
export function useVoiceSearch(options: VoiceSearchOptions = {}) {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const optionsRef = useRef(options);

    useEffect(() => {
        optionsRef.current = options;
    }, [options]);

    useEffect(() => {
        const w = window as unknown as Window & { 
            SpeechRecognition: any; 
            webkitSpeechRecognition: any; 
        };
        const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setError('Tu navegador no soporta búsqueda por voz.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = optionsRef.current.language || 'es-MX';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            setTranscript('');
        };

        // Escucha resultados parciales y finales
        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const current = event.resultIndex;
            const resultTranscript = event.results[current]?.[0]?.transcript || '';
            setTranscript(resultTranscript);
            
            if (event.results[current]?.isFinal) {
                optionsRef.current.onResult?.(resultTranscript);
            }
        };

        // Manejo granular de errores según la especificación Web Speech API
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('[VoiceSearch] Error:', event.error);
            setIsListening(false);
            
            // Check for secure context (HTTPS requirement)
            if (!window.isSecureContext) {
                setError('La búsqueda por voz requiere una conexión segura (HTTPS).');
                return;
            }

            switch (event.error) {
                case 'not-allowed':
                    setError('Micrófono bloqueado. Revisa los permisos en la barra de direcciones.');
                    break;
                case 'no-speech':
                    setError('No se detectó voz. Intenta acercarte al micrófono.');
                    break;
                case 'audio-capture':
                    setError('Error de hardware al capturar audio.');
                    break;
                case 'network':
                    setError('Fallo de conexión al procesar voz.');
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
    }, []); // Se ejecuta una sola vez para inicializar la instancia

    const startListening = useCallback(() => {
        if (!recognitionRef.current) return;
        
        try {
            recognitionRef.current.start();
        } catch (_err) {
            console.error('[VoiceSearch] Start error:', _err);
        }
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (_err) {
                // Ignore stop errors
            }
        }
    }, []);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening
    };
}
