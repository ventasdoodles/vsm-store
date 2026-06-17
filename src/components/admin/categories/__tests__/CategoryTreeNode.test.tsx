import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CategoryTreeNode } from '../CategoryTreeNode';
import type { Category } from '@/types/category';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { VerticalPackProvider } from '@/contexts/VerticalPackContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mockCategories: Category[] = [
    {
        id: '1',
        name: 'Vape',
        slug: 'vape',
        section: 'vape',
        parent_id: null,
        is_active: true,
        order_index: 0,
        is_popular: false,
        description: null,
        image_url: null,
        created_at: ''
    },
    {
        id: '2',
        name: 'Liquids',
        slug: 'liquids',
        section: 'vape',
        parent_id: '1',
        is_active: true,
        order_index: 0,
        is_popular: false,
        description: null,
        image_url: null,
        created_at: ''
    },
    {
        id: '3',
        name: 'Salts',
        slug: 'salts',
        section: 'vape',
        parent_id: '2',
        is_active: true,
        order_index: 0,
        is_popular: false,
        description: null,
        image_url: null,
        created_at: ''
    }
];

const childrenMap: Record<string, Category[]> = {
    '1': [mockCategories[1] as Category],
    '2': [mockCategories[2] as Category]
};

describe('CategoryTreeNode', () => {
    const defaultProps = {
        category: mockCategories[0] as Category,
        allCategories: mockCategories as Category[],
        childrenMap: childrenMap,
        onEdit: vi.fn(),
        onAddChild: vi.fn(),
        onDelete: vi.fn(),
        onToggleActive: vi.fn(),
        isToggling: false
    };

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

    it('renders the root category name', () => {
        renderWithContext(<CategoryTreeNode {...defaultProps} />);
        expect(screen.getByText('Vape')).toBeInTheDocument();
    });

    it('recursively renders children from childrenMap', () => {
        renderWithContext(<CategoryTreeNode {...defaultProps} />);
        // Debe renderizar el hijo directo
        expect(screen.getByText('Liquids')).toBeInTheDocument();
        // Debe renderizar el nieto
        expect(screen.getByText('Salts')).toBeInTheDocument();
    });

    it('calls onEdit when edit button is clicked', () => {
        renderWithContext(<CategoryTreeNode {...defaultProps} />);
        const editButtons = screen.getAllByTitle('Editar');
        if (editButtons[0]) fireEvent.click(editButtons[0]);
        expect(defaultProps.onEdit).toHaveBeenCalledWith(mockCategories[0]);
    });
});
