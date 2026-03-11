/**
 * useVoiceSearch - VSM Store
 * 
 * Custom hook para la lógica y gestión de VoiceSearch.
 * @module hooks/useVoiceSearch
 */

import { useState, useCallback, useEffect, useRef } from 'react';

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
    
    // Referencia al motor de reconocimiento para evitar recreaciones
    const recognitionRef = useRef<any>(null); // Todavía usamos any para el constructor global, pero tipamos los eventos

    useEffect(() => {
        // Verificar soporte del navegador
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            setError('Tu navegador no soporta búsqueda por voz.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false; // Queremos frases cortas de búsqueda
        recognition.interimResults = true;
        recognition.lang = options.language || 'es-MX';

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
            setTranscript('');
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const current = event.resultIndex;
            const resultTranscript = event.results[current]?.[0]?.transcript || '';
            setTranscript(resultTranscript);
            
            if (event.results[current]?.isFinal) {
                options.onResult?.(resultTranscript);
            }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.error('[VoiceSearch] Error:', event.error);
            setIsListening(false);
            setError(event.error === 'no-speech' ? 'No te escuché bien.' : 'Error al reconocer voz.');
            options.onError?.(event.error);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;
    }, [options.language, options.onResult, options.onError]);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
            } catch (err) {
                console.error('[VoiceSearch] Start error:', err);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
        }
    }, [isListening]);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening
    };
}
