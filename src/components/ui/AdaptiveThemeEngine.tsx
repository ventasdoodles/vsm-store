import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

/**
 * AdaptiveThemeEngine (Wave 80 - Identity Pulse)
 * 
 * Silently adjusts global CSS variables based on AI-extracted preferences.
 * Changes accent colors, glow intensities, and atmospheric hints to reflect user identity.
 */
export const AdaptiveThemeEngine: React.FC = () => {
    const { profile } = useAuth();

    useEffect(() => {
        if (!profile?.ai_preferences) return;

        const { visual_theme_hint } = profile.ai_preferences;
        const root = document.documentElement;

        // Dynamic Accent Transformation
        if (visual_theme_hint === 'vape') {
            root.style.setProperty('--accent-primary', '#6366f1'); // Indigo/Vape hint
            root.style.setProperty('--glow-color', 'rgba(99, 102, 241, 0.5)');
        } else if (visual_theme_hint === 'herbal') {
            root.style.setProperty('--accent-primary', '#10b981'); // Emerald/Herbal hint
            root.style.setProperty('--glow-color', 'rgba(16, 185, 129, 0.5)');
        } else {
            // Neutral/Default Obsidian Quantum
            root.style.setProperty('--accent-primary', '#3b82f6'); 
            root.style.setProperty('--glow-color', 'rgba(59, 130, 246, 0.5)');
        }

        // Apply a subtle identify pulse class if preferences are deep
        if (profile.ai_preferences.interests && profile.ai_preferences.interests.length > 2) {
            root.classList.add('identity-pulse-active');
        } else {
            root.classList.remove('identity-pulse-active');
        }

    }, [profile?.ai_preferences]);

    return null; // Silent orchestrator
};
