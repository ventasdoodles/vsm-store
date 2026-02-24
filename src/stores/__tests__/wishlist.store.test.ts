import { describe, it, expect, beforeEach } from 'vitest';
import { useWishlistStore } from '../wishlist.store';
import type { Product } from '@/types/product';

// Mock product para pruebas
const mockProduct: Product = {
    id: 'prod-1',
    name: 'Vape Test',
    slug: 'vape-test',
    description: 'Test description',
    price: 100,
    stock: 10,
    category_id: 'cat-1',
    section: 'vape',
    images: ['image1.jpg'],
    tags: [],
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
};

const mockProduct2: Product = {
    ...mockProduct,
    id: 'prod-2',
    name: 'Vape Test 2',
};

describe('Wishlist Store', () => {
    // Limpiar el store antes de cada prueba
    beforeEach(() => {
        useWishlistStore.getState().clearWishlist();
    });

    it('debería inicializar con una lista vacía', () => {
        const state = useWishlistStore.getState();
        expect(state.items).toEqual([]);
    });

    it('debería agregar un producto a la lista', () => {
        const store = useWishlistStore.getState();
        store.addItem(mockProduct);

        const newState = useWishlistStore.getState();
        expect(newState.items).toHaveLength(1);
        expect(newState.items[0].id).toBe(mockProduct.id);
    });

    it('no debería agregar productos duplicados', () => {
        const store = useWishlistStore.getState();
        store.addItem(mockProduct);
        store.addItem(mockProduct); // Intento duplicado

        const newState = useWishlistStore.getState();
        expect(newState.items).toHaveLength(1);
    });

    it('debería eliminar un producto de la lista', () => {
        const store = useWishlistStore.getState();
        store.addItem(mockProduct);
        store.addItem(mockProduct2);
        
        store.removeItem(mockProduct.id);

        const newState = useWishlistStore.getState();
        expect(newState.items).toHaveLength(1);
        expect(newState.items[0].id).toBe(mockProduct2.id);
    });

    it('debería alternar (toggle) un producto correctamente', () => {
        const store = useWishlistStore.getState();
        
        // Toggle para agregar
        store.toggleItem(mockProduct);
        expect(useWishlistStore.getState().items).toHaveLength(1);

        // Toggle para quitar
        store.toggleItem(mockProduct);
        expect(useWishlistStore.getState().items).toHaveLength(0);
    });

    it('debería verificar si un producto está en la lista (isInWishlist)', () => {
        const store = useWishlistStore.getState();
        store.addItem(mockProduct);

        expect(store.isInWishlist(mockProduct.id)).toBe(true);
        expect(store.isInWishlist(mockProduct2.id)).toBe(false);
    });

    it('debería limpiar toda la lista', () => {
        const store = useWishlistStore.getState();
        store.addItem(mockProduct);
        store.addItem(mockProduct2);
        
        store.clearWishlist();

        expect(useWishlistStore.getState().items).toHaveLength(0);
    });
});
