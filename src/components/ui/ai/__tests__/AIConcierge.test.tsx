import { fireEvent, render, screen } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIConcierge } from '../AIConcierge';

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

vi.mock('framer-motion', () => ({
    motion: new Proxy(
        {},
        {
            get: () =>
                ({ children, ...props }: PropsWithChildren<Record<string, unknown>>) => (
                    <div {...props}>{children}</div>
                ),
        },
    ),
    AnimatePresence: ({ children }: PropsWithChildren) => <>{children}</>,
}));

vi.mock('react-router-dom', () => ({
    useLocation: () => ({ pathname: '/vape/waka-somatch-menta' }),
    useNavigate: () => navigateMock,
}));

vi.mock('@/hooks/useAIConcierge', () => ({
    useAIConcierge: () => useAIConciergeMock(),
}));

vi.mock('@/components/ui/OptimizedImage', () => ({
    OptimizedImage: () => <div>image</div>,
}));

vi.mock('@/stores/cart.store', () => ({
    useCartStore: (selector: (state: { addItem: ReturnType<typeof vi.fn> }) => unknown) =>
        selector({ addItem: vi.fn() }),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: vi.fn(),
        error: vi.fn(),
    }),
}));

vi.mock('@/services/products.service', () => ({
    getProductsByIds: (...args: unknown[]) => (getProductsByIdsMock as any)(args[0]),
}));

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
        useAIConciergeMock.mockReturnValue({
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
        expect(screen.getAllByText('Ya viene bien amarrado').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Listo para avanzar').length).toBeGreaterThanOrEqual(1);
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
                            guidance: 'Mint Fresh y Berry Chill traen buen caso; comparalos antes de decidir.',
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
        expect(screen.getAllByText('Las dos traen buen caso').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Compara estas dos')).toBeInTheDocument();
        expect(screen.queryByText('Paso accionable')).not.toBeInTheDocument();
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
                            guidance: 'Mint Fresh es la mejor pista por ahora; revisalo primero y si no te convence seguimos.',
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
        expect(screen.getAllByText('Es la mejor pista por ahora').length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Revisa primero')).toBeInTheDocument();
        expect(screen.queryByText('Paso accionable')).not.toBeInTheDocument();
    });
});
