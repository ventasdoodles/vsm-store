import { useState, useCallback, useRef, useEffect } from 'react';

export interface VoiceRecorderResult {
    transcript: string;
    isFinal: boolean;
}

interface ISpeechRecognitionEvent {
    resultIndex: number;
    results: {
        length: number;
        [index: number]: {
            isFinal: boolean;
            0?: { transcript: string };
        };
    };
}

interface ISpeechRecognition {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    onresult: ((event: ISpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event & { error?: string }) => void) | null;
    onend: (() => void) | null;
}

/**
 * useVoiceRecorder Hook [Wave 60 - Quantum Administration]
 * 
 * High-level reactive interface for the browser's Web Speech API.
 * Manages the lifecycle of a SpeechRecognition session, providing 
 * real-time transcription and error handling.
 */
export function useVoiceRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);
    
    // Use a Ref to hold the instance throughout the component lifecycle (Experimental API)
    const recognitionRef = useRef<ISpeechRecognition | null>(null);

    useEffect(() => {
        // Feature detection for various browser engines
        // @ts-expect-error - SpeechRecognition is still experimental
        const SpeechRecognitionClass = window.SpeechRecognition || (window as unknown as { webkitSpeechRecognition: new () => ISpeechRecognition }).webkitSpeechRecognition;
        
        if (SpeechRecognitionClass) {
            recognitionRef.current = new SpeechRecognitionClass();
            recognitionRef.current!.continuous = false;
            recognitionRef.current!.interimResults = true;
            recognitionRef.current!.lang = 'es-MX'; // Prioritize Spanish

            // Event: On Result (Transcribing)
            recognitionRef.current!.onresult = (event: ISpeechRecognitionEvent) => {
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    const result = event.results[i];
                    if (result && result.isFinal && result[0]) {
                        setTranscript(result[0].transcript);
                    }
                }
            };

            // Event: On Error
            recognitionRef.current!.onerror = (event: Event & { error?: string }) => {
                setError(event.error ?? 'Unknown recognition error');
                setIsRecording(false);
            };

            // Event: On End
            recognitionRef.current!.onend = () => {
                setIsRecording(false);
            };
        } else {
            setError('Speech recognition not supported in this browser.');
        }
    }, []);

    const startRecording = useCallback(() => {
        if (recognitionRef.current && !isRecording) {
            setTranscript('');
            setError(null);
            try {
                recognitionRef.current.start();
                setIsRecording(true);
            } catch (err) {
                if (import.meta.env.DEV) console.error('Recognition start error:', err);
            }
        }
    }, [isRecording]);

    const stopRecording = useCallback(() => {
        if (recognitionRef.current && isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    return {
        isRecording,
        transcript,
        error,
        startRecording,
        stopRecording,
        toggleRecording
    };
}
