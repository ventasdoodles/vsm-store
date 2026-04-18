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
const emitConversationConversionEventMock = vi.fn();

vi.mock('@/services/products.service', () => ({
    getProductsByIds: (...args: unknown[]) => mockGetProductsByIds(...args),
}));

vi.mock('@/lib/conversion-measurement', () => ({
    emitConversationConversionEvent: (...args: unknown[]) => emitConversationConversionEventMock(...args),
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
    describe('updateQuantity', () => {
        it('does not fall back to base stock clamping for an invalid variant line', () => {
            const product = mockProduct({
                id: 'p-variant-invalid',
                stock: 10,
                variants: [
                    {
                        id: 'variant-1',
                        product_id: 'p-variant-invalid',
                        sku: 'VAR-1',
                        price: null,
                        stock: 4,
                        images: [],
                        is_active: true,
                        options: [],
                    },
                ],
            });

            useCartStore.setState({
                items: [{ product, quantity: 1, variant_id: 'variant-missing', variant_name: 'Legacy / Azul' }],
            });

            useCartStore.getState().updateQuantity('p-variant-invalid', 9, 'variant-missing');

            expect(useCartStore.getState().items[0]!.quantity).toBe(1);
        });
    });

    describe('conversion measurement', () => {
        it('emits a cesarin cart mutation result when addItem succeeds', () => {
            const product = mockProduct({ id: 'p-conversion', stock: 3 });

            useCartStore.getState().addItem(product, 2, null, {
                source: 'cesarin',
                sessionId: 'session-1',
            });

            expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
                sessionId: 'session-1',
                eventType: 'cart_mutation_result',
                metadata: {
                    source: 'cesarin',
                    product_id: 'p-conversion',
                    quantity_requested: 2,
                    quantity_added: 2,
                    result: 'added',
                },
            });
        });

        it('emits a blocked mutation result when addItem cannot change the cart', () => {
            const product = mockProduct({ id: 'p-blocked', stock: 1 });

            useCartStore.getState().addItem(product, 2, null, {
                source: 'cesarin',
                sessionId: 'session-1',
            });

            expect(useCartStore.getState().items).toHaveLength(0);
            expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
                sessionId: 'session-1',
                eventType: 'cart_mutation_result',
                metadata: {
                    source: 'cesarin',
                    product_id: 'p-blocked',
                    quantity_requested: 2,
                    quantity_added: 0,
                    result: 'blocked',
                },
            });
        });

        it('emits cart_opened with the supplied source context', () => {
            useCartStore.getState().openCart({
                source: 'cesarin',
                sessionId: 'session-1',
            });

            expect(useCartStore.getState().isOpen).toBe(true);
            expect(emitConversationConversionEventMock).toHaveBeenCalledWith({
                sessionId: 'session-1',
                eventType: 'cart_opened',
                metadata: {
                    source: 'cesarin',
                },
            });
        });
    });

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

        it('removes cart items whose selected variant no longer exists safely', async () => {
            const product = mockProduct({
                id: 'p-variant',
                name: 'Kit con variante',
                variants: [
                    {
                        id: 'variant-1',
                        product_id: 'p-variant',
                        sku: 'VAR-1',
                        price: null,
                        stock: 3,
                        images: [],
                        is_active: true,
                        options: [],
                    },
                ],
            });
            useCartStore.setState({
                items: [{ product, quantity: 1, variant_id: 'variant-legacy', variant_name: 'Azul / M' }],
            });

            mockGetProductsByIds.mockResolvedValue([product]);

            const result = await useCartStore.getState().validateCart();

            expect(result.hasIssues).toBe(true);
            expect(result.issues[0]!.type).toBe('variant_removed');
            expect(useCartStore.getState().items).toHaveLength(0);
        });

        it('adjusts quantity using current variant stock and preserves variant metadata', async () => {
            const product = mockProduct({
                id: 'p-variant-stock',
                name: 'Pod con variante',
                stock: 20,
                variants: [
                    {
                        id: 'variant-1',
                        product_id: 'p-variant-stock',
                        sku: 'VAR-1',
                        price: null,
                        stock: 2,
                        images: [],
                        is_active: true,
                        options: [
                            {
                                variant_id: 'variant-1',
                                attribute_value_id: 'value-1',
                                attribute_value: { id: 'value-1', attribute_id: 'attr-1', value: 'Rojo / XL' },
                            },
                        ],
                    },
                ],
            });
            useCartStore.setState({
                items: [{ product, quantity: 5, variant_id: 'variant-1', variant_name: 'Rojo / XL' }],
            });

            mockGetProductsByIds.mockResolvedValue([product]);

            const result = await useCartStore.getState().validateCart();

            expect(result.hasIssues).toBe(true);
            expect(result.issues[0]!.type).toBe('variant_stock_adjusted');
            expect(useCartStore.getState().items[0]!.quantity).toBe(2);
            expect(useCartStore.getState().items[0]!.variant_id).toBe('variant-1');
            expect(useCartStore.getState().items[0]!.variant_name).toBe('Rojo / XL');
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
