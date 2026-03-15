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
    const { playClick, playSuccess, playTick, playError, triggerHaptic, speak } = useTacticalUI();

    const addMessage = useCallback((msg: Partial<ConciergeMessage>) => {
        const fullMsg: ConciergeMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            ...msg
        };
        setMessages(prev => [...prev, fullMsg]);
    }, []);

    const sendMessage = useCallback(async (content: string, isNeural: boolean = false) => {
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
            let response;
            if (isNeural) {
                // Wave 120 Neural Search Integration
                const products = await conciergeService.neuralSearch(content);
                response = {
                    message: products.length > 0 
                        ? `He encontrado estos productos que coinciden con tu intención: "${content}"`
                        : `No encontré coincidencias exactas para "${content}", pero sigo aquí para ayudarte.`,
                    suggestedProducts: products,
                    intent: 'recommendation' as const
                };
            } else {
                const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
                response = await conciergeService.chat(content, history, { ...user, ...profile });
            }

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
            speak(response.message);

            // Cognitive Loyalty: Persist findings if the user is authenticated
            if (user && response.intent === 'recommendation') {
                const hint = content.toLowerCase().includes('vape') ? 'vape' : 
                             content.toLowerCase().includes('herbal') ? 'herbal' : undefined;
                
                const newPrefs = {
                    ...profile?.ai_preferences,
                    visual_theme_hint: hint || profile?.ai_preferences?.visual_theme_hint,
                    interests: [...(profile?.ai_preferences?.interests || []), content].slice(-5)
                };
                
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
            addMessage({ content: 'Lo siento, tuve un problema. ¿Podemos intentar de nuevo?' });
        } finally {
            setIsLoading(false);
        }
    }, [messages, user, profile, playTick, playSuccess, playError, triggerHaptic, addMessage, speak]);

    const sendProactiveMessage = useCallback(async (content: string) => {
        // Only fire if the concierge is NOT already open or user hasn't interacted lately
        if (isOpen) return;
        
        playTick();
        triggerHaptic(5);
        
        const assistantMsg: ConciergeMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content,
            timestamp: new Date(),
            intent: 'recommendation'
        };
        
        setMessages(prev => [...prev, assistantMsg]);
        // We set isOpen to false but maybe add a notification badge or pulse to the trigger
    }, [isOpen, playTick, triggerHaptic]);

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
        sendProactiveMessage,
        toggleOpen
    };
}
