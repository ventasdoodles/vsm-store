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
                // Ignorar errores de parada
            }
        }
    }, []);

    const startListening = useCallback(() => {
        // 1. Limpieza y estado inicial (Síncrono para mantener gesto de usuario)
        setError(null);
        setTranscript('');
        
        // 2. Validación Básica de Contexto (Síncrona)
        if (!voiceDiagnostic.isSecureContext()) {
            setError('La búsqueda por voz requiere una conexión segura (HTTPS).');
            return;
        }

        // 3. Obtener el constructor (Voz Soberana - Zero-Gap)
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
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = optionsRef.current.language || 'es-MX';

            recognition.onstart = () => {
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
                setIsListening(false);
                setIsDiagnosing(false);
                
                // Si falla por permiso, activamos el diagnóstico detallado para guiar al usuario
                if (event.error === 'not-allowed') {
                    setError('Acceso denegado. Asegúrate de permitir el micrófono en la configuración de Safari/Chrome.');
                    // Disparar diagnóstico en secreto para logs/telemetría
                    void voiceDiagnostic.requestHardwareAccess();
                } else {
                    setError(voiceDiagnostic.getDetailedErrorMessage(event.error));
                }
                
                optionsRef.current.onError?.(event.error);
            };

            recognition.onend = () => {
                setIsListening(false);
                setIsDiagnosing(false);
            };

            recognitionRef.current = recognition;
            
            // EL MOMENTO CRÍTICO: .start() DEBE ser llamado síncronamente en Safari
            recognition.start();

            // Marcamos diagnóstico activo hasta que onstart o onerror respondan
            setIsDiagnosing(true);

        } catch (err) {
            console.error('[VoiceSearch] Instant start failure:', err);
            setError('No se pudo activar el micrófono.');
            setIsListening(false);
            setIsDiagnosing(false);
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
