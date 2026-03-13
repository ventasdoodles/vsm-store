import { useState, useCallback } from 'react';
import { conciergeService, ConciergeMessage } from '@/services/concierge.service';
import { useAuth } from '@/hooks/useAuth';
import { useTacticalUI } from '@/contexts/TacticalContext';

export function useAIConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ConciergeMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '¡Hola! Soy tu asistente de VSM Store. ¿Buscas algo especial hoy?',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, profile } = useAuth();
    const { playClick, playSuccess, playTick, playError, triggerHaptic } = useTacticalUI();

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const userMsg: ConciergeMessage = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        playTick();
        triggerHaptic(10);

        try {
            const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
            const response = await conciergeService.chat(content, history, { ...user, ...profile });

            const assistantMsg: ConciergeMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date(),
                suggestedProducts: response.suggestedProducts,
                intent: response.intent
            };

            setMessages(prev => [...prev, assistantMsg]);
            playSuccess();
            triggerHaptic([10, 30, 10]);

            // Cognitive Loyalty: Persist findings if the user is authenticated
            if (user && response.intent === 'recommendation') {
                // Determine a theme hint based on content for the Adaptive Engine
                const hint = content.toLowerCase().includes('vape') ? 'vape' : 
                             content.toLowerCase().includes('herbal') ? 'herbal' : undefined;
                
                const newPrefs = {
                    ...profile?.ai_preferences,
                    visual_theme_hint: hint || profile?.ai_preferences?.visual_theme_hint,
                    interests: [...(profile?.ai_preferences?.interests || []), content].slice(-5)
                };
                
                // Persist structured preferences AND the raw interaction context
                const newIAContext = {
                    ...profile?.ia_context,
                    last_intent: response.intent,
                    last_query: content,
                    last_update: new Date().toISOString()
                };

                await conciergeService.updatePreferences(user.id, newPrefs, newIAContext);
            }
        } catch (_error) {
            playError();
            triggerHaptic(80);
            const errorMsg: ConciergeMessage = {
                id: 'error',
                role: 'assistant',
                content: 'Lo siento, tuve un problema. ¿Podemos intentar de nuevo?',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [messages, user, profile, playTick, playSuccess, playError, triggerHaptic]);

    const toggleOpen = useCallback(() => {
        playClick();
        triggerHaptic(20);
        setIsOpen(prev => !prev);
    }, [playClick, triggerHaptic]);

    return {
        isOpen,
        messages,
        isLoading,
        sendMessage,
        toggleOpen
    };
}
