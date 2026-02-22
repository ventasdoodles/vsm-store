// Tests para cart.store.ts — validación del carrito contra API
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCartStore, selectTotalItems, selectSubtotal } from '../cart.store';
import type { Product } from '@/types/product';

// ─── Helper: crear producto mock ──────────────────
function mockProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'prod-1',
        name: 'Producto Test',
        slug: 'producto-test',
        price: 100,
        stock: 10,
        is_active: true,
        status: 'active',
        section: 'vape',
        images: [],
        cover_image: '',
        description: '',
        short_description: '',
        sku: 'SKU-001',
        is_featured: false,
        is_new: false,
        is_bestseller: false,
        created_at: new Date().toISOString(),
        ...overrides,
    } as Product;
}

// ─── Mock del módulo de productos ─────────────────
const mockGetProductsByIds = vi.fn();

vi.mock('@/services/products.service', () => ({
    getProductsByIds: (...args: unknown[]) => mockGetProductsByIds(...args),
}));

describe('cart.store', () => {
    beforeEach(() => {
        // Reset del store
        useCartStore.setState({ items: [], isOpen: false });
        vi.clearAllMocks();
    });

    // ─── Selectores ───────────────────────────────────
    describe('selectTotalItems', () => {
        it('returns 0 for empty cart', () => {
            expect(selectTotalItems(useCartStore.getState())).toBe(0);
        });

        it('sums all item quantities', () => {
            useCartStore.setState({
                items: [
                    { product: mockProduct({ id: 'a' }), quantity: 2 },
                    { product: mockProduct({ id: 'b' }), quantity: 3 },
                ],
            });
            expect(selectTotalItems(useCartStore.getState())).toBe(5);
        });
    });

    describe('selectSubtotal', () => {
        it('returns 0 for empty cart', () => {
            expect(selectSubtotal(useCartStore.getState())).toBe(0);
        });

        it('calculates price × quantity for all items', () => {
            useCartStore.setState({
                items: [
                    { product: mockProduct({ id: 'a', price: 50 }), quantity: 2 },
                    { product: mockProduct({ id: 'b', price: 100 }), quantity: 1 },
                ],
            });
            expect(selectSubtotal(useCartStore.getState())).toBe(200); // 50*2 + 100*1
        });
    });

    // ─── validateCart ─────────────────────────────────
    describe('validateCart', () => {
        it('returns no issues for empty cart', async () => {
            const result = await useCartStore.getState().validateCart();
            expect(result.hasIssues).toBe(false);
            expect(result.issues).toHaveLength(0);
            expect(mockGetProductsByIds).not.toHaveBeenCalled();
        });

        it('removes products that no longer exist in API', async () => {
            const product = mockProduct({ id: 'gone-product', name: 'Eliminado' });
            useCartStore.setState({
                items: [{ product, quantity: 1 }],
            });

            // API retorna array vacío — producto ya no existe
            mockGetProductsByIds.mockResolvedValue([]);

            const result = await useCartStore.getState().validateCart();

            expect(result.hasIssues).toBe(true);
            expect(result.issues).toHaveLength(1);
            expect(result.issues[0]!.type).toBe('removed');
            expect(result.issues[0]!.productName).toBe('Eliminado');
            // Cart debería quedar vacío
            expect(useCartStore.getState().items).toHaveLength(0);
        });

        it('removes inactive/discontinued products', async () => {
            const product = mockProduct({ id: 'p1', name: 'Descontinuado' });
            useCartStore.setState({
                items: [{ product, quantity: 1 }],
            });

            mockGetProductsByIds.mockResolvedValue([
                mockProduct({ id: 'p1', is_active: false, status: 'discontinued' }),
            ]);

            const result = await useCartStore.getState().validateCart();

            expect(result.hasIssues).toBe(true);
            expect(result.issues[0]!.type).toBe('removed');
            expect(useCartStore.getState().items).toHaveLength(0);
        });

        it('removes out-of-stock products', async () => {
            const product = mockProduct({ id: 'p1', name: 'Agotado', stock: 5 });
            useCartStore.setState({
                items: [{ product, quantity: 2 }],
            });

            mockGetProductsByIds.mockResolvedValue([
                mockProduct({ id: 'p1', stock: 0 }),
            ]);

            const result = await useCartStore.getState().validateCart();

            expect(result.hasIssues).toBe(true);
            expect(result.issues[0]!.type).toBe('out_of_stock');
            expect(useCartStore.getState().items).toHaveLength(0);
        });

        it('detects price changes and updates cart', async () => {
            const product = mockProduct({ id: 'p1', name: 'Vape X', price: 100 });
            useCartStore.setState({
                items: [{ product, quantity: 1 }],
            });

            mockGetProductsByIds.mockResolvedValue([
                mockProduct({ id: 'p1', price: 120, stock: 10 }),
            ]);

            const result = await useCartStore.getState().validateCart();

            expect(result.hasIssues).toBe(true);
            expect(result.issues[0]!.type).toBe('price_changed');
            expect(result.issues[0]!.oldValue).toBe(100);
            expect(result.issues[0]!.newValue).toBe(120);
            // Cart item should have updated price
            const cartItems = useCartStore.getState().items;
            expect(cartItems).toHaveLength(1);
            expect(cartItems[0]!.product.price).toBe(120);
        });

        it('adjusts quantity when stock is reduced', async () => {
            const product = mockProduct({ id: 'p1', name: 'Vape Y', stock: 10 });
            useCartStore.setState({
                items: [{ product, quantity: 5 }],
            });

            mockGetProductsByIds.mockResolvedValue([
                mockProduct({ id: 'p1', stock: 3, price: 100 }),
            ]);

            const result = await useCartStore.getState().validateCart();

            expect(result.hasIssues).toBe(true);
            expect(result.issues[0]!.type).toBe('stock_adjusted');
            expect(result.issues[0]!.oldValue).toBe(5);
            expect(result.issues[0]!.newValue).toBe(3);
            // Cart quantity should be clamped
            expect(useCartStore.getState().items[0]!.quantity).toBe(3);
        });

        it('returns no issues when all products are valid', async () => {
            const product = mockProduct({ id: 'p1', price: 100, stock: 10 });
            useCartStore.setState({
                items: [{ product, quantity: 2 }],
            });

            mockGetProductsByIds.mockResolvedValue([
                mockProduct({ id: 'p1', price: 100, stock: 10 }),
            ]);

            const result = await useCartStore.getState().validateCart();

            expect(result.hasIssues).toBe(false);
            expect(result.issues).toHaveLength(0);
            expect(useCartStore.getState().items).toHaveLength(1);
        });

        it('handles network errors gracefully', async () => {
            const product = mockProduct({ id: 'p1' });
            useCartStore.setState({
                items: [{ product, quantity: 1 }],
            });

            mockGetProductsByIds.mockRejectedValue(new Error('Network error'));

            const result = await useCartStore.getState().validateCart();

            // Should NOT remove items on network error
            expect(result.hasIssues).toBe(false);
            expect(useCartStore.getState().items).toHaveLength(1);
        });
    });
});
