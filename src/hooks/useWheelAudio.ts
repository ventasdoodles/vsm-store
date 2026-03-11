import { useCallback, useEffect, useRef } from 'react';

export function useWheelAudio() {
    const audioCtx = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Inicializar contexto de forma "lazy" para cumplir con las políticas de Autoplay del navegador
        const initAudio = () => {
            if (!audioCtx.current) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx.current = new AudioContextClass();
                }
            }
        };

        // Escuchamos el primer click o touch en la pantalla para desbloquear el audio context
        document.addEventListener('pointerdown', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });

        return () => {
            document.removeEventListener('pointerdown', initAudio);
            document.removeEventListener('keydown', initAudio);
            if (audioCtx.current?.state !== 'closed') {
                audioCtx.current?.close().catch(() => {});
            }
        };
    }, []);

    const playTick = useCallback((intensity: 'high' | 'low' = 'low') => {
        if (!audioCtx.current) return;
        try {
            if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
            const t = audioCtx.current.currentTime;
            
            // "Tick" cortito que simula una lengüeta de madera golpeando los pernos
            const osc = audioCtx.current.createOscillator();
            const gain = audioCtx.current.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.current.destination);
            
            osc.type = 'triangle';
            // Menos agudo cuando va lento, mas agudo cuando va rápido
            osc.frequency.setValueAtTime(intensity === 'high' ? 800 : 600, t);
            osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);
            
            gain.gain.setValueAtTime(intensity === 'high' ? 0.3 : 0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            
            osc.start(t);
            osc.stop(t + 0.05);
        } catch (_e) {
            // Silencio seguro en caso de navegadores restrictivos
        }
    }, []);

    const playWin = useCallback((type: 'points' | 'coupon' | 'empty') => {
        if (!audioCtx.current || type === 'empty') return;
        try {
            if (audioCtx.current.state === 'suspended') audioCtx.current.resume();
            const t = audioCtx.current.currentTime;
            
            // Mágico Arpegio de Victoria (Premium Casino Feel)
            const freqs = [523.25, 659.25, 783.99, 1046.50]; // Notas: C5, E5, G5, C6
            
            freqs.forEach((freq, i) => {
                const osc = audioCtx.current!.createOscillator();
                const gain = audioCtx.current!.createGain();
                
                osc.connect(gain);
                gain.connect(audioCtx.current!.destination);
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                // Envolvente de volumen (Attack suave y decay largo)
                const time = t + (i * 0.1);
                gain.gain.setValueAtTime(0, time);
                gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 2.5);
                
                osc.start(time);
                osc.stop(time + 2.5);
            });
            
            // Destello agudo final ("Shimmer")
            const sweepOsc = audioCtx.current.createOscillator();
            const sweepGain = audioCtx.current.createGain();
            sweepOsc.connect(sweepGain);
            sweepGain.connect(audioCtx.current.destination);
            
            sweepOsc.type = 'sine';
            sweepOsc.frequency.setValueAtTime(2000, t);
            sweepOsc.frequency.linearRampToValueAtTime(4000, t + 0.5);
            
            sweepGain.gain.setValueAtTime(0, t);
            sweepGain.gain.linearRampToValueAtTime(0.1, t + 0.1);
            sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
            
            sweepOsc.start(t);
            sweepOsc.stop(t + 1.5);

        } catch (_e) {
            // Ignorar errores en Safari/Mobile de reproducción forzada
        }
    }, []);

    return { playTick, playWin };
}
