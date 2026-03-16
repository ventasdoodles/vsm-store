import { useState, useCallback, useRef } from 'react';
import { conciergeService, ConciergeMessage } from '@/services';
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
    const [isListening, setIsListening] = useState(false);
    const { user, profile } = useAuth();
    const { playClick, playSuccess, playTick, playError, triggerHaptic, speak } = useTacticalUI();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

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

    const sendMessage = useCallback(async (content: string, isNeural: boolean = false, audio?: string) => {
        if (!content.trim() && !audio) return;

        const userMsg: ConciergeMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: content || '🎤 Mensaje de voz',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);
        playTick();
        triggerHaptic(10);

        try {
            let response;
            if (isNeural && !audio) {
                // Wave 120 Neural Search Integration (Text only)
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
                response = await conciergeService.chat(
                    content, 
                    history, 
                    profile || undefined,
                    audio
                );
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
        } catch (error: unknown) {
            playError();
            triggerHaptic(80);
            
            const errorMsg = error instanceof Error ? error.message : String(error);
            const isQuota = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED');
            
            addMessage({ 
                content: isQuota 
                    ? 'Lo siento, he alcanzado mi límite de procesamiento por ahora. Por favor, intenta de nuevo en un momento.' 
                    : 'Lo siento, tuve un problema al procesar tu solicitud. ¿Podemos intentar de nuevo?' 
            });
        } finally {
            setIsLoading(false);
        }
    }, [messages, user, profile, playTick, playSuccess, playError, triggerHaptic, addMessage, speak]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    const base64 = (reader.result as string).split(',')[1];
                    void sendMessage('', false, base64);
                };
                stream.getTracks().forEach(t => t.stop());
            };

            mediaRecorder.start();
            setIsListening(true);
            playTick();
        } catch (err) {
            console.error('[Concierge] Voice Error:', err);
            playError();
            addMessage({ content: 'No pude acceder al micrófono. Por favor, revisa tus permisos.' });
        }
    }, [sendMessage, playTick, playError, addMessage]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
            playClick();
        }
    }, [playClick]);

    const sendProactiveMessage = useCallback(async (content: string) => {
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
        isListening,
        sendMessage,
        sendProactiveMessage,
        toggleOpen,
        startRecording,
        stopRecording
    };
}
