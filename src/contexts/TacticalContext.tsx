/**
 * Tactical UI Context [Wave 70 - Global Evolution]
 * 
 * Standardizes sensory feedback (procedural audio & haptics) across the entire application.
 * Migrated from Admin-only to Global for a premium, unified user experience.
 * 
 * @module contexts/TacticalContext
 */
import React, { createContext, useContext, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface TacticalContextType {
    /** Plays a high-frequency success swell (440Hz -> 880Hz) */
    playSuccess: () => void;
    /** Plays a low-frequency sawtooth error drop (120Hz -> 80Hz) */
    playError: () => void;
    /** Plays a sharp high-frequency sine click for UI interactions */
    playClick: () => void;
    /** Plays a subtle triangle-wave tick for secondary interactions */
    playTick: () => void;
    /** 
     * Triggers hardware haptic feedback on supported devices.
     * @param pattern Vibration duration (ms) or pattern array. Defaults to 10ms subtle tap.
     */
    triggerHaptic: (pattern?: number | number[]) => void;
}

const TacticalContext = createContext<TacticalContextType | null>(null);

/**
 * TacticalProvider
 * Manages a singleton Web Audio Context and provides sensory feedback methods.
 * Now wrapped at App root for global Storefront + Admin accessibility.
 */
export const TacticalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const { profile } = useAuth();

    // 🌊 Adaptive Identity Engine (Wave 110)
    // Synchronizes the app's visual atmosphere with the user's AI-extracted persona.
    useEffect(() => {
        const hint = profile?.ia_context?.visual_theme_hint || 
                     profile?.ai_preferences?.visual_theme_hint;
        
        if (!hint) return;

        const root = document.documentElement;
        if (hint === 'vape') {
            root.style.setProperty('--vsm-accent-primary', '168 85 247'); // Purple
            root.style.setProperty('--vsm-accent-secondary', '139 92 246');
        } else if (hint === 'herbal') {
            root.style.setProperty('--vsm-accent-primary', '34 197 94'); // Green
            root.style.setProperty('--vsm-accent-secondary', '16 185 129');
        }
    }, [profile]);

    const initAudio = useCallback(() => {
        try {
            if (!audioContextRef.current) {
                // Support for legacy Webkit engines in older browsers
                interface LegacyWindow extends Window {
                    webkitAudioContext?: typeof AudioContext;
                }
                const AudioContextClass = window.AudioContext || (window as LegacyWindow).webkitAudioContext;
                if (AudioContextClass) {
                    audioContextRef.current = new AudioContextClass();
                }
            }
            
            const ctx = audioContextRef.current;
            if (ctx && ctx.state === 'suspended') {
                ctx.resume().catch(() => {
                    // Fail silently on resume errors
                });
            }
            return ctx;
        } catch (_err) {
            // Log for monitoring but fail silently
            console.warn('[TacticalUI] Failed to initialize AudioContext:', _err);
            return null;
        }
    }, []);

    const playSuccess = useCallback(() => {
        try {
            const ctx = initAudio();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + 0.05);
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.3);
        } catch (_err) {
            console.warn('[TacticalUI] playSuccess failed:', _err);
        }
    }, [initAudio]);

    const playError = useCallback(() => {
        try {
            const ctx = initAudio();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(120, now);
            osc.frequency.linearRampToValueAtTime(80, now + 0.2);
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.4);
        } catch (_err) {
            console.warn('[TacticalUI] playError failed:', _err);
        }
    }, [initAudio]);

    const playClick = useCallback(() => {
        try {
            const ctx = initAudio();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.05);
        } catch (_err) {
            console.warn('[TacticalUI] playClick failed:', _err);
        }
    }, [initAudio]);

    const playTick = useCallback(() => {
        try {
            const ctx = initAudio();
            if (!ctx) return;
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(800, now);
            gain.gain.setValueAtTime(0.03, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.02);
        } catch (_err) {
            console.warn('[TacticalUI] playTick failed:', _err);
        }
    }, [initAudio]);

    const triggerHaptic = useCallback((pattern: number | number[] = 10) => {
        try {
            if ('vibrate' in navigator) {
                navigator.vibrate(pattern);
            }
        } catch (_err) {
            // Silently ignore haptic failures
        }
    }, []);

    return (
        <TacticalContext.Provider value={{ playSuccess, playError, playClick, playTick, triggerHaptic }}>
            {children}
        </TacticalContext.Provider>
    );
};

export const useTacticalUI = () => {
    const context = useContext(TacticalContext);
    if (!context) {
        throw new Error('useTacticalUI must be used within a TacticalProvider');
    }
    return context;
};
