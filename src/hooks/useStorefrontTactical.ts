/**
 * // ─── HOOK: useStorefrontTactical ─── [Wave 133 - Voice & Sensory]
 * // Propósito: Centralizar el feedback sensorial (Audio + Háptico) para el Storefront.
 * // Inspiración: Premium App Feel / Dynamic UX.
 */
import { useCallback, useRef, useEffect } from 'react';
import { useHaptic } from '@/hooks/useHaptic';

type StorefrontTacticalAction = 
    | 'search-open' 
    | 'voice-listen' 
    | 'voice-success' 
    | 'voice-error' 
    | 'nav-click'
    | 'success-toast';

export function useStorefrontTactical() {
    const { trigger: triggerHaptic } = useHaptic();
    const audioCtx = useRef<AudioContext | null>(null);

    useEffect(() => {
        const initAudio = () => {
            if (!audioCtx.current) {
                const w = window as unknown as Window & { 
                    webkitAudioContext: typeof AudioContext; 
                };
                const AudioContextClass = window.AudioContext || w.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx.current = new AudioContextClass();
                }
            }
        };

        window.addEventListener('mousedown', initAudio, { once: true });
        window.addEventListener('touchstart', initAudio, { once: true });
        return () => {
            window.removeEventListener('mousedown', initAudio);
            window.removeEventListener('touchstart', initAudio);
        };
    }, []);

    const playTick = useCallback((freq: number, duration: number, volume: number) => {
        if (!audioCtx.current) return;
        if (audioCtx.current.state === 'suspended') audioCtx.current.resume();

        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, audioCtx.current.currentTime + duration);

        gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);

        osc.start();
        osc.stop(audioCtx.current.currentTime + duration);
    }, []);

    const triggerSensory = useCallback((action: StorefrontTacticalAction) => {
        switch (action) {
            case 'search-open':
                triggerHaptic('light');
                playTick(600, 0.05, 0.1);
                break;
            case 'voice-listen':
                triggerHaptic('medium');
                playTick(440, 0.1, 0.15);
                break;
            case 'voice-success':
                triggerHaptic('success');
                // Ascending melodic flourish
                [523.25, 659.25, 783.99].forEach((f, i) => {
                    setTimeout(() => playTick(f, 0.2, 0.1), i * 100);
                });
                break;
            case 'voice-error':
                triggerHaptic('error');
                playTick(150, 0.3, 0.2);
                break;
            case 'nav-click':
                triggerHaptic('light');
                playTick(800, 0.02, 0.05);
                break;
            case 'success-toast':
                triggerHaptic('success');
                playTick(1000, 0.1, 0.1);
                break;
        }
    }, [triggerHaptic, playTick]);

    return { triggerSensory };
}
