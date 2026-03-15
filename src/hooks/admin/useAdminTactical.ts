/**
 * // ─── HOOK: useAdminTactical ─── [Wave 129 - Sensorama UX]
 * // Propósito: Centralizar el feedback sensorial (Audio + Háptico) del Admin Panel.
 * // Inspiración: Obsidian / Linear / Apple Pro Workflow feel.
 */
import { useCallback, useRef, useEffect } from 'react';
import { useHaptic } from '@/hooks/useHaptic';

type AdminTacticalAction = 
    | 'click-subtle' 
    | 'click-heavy' 
    | 'success-major' 
    | 'delete-confirm' 
    | 'alert-pulse' 
    | 'navigation-glide';

export function useAdminTactical() {
    const { trigger: triggerHaptic } = useHaptic();
    const audioCtx = useRef<AudioContext | null>(null);

    useEffect(() => {
        const initAudio = () => {
            if (!audioCtx.current) {
                const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx.current = new AudioContextClass();
                }
            }
        };

        window.addEventListener('mousedown', initAudio, { once: true });
        return () => window.removeEventListener('mousedown', initAudio);
    }, []);

    const triggerSensory = useCallback((action: AdminTacticalAction) => {
        if (!audioCtx.current) return;
        if (audioCtx.current.state === 'suspended') audioCtx.current.resume();

        switch (action) {
            case 'click-subtle':
                triggerHaptic('light');
                playProceduralTick(400, 0.02, 0.1);
                break;
            case 'click-heavy':
                triggerHaptic('medium');
                playProceduralTick(300, 0.05, 0.2);
                break;
            case 'success-major':
                triggerHaptic('success');
                playProceduralSuccess();
                break;
            case 'delete-confirm':
                triggerHaptic('heavy');
                playProceduralWarning();
                break;
            case 'alert-pulse':
                triggerHaptic('warning');
                break;
            case 'navigation-glide':
                triggerHaptic('light');
                playProceduralTick(800, 0.01, 0.05);
                break;
        }
    }, [triggerHaptic]);

    // ─── Procedural Audio Generators (No files needed) ───

    function playProceduralTick(freq: number, duration: number, volume: number) {
        if (!audioCtx.current) return;
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.current.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, audioCtx.current.currentTime + duration);

        gain.gain.setValueAtTime(volume, audioCtx.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.current.currentTime + duration);

        osc.start();
        osc.stop(audioCtx.current.currentTime + duration);
    }

    function playProceduralSuccess() {
        if (!audioCtx.current) return;
        const t = audioCtx.current.currentTime;
        [880, 1108.73, 1318.51].forEach((f, i) => { // A5, C#6, E6
            const osc = audioCtx.current!.createOscillator();
            const gain = audioCtx.current!.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.current!.destination);
            osc.frequency.setValueAtTime(f, t + i * 0.05);
            gain.gain.setValueAtTime(0.1, t + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.3);
            osc.start(t + i * 0.05);
            osc.stop(t + i * 0.05 + 0.3);
        });
    }

    function playProceduralWarning() {
        if (!audioCtx.current) return;
        const t = audioCtx.current.currentTime;
        const osc = audioCtx.current.createOscillator();
        const gain = audioCtx.current.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.current.destination);
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start();
        osc.stop(t + 0.3);
    }

    return { triggerSensory };
}
