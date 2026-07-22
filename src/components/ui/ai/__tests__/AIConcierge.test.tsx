import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIConcierge } from '../AIConcierge';
import * as cesarinTextUtils from '@/lib/cesarin-text-utils';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';

const handleRecoverySelectionMock = vi.fn();
const sendMessageMock = vi.fn();
const sendProactiveMessageMock = vi.fn();
const toggleOpenMock = vi.fn();
const retryLastMessageMock = vi.fn();
const startRecordingMock = vi.fn();
const stopRecordingMock = vi.fn();
const navigateMock = vi.fn();
const getProductsByIdsMock = vi.fn();
const useAIConciergeMock = vi.fn();
const windowOpenMock = vi.fn();
const addItemMock = vi.fn();
const openCartMock = vi.fn();
const notifySuccessMock = vi.fn();
const notifyErrorMock = vi.fn();
const emitConversationConversionEventMock = vi.fn();

const cartStoreState: {
    items: CartItem[];
    addItem: typeof addItemMock;
    openCart: typeof openCartMock;
} = {
    items: [],
    addItem: addItemMock,
    openCart: openCartMock,
};


vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual<typeof import('@tanstack/react-router')>('@tanstack/react-router');
    return {
        ...actual,
        useLocation: () => ({ pathname: '/vape/waka-somatch-menta' }),
        useNavigate: () => navigateMock,
    };
});

vi.mock('@/hooks/useAIConcierge', () => ({
    useAIConcierge: () => useAIConciergeMock(),
}));

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: () => <div>image</div>,
}));

vi.mock('@/stores/cart.store', () => ({
    useCartStore: Object.assign(
        (selector: (state: typeof cartStoreState) => unknown) => selector(cartStoreState),
        {
            getState: () => cartStoreState,
        },
    ),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: notifySuccessMock,
        error: notifyErrorMock,
    }),
}));

vi.mock('@/lib/conversion-measurement', () => ({
    emitConversationConversionEvent: (...args: unknown[]) => emitConversationConversionEventMock(...args),
}));

vi.mock('@/services/products.service', () => ({
    getProductsByIds: (...args: unknown[]) => (getProductsByIdsMock as any)(args[0]),
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'prod-1',
        name: 'Mint Fresh',
        slug: 'mint-fresh',
        description: null,
        short_description: null,
        price: 299,
        compare_at_price: null,
        stock: 4,
        sku: null,
        section: 'vape',
        category_id: 'category-1',
        tags: [],
        status: 'active',
        images: [],
        cover_image: null,
        is_featured: false,
        is_featured_until: null,
        is_new: false,
        is_new_until: null,
        is_bestseller: false,
        is_bestseller_until: null,
        is_active: true,
        created_at: '2026-04-17T00:00:00.000Z',
        updated_at: '2026-04-17T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        ...overrides,
    };
}

describe('AIConcierge Stage 1 storefront recovery controls', () => {
    beforeEach(() => {
        handleRecoverySelectionMock.mockReset();
        sendMessageMock.mockReset();
        sendProactiveMessageMock.mockReset();
        toggleOpenMock.mockReset();
        retryLastMessageMock.mockReset();
        startRecordingMock.mockReset();
        stopRecordingMock.mockReset();
        navigateMock.mockReset();
        getProductsByIdsMock.mockReset();
        windowOpenMock.mockReset();
        addItemMock.mockReset();
        openCartMock.mockReset();
        notifySuccessMock.mockReset();
        notifyErrorMock.mockReset();
        emitConversationConversionEventMock.mockReset();
        cartStoreState.items = [];
        addItemMock.mockImplementation((product: Product, quantity = 1, variant: { id: string; name: string } | null = null) => {
            const existing = cartStoreState.items.find(
                (item) => item.product.id === product.id && (item.variant_id ?? null) === (variant?.id ?? null),
            );
            if (existing) {
                existing.quantity += quantity;
                return;
            }
            cartStoreState.items.push({
                product,
                quantity,
                variant_id: variant?.id ?? null,
                variant_name: variant?.name ?? null,
            });
        });
        openCartMock.mockImplementation(() => undefined);
        Object.defineProperty(window, 'open', {
            configurable: true,
            writable: true,
            value: windowOpenMock,
        });
        useAIConciergeMock.mockReturnValue({
            isOpen: true,
            isLoading: false,
            isSlowResponse: false,
            isListening: false,
            error: null,
            activeRecovery: {
                messageId: 'assistant-1',
            },
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Te dejo unas cercanas.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape', price: 299 },
                        { id: 'prod-2', name: 'Waka Somatch Mango', slug: 'waka-somatch-mango', section: 'vape', price: 299 },
                    ],
                    capsule_contract: {
                        match_strategy: 'SEMANTIC',
                        next_step_view: {
                            family: 'REVIEW_ONE',
                            guidance: 'De aqui, yo revisaria primero Waka Somatch Menta para ver si ya te cierra bien.',
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Waka Somatch Menta',
                                product: {
                                    id: 'prod-1',
                                    name: 'Waka Somatch Menta',
                                    slug: 'waka-somatch-menta',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });
    });

    it('shows the default loading copy before the slow-response threshold', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: true,
            isSlowResponse: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
            cesarinSessionId: 'session-loading-default',
        });

        render(<AIConcierge />);

        expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
        expect(screen.queryByText('Sigo pensando...')).not.toBeInTheDocument();
    });

    it('renders user, older assistant, and latest assistant text deterministically in tests', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isSlowResponse: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-old',
                    role: 'assistant',
                    content: 'Respuesta anterior completa.',
                    timestamp: new Date(),
                },
                {
                    id: 'user-1',
                    role: 'user',
                    content: 'Quiero revisar sabores.',
                    timestamp: new Date(),
                },
                {
                    id: 'assistant-latest',
                    role: 'assistant',
                    content: 'Respuesta nueva completa.',
                    timestamp: new Date(),
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Respuesta anterior completa.')).toBeInTheDocument();
        expect(screen.getByText('Quiero revisar sabores.')).toBeInTheDocument();
        expect(screen.getByText('Respuesta nueva completa.')).toBeInTheDocument();
    });

    it('does not expose the no-write smoke audit surface during normal browsing', () => {
        render(<AIConcierge />);

        expect(screen.queryByTestId('ci-no-write-smoke-audit')).not.toBeInTheDocument();
        expect(screen.queryByText('No-write smoke audit')).not.toBeInTheDocument();
    });

    it('renders only sanitized no-write smoke audit metadata when present', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isSlowResponse: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-smoke-1',
                    role: 'assistant',
                    content: 'Puedes pagar por transferencia o deposito bancario.',
                    timestamp: new Date(),
                    intent: 'info',
                    capsule_contract: {
                        capsule_name: 'knowledge_rag_foundation',
                        no_write_smoke_audit: {
                            prompt_category: 'payment_method',
                            prompt_label: '¿Aceptan tarjeta o cómo puedo pagar?',
                            status: 'ok',
                            metadata_present: true,
                            contract: 'customer_intelligence_no_write_v1',
                            suppressed_writes: ['ai_customer_memory', 'ai_analytics'],
                            suppressed_calls: ['cesarin-qa-judge'],
                            capsule_name: 'knowledge_rag_foundation',
                            knowledge_answer_present: true,
                            main_message_present: true,
                            match_strategy: 'HIGH_CONFIDENCE_POLICY_MATCH',
                            resolved_chunk_count: 2,
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
            cesarinSessionId: 'session-smoke-audit',
        });

        render(<AIConcierge />);

        const audit = screen.getByTestId('ci-no-write-smoke-audit');
        expect(audit).toHaveTextContent('No-write smoke audit');
        expect(audit).toHaveTextContent('prompt: payment_method');
        expect(audit).toHaveTextContent('status: ok');
        expect(audit).toHaveTextContent('contract: customer_intelligence_no_write_v1');
        expect(audit).toHaveTextContent('writes: ai_customer_memory, ai_analytics');
        expect(audit).toHaveTextContent('calls: cesarin-qa-judge');
        expect(audit).toHaveTextContent('capsule: knowledge_rag_foundation');
        expect(audit).toHaveTextContent('chunks: 2');
        expect(audit).not.toHaveTextContent('access_token');
        expect(audit).not.toHaveTextContent('refresh_token');
        expect(audit).not.toHaveTextContent('Authorization');
        expect(audit).not.toHaveTextContent('cookie');
        expect(audit).not.toHaveTextContent('apikey');
    });

    it('switches the loading copy once the hook reports a slow response', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: true,
            isSlowResponse: true,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
            cesarinSessionId: 'session-loading-slow',
        });

        render(<AIConcierge />);

        expect(screen.getByText('Sigo pensando...')).toBeInTheDocument();
        expect(screen.queryByText('Analizando...')).not.toBeInTheDocument();
    });

    it('renders the collaborative recovery controls on approximate suggestion turns', () => {
        render(<AIConcierge />);

        expect(screen.getByText('Afinemos esto')).toBeInTheDocument();
        expect(screen.getByText('Esta se parece mas: Waka Somatch Menta')).toBeInTheDocument();
        expect(screen.getByText('Ninguna')).toBeInTheDocument();
    });

    it('delegates the selected recovery signal back to the hook', () => {
        render(<AIConcierge />);

        fireEvent.click(screen.getByText('Esta se parece mas: Waka Somatch Menta'));
        fireEvent.click(screen.getByText('Ninguna'));

        expect(handleRecoverySelectionMock).toHaveBeenCalledWith('closest', 'prod-1');
        expect(handleRecoverySelectionMock).toHaveBeenCalledWith('none');
    });

    it('renders and executes the next-step storefront action when provided', () => {
        render(<AIConcierge />);

        expect(screen.getByText('Ayuda de producto')).toBeInTheDocument();
        expect(screen.getByText('Siguiente paso')).toBeInTheDocument();
        expect(screen.getAllByText('Revisa primero').length).toBeGreaterThanOrEqual(1);
        fireEvent.click(screen.getByText('Revisar Waka Somatch Menta'));

        expect(navigateMock).toHaveBeenCalledWith('/vape/waka-somatch-menta');
    });

    it('renders the existing link CTA surface and opens the eligible route handoff', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-cta',
                    role: 'assistant',
                    content: 'Tu pedido sigue con pago pendiente.',
                    timestamp: new Date(),
                    action: {
                        label: 'Continuar pago pendiente',
                        url: '/payment/pending?order_id=order-321',
                        type: 'link',
                    },
                    catalog_gate: {
                        is_open: false,
                        reason: 'non_catalog_lane',
                        primary_intent: 'ORDER_TRACKING',
                        explicit_product_request: false,
                        search_leading: false,
                        needs_clarification: false,
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
            cesarinSessionId: 'session-link-1',
        });

        render(<AIConcierge />);

        expect(screen.getByText('Paso accionable')).toBeInTheDocument();
        expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
            sessionId: 'session-link-1',
            eventType: 'ai_cta_rendered',
            metadata: {
                message_id: 'assistant-cta',
                cta_kind: 'LINK',
                label: 'Continuar pago pendiente',
                product_id: null,
                order_id: 'order-321',
            },
        });

        fireEvent.click(screen.getByText('Continuar pago pendiente'));

        expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
            sessionId: 'session-link-1',
            eventType: 'ai_cta_clicked',
            metadata: {
                message_id: 'assistant-cta',
                cta_kind: 'LINK',
                label: 'Continuar pago pendiente',
                product_id: null,
                order_id: 'order-321',
                source: 'cesarin',
            },
        });
        expect(windowOpenMock).toHaveBeenCalledWith('/payment/pending?order_id=order-321', '_blank');
    });

    it('renders knowledge capsule resolved chunks as customer-visible policy content', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-knowledge-1',
                    role: 'assistant',
                    content: 'Lo mas relevante que encontre en nuestros manuales: Politica de envio DHL. El envio por DHL se cotiza antes de confirmar el pedido y se comparte con el cliente.',
                    timestamp: new Date(),
                    suggestedProducts: [],
                    capsule_contract: {
                        capsule_name: 'knowledge_rag_foundation',
                        match_strategy: 'MODERATE_CONFIDENCE_MULTI_SOURCE',
                        resolved_chunks: [
                            {
                                id: 'chunk-shipping-1',
                                source_id: 'politica-envios-detallada-v1',
                                title: 'Politica de envio DHL',
                                category: 'shipping',
                                content: 'El envio por DHL se cotiza antes de confirmar el pedido y se comparte con el cliente.',
                                similarity: 0.7278,
                            },
                            {
                                id: 'chunk-payments-1',
                                source_id: 'politica-pagos-v2',
                                title: 'Metodos de pago aceptados',
                                category: 'payments',
                                content: 'Se aceptan transferencia bancaria y deposito; el pedido avanza cuando se confirma el pago.',
                                similarity: 0.7289,
                            },
                            {
                                id: 'chunk-onboarding-1',
                                source_id: 'guia-onboarding-v1',
                                title: 'Como hacer un pedido',
                                category: 'onboarding',
                                content: 'Para comprar, el cliente elige producto, confirma disponibilidad y recibe instrucciones de pago.',
                                similarity: 0.7349,
                            },
                            {
                                id: 'chunk-xalapa-1',
                                source_id: 'info-ubicacion-xalapa-v1',
                                title: 'Atencion en Xalapa',
                                category: 'policies',
                                content: 'La tienda opera en linea y no maneja showroom publico ni entregas personales abiertas.',
                                similarity: 0.7728,
                            },
                            {
                                id: 'chunk-vape-basics-1',
                                source_id: 'guia-dejar-fumar-v1',
                                title: 'Guia inicial de nicotina',
                                category: 'vape_basics',
                                content: 'La eleccion de nicotina depende del consumo previo y la tolerancia de quien empieza.',
                                similarity: 0.7906,
                            },
                        ],
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText(/Lo mas relevante que encontre en nuestros manuales/)).toBeInTheDocument();
        expect(screen.getAllByText(/El envio por DHL se cotiza antes de confirmar el pedido/).length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Manual y Guias')).toBeInTheDocument();
        expect(screen.getByText('Politica de envio DHL')).toBeInTheDocument();
        expect(screen.getByText('shipping')).toBeInTheDocument();
        expect(screen.getByText('Metodos de pago aceptados')).toBeInTheDocument();
        expect(screen.getByText(/Se aceptan transferencia bancaria y deposito/)).toBeInTheDocument();
        expect(screen.getByText('Como hacer un pedido')).toBeInTheDocument();
        expect(screen.getByText('Atencion en Xalapa')).toBeInTheDocument();
        expect(screen.getByText('Guia inicial de nicotina')).toBeInTheDocument();
    });

    it('suppresses product recovery surfaces when the current turn is not search-first', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: {
                messageId: 'assistant-1',
            },
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Primero te aclaro el envio.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape', price: 299 },
                    ],
                    capsule_contract: {
                        match_strategy: 'SEMANTIC',
                        turn_analysis: {
                            primary_intent: 'POLICY_INQUIRY',
                            secondary_intents: ['PRODUCT_SEARCH'],
                            turn_priority: 'mixed',
                            current_turn_decision: 'ANSWER_POLICY_FIRST',
                        },
                        next_step_view: {
                            family: 'REVIEW_ONE',
                            guidance: 'Primero aclaro esto y luego vemos el producto.',
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Abrir Waka Somatch Menta',
                                product: {
                                    id: 'prod-1',
                                    name: 'Waka Somatch Menta',
                                    slug: 'waka-somatch-menta',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Primero te aclaro el envio.')).toBeInTheDocument();
        expect(screen.queryByText('Afinemos esto')).not.toBeInTheDocument();
        expect(screen.queryByText('Siguiente paso')).not.toBeInTheDocument();
        expect(screen.queryByText('Waka Somatch Menta')).not.toBeInTheDocument();
    });

    it('hides stale product surfaces when a later assistant turn closes the catalog gate', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: {
                messageId: 'assistant-2',
            },
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Te dejo unas cercanas.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Waka Somatch Menta', slug: 'waka-somatch-menta', section: 'vape', price: 299 },
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        match_strategy: 'SEMANTIC',
                        next_step_view: {
                            family: 'REVIEW_ONE',
                            guidance: 'De aqui, yo revisaria primero Waka Somatch Menta para ver si ya te cierra bien.',
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Waka Somatch Menta',
                                product: {
                                    id: 'prod-1',
                                    name: 'Waka Somatch Menta',
                                    slug: 'waka-somatch-menta',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
                {
                    id: 'assistant-2',
                    role: 'assistant',
                    content: 'Primero te aclaro el envio.',
                    timestamp: new Date(),
                    catalog_gate: {
                        is_open: false,
                        reason: 'non_catalog_lane',
                        primary_intent: 'POLICY_INQUIRY',
                        explicit_product_request: false,
                        search_leading: false,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        match_strategy: 'SEMANTIC',
                        turn_analysis: {
                            primary_intent: 'POLICY_INQUIRY',
                            secondary_intents: ['PRODUCT_SEARCH'],
                            turn_priority: 'mixed',
                            current_turn_decision: 'ANSWER_POLICY_FIRST',
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Primero te aclaro el envio.')).toBeInTheDocument();
        expect(screen.queryByText('Afinemos esto')).not.toBeInTheDocument();
        expect(screen.queryByText('Siguiente paso')).not.toBeInTheDocument();
        expect(screen.queryByText('Waka Somatch Menta')).not.toBeInTheDocument();
    });

    it('does not repeat the same next-step guidance when the assistant message already said it', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Primero revisaria Mint Fresh.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        makeProduct(),
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        match_strategy: 'TOKEN_RECOVERY',
                        next_step_view: {
                            family: 'REVIEW_ONE',
                            guidance: 'Primero revisaria Mint Fresh.',
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Siguiente paso')).toBeInTheDocument();
        expect(screen.getAllByText('Primero revisaria Mint Fresh.')).toHaveLength(1);
        expect(screen.getByText('Revisar Mint Fresh')).toBeInTheDocument();
    });

    it('lets a resolved concrete product answer stop without rendering secondary next-step surfaces', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Mint Fresh trae 6000 caladas.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        makeProduct(),
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        match_strategy: 'EXACT',
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Mint Fresh trae 6000 caladas.')).toBeInTheDocument();
        expect(screen.getByText('Ayuda de producto')).toBeInTheDocument();
        expect(screen.queryByText('Siguiente paso')).not.toBeInTheDocument();
        expect(screen.queryByText('Revisa primero')).not.toBeInTheDocument();
        expect(screen.queryByText('Es la ruta mas clara')).not.toBeInTheDocument();
    });

    it('renders grounded capsule copy beside matching product cards without weaker uncertainty text', () => {
        const groundedCopy = 'Te rescate dos rutas reales con perfil fresco. La primera coincide con menta y stock real.';

        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-grounded',
                    role: 'assistant',
                    content: groundedCopy,
                    timestamp: new Date(),
                    suggestedProducts: [
                        makeProduct({
                            id: 'salt-mint',
                            name: 'Nic Salt Sandia Mint 30ml 35mg',
                            slug: 'nicsalt-sandia-mint-30ml-35mg',
                            price: 260,
                            stock: 33,
                        }),
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        capsule_name: 'product_search_integrity',
                        match_strategy: 'FEATURED_FALLBACK',
                        customer_response_draft: groundedCopy,
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText(groundedCopy)).toBeInTheDocument();
        expect(screen.getByText('Nic Salt Sandia Mint 30ml 35mg')).toBeInTheDocument();
        expect(screen.queryByText(/no la tengo clara|no encuentro referencia|seguir explorando/i)).not.toBeInTheDocument();
    });

    it('renders compact public source context without reopening product surfaces on PUBLIC_INFO turns', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Segun contexto publico, ese lanzamiento si aparece anunciado.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Should Stay Hidden', slug: 'should-stay-hidden', section: 'vape', price: 299 },
                    ],
                    catalog_gate: {
                        is_open: false,
                        reason: 'non_catalog_lane',
                        primary_intent: 'PUBLIC_INFO',
                        explicit_product_request: false,
                        search_leading: false,
                        needs_clarification: false,
                    },
                    source_context: {
                        label: 'Contexto publico',
                        sources: [
                            { title: 'Marca oficial', url: 'https://example.com/oficial' },
                        ],
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Contexto publico')).toBeInTheDocument();
        expect(screen.getByText('Marca oficial')).toBeInTheDocument();
        expect(screen.queryByText('Las dos traen buen caso')).not.toBeInTheDocument();
        expect(screen.queryByText('Ya viene bien amarrado')).not.toBeInTheDocument();
        expect(screen.queryByText('Afinemos esto')).not.toBeInTheDocument();
        expect(screen.queryByText('Siguiente paso')).not.toBeInTheDocument();
        expect(screen.queryByText('Should Stay Hidden')).not.toBeInTheDocument();
    });

    it('does not render public source context on ordinary non-web turns', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Claro, te confirmo el envio.',
                    timestamp: new Date(),
                    catalog_gate: {
                        is_open: false,
                        reason: 'non_catalog_lane',
                        primary_intent: 'POLICY_INQUIRY',
                        explicit_product_request: false,
                        search_leading: false,
                        needs_clarification: false,
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Claro, te confirmo el envio.')).toBeInTheDocument();
        expect(screen.getByText('Guia directa')).toBeInTheDocument();
        expect(screen.queryByText('Contexto publico')).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: 'Marca oficial' })).not.toBeInTheDocument();
    });

    it('uses the shared distinctness utility before rendering next-step guidance', () => {
        const distinctSpy = vi.spyOn(cesarinTextUtils, 'isMeaningfullyDistinct').mockReturnValue(false);

        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Te diria que revises Mint Fresh.',
                    timestamp: new Date(),
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Mint Fresh', slug: 'mint-fresh', section: 'vape', price: 299 },
                    ],
                    capsule_contract: {
                        next_step_view: {
                            family: 'REVIEW_ONE',
                            guidance: 'Te diria que revises Mint Fresh.',
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(distinctSpy).toHaveBeenCalledWith(
            'Te diria que revises Mint Fresh.',
            'Te diria que revises Mint Fresh.',
        );
        expect(screen.getAllByText('Te diria que revises Mint Fresh.')).toHaveLength(1);

        distinctSpy.mockRestore();
    });

    it('marks actionable help without turning it into a product lane', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Te paso el canal directo para cerrarlo contigo.',
                    timestamp: new Date(),
                    intent: 'whatsapp',
                    action: {
                        label: 'Seguir por WhatsApp',
                        url: 'https://wa.me/521234567890',
                        type: 'whatsapp',
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Paso accionable')).toBeInTheDocument();
        expect(screen.getByText('Seguir por WhatsApp')).toBeInTheDocument();
        expect(screen.queryByText('Ayuda de producto')).not.toBeInTheDocument();
    });

    it('marks add-ready product turns as actionable help without hiding the gated next step', () => {
        const fullProduct = makeProduct();
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Ese ya viene bastante claro.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        fullProduct,
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        next_step_view: {
                            family: 'ADD_READY',
                            guidance: 'Ya esta bastante claro por Mint Fresh; si ya te cerro, agregarlo es el paso natural.',
                            primaryAction: {
                                kind: 'ADD_TO_CART',
                                label: 'Agregar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Paso accionable')).toBeInTheDocument();
        expect(screen.getByText('Listo para avanzar')).toBeInTheDocument();
        expect(screen.getByText('Ya esta bastante claro por Mint Fresh; si ya te cerro, agregarlo es el paso natural.')).toBeInTheDocument();
        expect(screen.queryByText('Ya viene bien amarrado')).not.toBeInTheDocument();
        expect(screen.getByText('Agregar Mint Fresh')).toBeInTheDocument();
        expect(screen.queryByText('Ayuda de producto')).not.toBeInTheDocument();
    });

    it('shows compare-worthy product help as an intentional compare posture', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Traes dos opciones bien paradas.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Mint Fresh', slug: 'mint-fresh', section: 'vape', price: 299 },
                        { id: 'prod-2', name: 'Berry Chill', slug: 'berry-chill', section: 'vape', price: 299 },
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        next_step_view: {
                            family: 'COMPARE_TWO',
                            guidance: 'Mint Fresh y Berry Chill son los dos que mas sentido traen; yo compararia esos antes de decidir.',
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                            secondaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Berry Chill',
                                product: {
                                    id: 'prod-2',
                                    name: 'Berry Chill',
                                    slug: 'berry-chill',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Ayuda de producto')).toBeInTheDocument();
        expect(screen.getByText('Compara estas dos')).toBeInTheDocument();
        expect(screen.getByText('Mint Fresh y Berry Chill son los dos que mas sentido traen; yo compararia esos antes de decidir.')).toBeInTheDocument();
        expect(screen.queryByText('Las dos traen buen caso')).not.toBeInTheDocument();
        expect(screen.queryByText('Paso accionable')).not.toBeInTheDocument();
    });

    it('renders selector-needed without generic trust-note or family-chip scaffolding', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Waka Pod se ve bien.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Waka Pod', slug: 'waka-pod', section: 'vape', price: 299 },
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        next_step_view: {
                            family: 'SELECTOR_NEEDED',
                            guidance: 'Waka Pod se ve bien; solo faltaria elegir sabor.',
                            missingSelector: 'sabor',
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Waka Pod',
                                product: {
                                    id: 'prod-1',
                                    name: 'Waka Pod',
                                    slug: 'waka-pod',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Ayuda de producto')).toBeInTheDocument();
        expect(screen.getByText('Siguiente paso')).toBeInTheDocument();
        expect(screen.getByText('Waka Pod se ve bien; solo faltaria elegir sabor.')).toBeInTheDocument();
        expect(screen.getByText('Revisar Waka Pod')).toBeInTheDocument();
        expect(screen.queryByText('Falta elegir')).not.toBeInTheDocument();
        expect(screen.queryByText('Ya va bien encaminado')).not.toBeInTheDocument();
    });

    it('shows weak review-first support as prudent rather than action-ready', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Puede ir por ahi.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Mint Fresh', slug: 'mint-fresh', section: 'vape', price: 299 },
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        match_strategy: 'SEMANTIC',
                        next_step_view: {
                            family: 'REVIEW_ONE',
                            guidance: 'Mint Fresh pinta mejor por ahora; yo lo revisaria primero y si no te convence, le damos otra vuelta.',
                            assistAction: {
                                label: 'Seguimos viendo',
                                message: 'Seguimos viendo',
                            },
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Ayuda de producto')).toBeInTheDocument();
        expect(screen.getByText('Revisa primero')).toBeInTheDocument();
        expect(screen.getByText('Mint Fresh pinta mejor por ahora; yo lo revisaria primero y si no te convence, le damos otra vuelta.')).toBeInTheDocument();
        expect(screen.queryByText('Es la mejor pista por ahora')).not.toBeInTheDocument();
        expect(screen.getByText('Seguimos viendo')).toBeInTheDocument();
        expect(screen.queryByText('Paso accionable')).not.toBeInTheDocument();
    });

    it('uses the shared normalization utility when deriving review-first trust notes', () => {
        const normalizeSpy = vi
            .spyOn(cesarinTextUtils, 'normalizeCompactText')
            .mockImplementation((value: string) => (value.includes('Mint Fresh') ? 'mint fresh por ahora' : value));

        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Puede ir por ahi.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Mint Fresh', slug: 'mint-fresh', section: 'vape', price: 299 },
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        match_strategy: 'SEMANTIC',
                        next_step_view: {
                            family: 'REVIEW_ONE',
                            guidance: 'Mint Fresh se ve como buena opcion para revisar.',
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(normalizeSpy).toHaveBeenCalledWith('Mint Fresh se ve como buena opcion para revisar.');
        expect(screen.getByText('Mint Fresh se ve como buena opcion para revisar.')).toBeInTheDocument();
        expect(screen.queryByText('Es la mejor pista por ahora')).not.toBeInTheDocument();

        normalizeSpy.mockRestore();
    });

    it('lets weak review-first turns re-open the conversation without inventing a product action', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Puede ir por ahi.',
                    timestamp: new Date(),
                    suggestedProducts: [
                        { id: 'prod-1', name: 'Mint Fresh', slug: 'mint-fresh', section: 'vape', price: 299 },
                    ],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        match_strategy: 'SEMANTIC',
                        next_step_view: {
                            family: 'REVIEW_ONE',
                            guidance: 'Mint Fresh pinta mejor por ahora; yo lo revisaria primero y si no te convence, le damos otra vuelta.',
                            assistAction: {
                                label: 'Seguimos viendo',
                                message: 'Seguimos viendo',
                            },
                            primaryAction: {
                                kind: 'OPEN_PDP',
                                label: 'Revisar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        fireEvent.click(screen.getByText('Seguimos viendo'));

        expect(sendMessageMock).toHaveBeenCalledWith('Seguimos viendo');
        expect(screen.queryByText('Paso accionable')).not.toBeInTheDocument();
    });

    it('executes an eligible add-to-cart CTA through the existing cart store without checkout or payment drift', async () => {
        const fullProduct = makeProduct({ stock: 3 });
        getProductsByIdsMock.mockResolvedValue([fullProduct]);
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Ese ya viene bastante claro.',
                    timestamp: new Date(),
                    suggestedProducts: [fullProduct],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        next_step_view: {
                            family: 'ADD_READY',
                            guidance: 'Ya esta bastante claro por Mint Fresh; si ya te cerro, agregarlo es el paso natural.',
                            primaryAction: {
                                kind: 'ADD_TO_CART',
                                label: 'Agregar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
            cesarinSessionId: 'session-cart-1',
        });

        render(<AIConcierge />);

        expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
            sessionId: 'session-cart-1',
            eventType: 'ai_cta_rendered',
            metadata: {
                message_id: 'assistant-1',
                cta_kind: 'ADD_TO_CART',
                label: 'Agregar Mint Fresh',
                product_id: 'prod-1',
                order_id: null,
            },
        });

        fireEvent.click(screen.getByText('Agregar Mint Fresh'));

        expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
            sessionId: 'session-cart-1',
            eventType: 'ai_cta_clicked',
            metadata: {
                message_id: 'assistant-1',
                cta_kind: 'ADD_TO_CART',
                label: 'Agregar Mint Fresh',
                product_id: 'prod-1',
                order_id: null,
                source: 'cesarin',
            },
        });
        await waitFor(() => {
            expect(addItemMock).toHaveBeenCalledWith(fullProduct, 1, null, expect.objectContaining({
                source: 'cesarin',
                sessionId: 'session-cart-1',
            }));
        });
        expect(screen.getByText('Agregue 1 de Mint Fresh al carrito.')).toBeInTheDocument();
        expect(notifySuccessMock).toHaveBeenCalledWith('Agregado', 'Agregue 1 de Mint Fresh al carrito.');
        expect(navigateMock).not.toHaveBeenCalledWith('/checkout');
        expect(windowOpenMock).not.toHaveBeenCalled();
    });

    it('keeps a variant product advisory until the variant is grounded', () => {
        const variantProduct = makeProduct({
            variants: [
                {
                    id: 'variant-menta',
                    product_id: 'prod-1',
                    sku: null,
                    price: null,
                    stock: 2,
                    images: [],
                    is_active: true,
                    options: [],
                },
            ],
        });
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Waka Pod se ve bien.',
                    timestamp: new Date(),
                    suggestedProducts: [variantProduct],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        next_step_view: {
                            family: 'ADD_READY',
                            guidance: 'Solo falta elegir opcion.',
                            primaryAction: {
                                kind: 'ADD_TO_CART',
                                label: 'Agregar Waka Pod',
                                product: {
                                    id: 'prod-1',
                                    name: 'Waka Pod',
                                    slug: 'waka-pod',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        expect(screen.getByText('Elegir opcion de Waka Pod')).toBeInTheDocument();
        expect(screen.queryByText('Agregar Waka Pod')).not.toBeInTheDocument();

        fireEvent.click(screen.getByText('Elegir opcion de Waka Pod'));

        expect(addItemMock).not.toHaveBeenCalled();
        expect(navigateMock).toHaveBeenCalledWith('/vape/waka-pod');
    });

    it('adds a grounded variant through the existing cart store', async () => {
        const variantProduct = makeProduct({
            variants: [
                {
                    id: 'variant-menta',
                    product_id: 'prod-1',
                    sku: null,
                    price: null,
                    stock: 2,
                    images: [],
                    is_active: true,
                    options: [],
                },
            ],
        });
        getProductsByIdsMock.mockResolvedValue([variantProduct]);
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'La variante menta esta lista.',
                    timestamp: new Date(),
                    suggestedProducts: [variantProduct],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        next_step_view: {
                            family: 'ADD_READY',
                            guidance: 'La variante menta esta lista para carrito.',
                            primaryAction: {
                                kind: 'ADD_TO_CART',
                                label: 'Agregar Waka Pod Menta',
                                product: {
                                    id: 'prod-1',
                                    name: 'Waka Pod',
                                    slug: 'waka-pod',
                                    section: 'vape',
                                },
                                variantToken: {
                                    id: 'variant-menta',
                                    name: 'Menta',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        fireEvent.click(screen.getByText('Agregar Waka Pod Menta'));

        await waitFor(() => {
            expect(addItemMock).toHaveBeenCalledWith(
                variantProduct,
                1,
                { id: 'variant-menta', name: 'Menta' },
                expect.objectContaining({ source: 'cesarin' }),
            );
        });
        expect(screen.getByText('Agregue 1 de Waka Pod al carrito.')).toBeInTheDocument();
    });

    it('does not claim success when the cart store leaves the cart unchanged', async () => {
        const fullProduct = makeProduct({ stock: 1 });
        getProductsByIdsMock.mockResolvedValue([fullProduct]);
        addItemMock.mockImplementation(() => undefined);
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Ese ya viene bastante claro.',
                    timestamp: new Date(),
                    suggestedProducts: [fullProduct],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        next_step_view: {
                            family: 'ADD_READY',
                            guidance: 'Ya esta bastante claro.',
                            primaryAction: {
                                kind: 'ADD_TO_CART',
                                label: 'Agregar Mint Fresh',
                                product: {
                                    id: 'prod-1',
                                    name: 'Mint Fresh',
                                    slug: 'mint-fresh',
                                    section: 'vape',
                                },
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
        });

        render(<AIConcierge />);

        fireEvent.click(screen.getByText('Agregar Mint Fresh'));

        await waitFor(() => {
            expect(notifyErrorMock).toHaveBeenCalledWith('No agregado', 'Mint Fresh no se agrego; el carrito no cambio.');
        });
        expect(screen.getByText('Mint Fresh no se agrego; el carrito no cambio.')).toBeInTheDocument();
        expect(notifySuccessMock).not.toHaveBeenCalled();
    });

    it('opens the cart from OPEN_CART without routing to checkout or payment', () => {
        useAIConciergeMock.mockReturnValueOnce({
            isOpen: true,
            isLoading: false,
            isListening: false,
            error: null,
            activeRecovery: null,
            messages: [
                {
                    id: 'assistant-1',
                    role: 'assistant',
                    content: 'Ya lo tienes en carrito.',
                    timestamp: new Date(),
                    suggestedProducts: [],
                    catalog_gate: {
                        is_open: true,
                        reason: 'search_leading',
                        primary_intent: 'PRODUCT_SEARCH',
                        explicit_product_request: true,
                        search_leading: true,
                        needs_clarification: false,
                    },
                    capsule_contract: {
                        next_step_view: {
                            family: 'ADD_READY',
                            guidance: 'Puedes revisar el carrito cuando quieras.',
                            primaryAction: {
                                kind: 'OPEN_CART',
                                label: 'Abrir carrito',
                            },
                        },
                    },
                },
            ],
            sendMessage: sendMessageMock,
            handleRecoverySelection: handleRecoverySelectionMock,
            sendProactiveMessage: sendProactiveMessageMock,
            toggleOpen: toggleOpenMock,
            retryLastMessage: retryLastMessageMock,
            startRecording: startRecordingMock,
            stopRecording: stopRecordingMock,
            cesarinSessionId: 'session-open-cart-1',
        });

        render(<AIConcierge />);

        fireEvent.click(screen.getByText('Abrir carrito'));

        expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
            sessionId: 'session-open-cart-1',
            eventType: 'ai_cta_clicked',
            metadata: {
                message_id: 'assistant-1',
                cta_kind: 'OPEN_CART',
                label: 'Abrir carrito',
                product_id: null,
                order_id: null,
                source: 'cesarin',
            },
        });
        expect(openCartMock).toHaveBeenCalledWith({
            source: 'cesarin',
            sessionId: 'session-open-cart-1',
        });
        expect(navigateMock).not.toHaveBeenCalled();
        expect(windowOpenMock).not.toHaveBeenCalled();
    });
});
