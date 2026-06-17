import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AdminCategories } from '../AdminCategories';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { VerticalPackProvider } from '@/contexts/VerticalPackContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock components to avoid deep rendering
vi.mock('@/components/admin/categories', () => ({
    CategoriesHeader: ({ onNew }: any) => (
        <div data-testid="mock-header">
            <button onClick={onNew}>Nueva Categoría</button>
        </div>
    ),
    CategoryTreeContainer: ({ roots, childrenMap }: any) => (
        <div data-testid="mock-tree">
            Roots: {roots.length}
            Children Map Keys: {Object.keys(childrenMap).length}
        </div>
    ),
    CategoryForm: ({ open, onClose }: any) => (
        open ? (
            <div data-testid="mock-form">
                Form is open
                <button onClick={onClose}>Cerrar</button>
            </div>
        ) : null
    )
}));

// Mock hooks
vi.mock('@/hooks/admin/useAdminCatalog', () => ({
    useAdminCategories: vi.fn(() => ({
        categories: [
            { id: '1', name: 'Vape', section: 'vape', parent_id: null, is_active: true },
            { id: '2', name: 'Salts', section: 'vape', parent_id: '1', is_active: true }
        ],
        isLoading: false,
        createCategory: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn(),
        toggleActive: vi.fn(),
        isMutating: false
    }))
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        error: vi.fn(),
        success: vi.fn()
    })
}));

vi.mock('@/hooks/useConfirm', () => ({
    useConfirm: () => ({
        confirm: vi.fn()
    })
}));

describe('AdminCategories Orchestrator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithContext = (ui: React.ReactElement) => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        });

        return render(
            <QueryClientProvider client={queryClient}>
                <ThemeProvider>
                    <VerticalPackProvider>
                        {ui}
                    </VerticalPackProvider>
                </ThemeProvider>
            </QueryClientProvider>
        );
    };

    it('computes childrenMap and passes it to tree container', () => {
        renderWithContext(<AdminCategories />);
        
        // El hook simulado tiene 1 root y 1 hijo. El childrenMap debe tener 1 key (el id '1').
        expect(screen.getByText(/Roots:\s*1/)).toBeInTheDocument();
        expect(screen.getByText(/Children Map Keys:\s*1/)).toBeInTheDocument();
    });

    it('opens category form when "Nueva Categoría" is clicked', () => {
        renderWithContext(<AdminCategories />);
        
        expect(screen.queryByTestId('mock-form')).not.toBeInTheDocument();
        
        fireEvent.click(screen.getByText('Nueva Categoría'));
        
        expect(screen.getByTestId('mock-form')).toBeInTheDocument();
        expect(screen.getByText('Form is open')).toBeInTheDocument();
    });

    it('closes form when onClose is called', () => {
        renderWithContext(<AdminCategories />);
        fireEvent.click(screen.getByText('Nueva Categoría'));
        expect(screen.getByTestId('mock-form')).toBeInTheDocument();
        
        fireEvent.click(screen.getByText('Cerrar'));
        expect(screen.queryByTestId('mock-form')).not.toBeInTheDocument();
    });
});
