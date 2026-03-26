import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthenticatedOrderReorder } from '../useAuthenticatedOrderReorder';
import type { CartItem } from '@/types/cart';
import type { OrderItem } from '@/types/order';
import type { Product } from '@/types/product';

const getProductsByIdsMock = vi.fn();
const addItemMock = vi.fn();
const openCartMock = vi.fn();
const successMock = vi.fn();
const warningMock = vi.fn();
const errorMock = vi.fn();

let cartItemsMock: CartItem[] = [];

vi.mock('@/services/products.service', () => ({
    getProductsByIds: (...args: unknown[]) => getProductsByIdsMock(...args),
}));

vi.mock('@/stores/cart.store', () => ({
    useCartStore: (
        selector: (state: {
            items: CartItem[];
            addItem: typeof addItemMock;
            openCart: typeof openCartMock;
        }) => unknown,
    ) => selector({
        items: cartItemsMock,
        addItem: addItemMock,
        openCart: openCartMock,
    }),
}));

vi.mock('@/hooks/useNotification', () => ({
    useNotification: () => ({
        success: successMock,
        warning: warningMock,
        error: errorMock,
        info: vi.fn(),
    }),
}));

function createProduct(overrides: Partial<Product> = {}): Product {
    return {
        id: 'prod-1',
        name: 'Producto vigente',
        slug: 'producto-vigente',
        description: null,
        short_description: null,
        price: 320,
        compare_at_price: null,
        stock: 5,
        sku: null,
        section: 'vape',
        category_id: 'cat-1',
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
        created_at: '2026-03-25T00:00:00.000Z',
        updated_at: '2026-03-25T00:00:00.000Z',
        specs: {},
        badges: [],
        ai_is_featured: false,
        ai_sales_note: null,
        ai_exclude: false,
        variants: [],
        ...overrides,
    };
}

describe('useAuthenticatedOrderReorder', () => {
    beforeEach(() => {
        cartItemsMock = [];
        getProductsByIdsMock.mockReset();
        addItemMock.mockReset();
        openCartMock.mockReset();
        successMock.mockReset();
        warningMock.mockReset();
        errorMock.mockReset();
    });

    it('re-adds current catalog items through the normal cart path on a happy reorder', async () => {
        const orderItems: OrderItem[] = [
            { product_id: 'prod-1', name: 'Producto vigente', price: 250, quantity: 2 },
        ];
        const currentProduct = createProduct();
        getProductsByIdsMock.mockResolvedValue([currentProduct]);

        const { result } = renderHook(() => useAuthenticatedOrderReorder());

        await act(async () => {
            await result.current.reorderOrder({
                id: 'order-1',
                items: orderItems,
            });
        });

        expect(getProductsByIdsMock).toHaveBeenCalledWith(['prod-1']);
        expect(addItemMock).toHaveBeenCalledWith(currentProduct, 2, null);
        expect(openCartMock).toHaveBeenCalledTimes(1);
        expect(successMock).toHaveBeenCalledWith(
            'Carrito actualizado',
            'Los articulos vigentes del pedido se agregaron usando el catalogo actual. Revisa tu carrito antes de continuar.',
        );
    });

    it('keeps partial reorder honest when some lines drift or only part of the quantity still fits', async () => {
        const orderItems: OrderItem[] = [
            { product_id: 'prod-1', name: 'Producto vigente', price: 250, quantity: 4 },
            { product_id: 'prod-missing', name: 'Producto perdido', price: 90, quantity: 1 },
        ];
        const currentProduct = createProduct({ stock: 4 });
        cartItemsMock = [{ product: currentProduct, quantity: 2, variant_id: null, variant_name: null }];
        getProductsByIdsMock.mockResolvedValue([currentProduct]);

        const { result } = renderHook(() => useAuthenticatedOrderReorder());

        await act(async () => {
            await result.current.reorderOrder({
                id: 'order-2',
                items: orderItems,
            });
        });

        expect(addItemMock).toHaveBeenCalledWith(currentProduct, 2, null);
        expect(openCartMock).toHaveBeenCalledTimes(1);
        expect(warningMock).toHaveBeenCalledWith(
            'Reorden parcial',
            'Se agregaron 1 articulo(s) al carrito, pero 2 requieren revision o ya no estan disponibles como en el pedido original. Revisa tu carrito antes de continuar.',
        );
    });

    it('fails safely when the current catalog can no longer remap the persisted item', async () => {
        const orderItems: OrderItem[] = [
            {
                product_id: 'prod-1',
                variant_id: 'variant-1',
                variant_name: 'Rojo / XL',
                name: 'Producto vigente',
                price: 250,
                quantity: 1,
            },
        ];
        getProductsByIdsMock.mockResolvedValue([createProduct()]);

        const { result } = renderHook(() => useAuthenticatedOrderReorder());

        await act(async () => {
            await result.current.reorderOrder({
                id: 'order-3',
                items: orderItems,
            });
        });

        expect(addItemMock).not.toHaveBeenCalled();
        expect(openCartMock).not.toHaveBeenCalled();
        expect(errorMock).toHaveBeenCalledWith(
            'No se pudo reconstruir el pedido',
            'Ningun articulo pudo agregarse con seguridad desde el catalogo actual. Revisa el pedido y el catalogo antes de volver a comprar.',
        );
    });
});
