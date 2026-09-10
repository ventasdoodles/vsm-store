import { useState, useRef, useCallback } from 'react';

export interface UseConciergeAudioOptions {
    onAudioRecorded: (base64Audio: string) => void;
    onError?: (error: unknown) => void;
    playTick?: () => void;
    playClick?: () => void;
    playError?: () => void;
}

export function useConciergeAudio({
    onAudioRecorded,
    onError,
    playTick,
    playClick,
    playError,
}: UseConciergeAudioOptions) {
    const [isListening, setIsListening] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1] || '';
                    onAudioRecorded(base64);
                };
                stream.getTracks().forEach((track) => track.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            playTick?.();
        } catch (err) {
            console.error('[Concierge] Voice Error:', err);
            playError?.();
            onError?.(err);
        }
    }, [onError, onAudioRecorded, playError, playTick]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
            playClick?.();
        }
    }, [playClick]);

    return {
        isListening,
        startRecording,
        stopRecording,
    };
}
