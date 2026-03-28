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
    useAIConcierge: () => ({
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
    }),
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
    getProductsByIds: vi.fn(),
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
});
