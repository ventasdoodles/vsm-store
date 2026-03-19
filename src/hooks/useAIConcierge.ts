import { useState, useCallback, useRef, useEffect } from 'react';
import { conciergeService, ConciergeMessage } from '@/services';
import { useAuth } from '@/hooks/useAuth';
import { useTacticalUI } from '@/contexts/TacticalContext';

export function useAIConcierge() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ConciergeMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: '¡Hola! Soy Cesarin, tu asistente de VSM. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date()
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [error, setError] = useState<{ message: string, type: 'timeout' | 'quota' | 'generic' } | null>(null);
    const { user, profile } = useAuth();
    const { playClick, playSuccess, playTick, playError, triggerHaptic, speak } = useTacticalUI();

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const welcomeProcessed = useRef(false);

    // Personalize welcome message when profile loads [Wave 153]
    useEffect(() => {
        if (profile?.full_name && !welcomeProcessed.current) {
            const firstName = profile.full_name.split(' ')[0];
            setMessages(prev => prev.map(m => 
                m.id === 'welcome' 
                    ? { ...m, content: `¡Hola ${firstName}! Soy Cesarin, tu asistente de VSM. ¿En qué puedo ayudarte hoy?` } 
                    : m
            ));
            welcomeProcessed.current = true;
        }
    }, [profile]);

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

    const sendMessage = useCallback(async (content: string, _isNeural: boolean = false, audio?: string) => {
        if (!content.trim() && !audio) return;

        setError(null);

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
            let timeoutId: NodeJS.Timeout;
            const timeoutPromise = new Promise<never>((_, reject) => {
                timeoutId = setTimeout(() => reject(new Error('REQUEST_TIMEOUT')), 25000);
            });

            const executeRequest = async () => {
                const history = messages.slice(-5).map(m => ({ role: m.role, content: m.content }));
                return await conciergeService.chat(
                    content, 
                    history, 
                    profile || undefined,
                    audio
                );
            };

            const response = await Promise.race([executeRequest(), timeoutPromise]);
            clearTimeout(timeoutId!);

            const assistantMsg: ConciergeMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message,
                timestamp: new Date(),
                suggestedProducts: response.suggestedProducts,
                intent: response.intent,
                action: response.action,
                capsule_contract: (response as any).capsule_contract
            } as ConciergeMessage & { capsule_contract?: any };

            // CART OPERATOR MIDDLEWARE EXECUTION [Surgical Bridge]
            if (assistantMsg.capsule_contract && assistantMsg.capsule_contract.capsule_name === 'cart_operator') {
                const { executeCartMutation } = await import('@/lib/cart-operator-executor');
                const result = await executeCartMutation(assistantMsg.capsule_contract);
                
                // Map the structured execution string to a natural narrative UX string
                if (result.executed) {
                    assistantMsg.intent = 'search'; 
                    if (result.code === 'ADDED') assistantMsg.content = `He agregado ${result.qty}x ${result.product} a tu carrito.`;
                    else if (result.code === 'REMOVED') assistantMsg.content = `He quitado ${result.product} de tu carrito.`;
                    else if (result.code === 'UPDATED') assistantMsg.content = `He actualizado la cantidad de ${result.product} a ${result.qty}.`;
                } else {
                    assistantMsg.intent = 'info';
                    if (result.code === 'AMBIGUOUS') assistantMsg.content = 'Por favor, indícame más específico el producto o la variante.';
                    else if (result.code === 'UNSAFE') assistantMsg.content = 'No puedo procesar esa cantidad. ¿Cuántas requieres puntualmente?';
                    else if (result.code === 'NOT_FOUND') assistantMsg.content = 'No encontré ese producto en catálogo.';
                    else assistantMsg.content = 'Ocurrió un error al intentar modificar el carrito.';
                }
            }

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
            console.error('[AIConcierge Diag] CATCH BLOCK — raw error:', error);
            console.error('[AIConcierge Diag] CATCH BLOCK — errorMsg:', errorMsg);
            const isQuota = errorMsg.includes('429') || errorMsg.includes('RESOURCE_EXHAUSTED') || errorMsg.includes('quota');
            const isTimeout = errorMsg === 'REQUEST_TIMEOUT';
            
            if (isTimeout) {
                setError({ type: 'timeout', message: 'La respuesta tardó demasiado. Intenta nuevamente.' });
            } else if (isQuota) {
                setError({ type: 'quota', message: 'Estoy recibiendo muchas solicitudes en este momento. Intenta de nuevo en un momento.' });
            } else {
                setError({ type: 'generic', message: 'Hubo un problema al responder. Intenta nuevamente.' });
            }
        } finally {
            setIsLoading(false);
        }
    }, [messages, user, profile, playTick, playSuccess, playError, triggerHaptic, addMessage, speak]);

    const retryLastMessage = useCallback(() => {
        setMessages(prev => {
            const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.role === 'user') {
                const content = lastMsg.content;
                newMessages.pop();
                setTimeout(() => sendMessage(content), 0);
            }
            return newMessages;
        });
    }, [sendMessage]);

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
        error,
        toggleOpen,
        sendMessage,
        sendProactiveMessage,
        retryLastMessage,
        startRecording,
        stopRecording
    };
}
