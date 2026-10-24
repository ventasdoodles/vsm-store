// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

const getCurrentUserMock = vi.hoisted(() => vi.fn());
const addToWishlistMock = vi.hoisted(() => vi.fn());
const addItemsToWishlistMock = vi.hoisted(() => vi.fn());
const removeFromWishlistMock = vi.hoisted(() => vi.fn());
const clearWishlistMock = vi.hoisted(() => vi.fn());
const getWishlistMock = vi.hoisted(() => vi.fn());

vi.mock('@/services/auth.service', () => ({
    getCurrentUser: getCurrentUserMock,
}));

vi.mock('@/services', () => ({
    addToWishlist: addToWishlistMock,
    addItemsToWishlist: addItemsToWishlistMock,
    removeFromWishlist: removeFromWishlistMock,
    clearWishlist: clearWishlistMock,
    getWishlist: getWishlistMock,
}));

import { useWishlistStore } from '../wishlist.store';
import type { Product } from '@/types/product';

// Mock product para pruebas
const mockProduct = {
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
} as unknown as Product;

const mockProduct2 = {
    ...mockProduct,
    id: 'prod-2',
    name: 'Vape Test 2',
} as unknown as Product;

describe('Wishlist Store', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getCurrentUserMock.mockResolvedValue(null);
        addToWishlistMock.mockResolvedValue(undefined);
        addItemsToWishlistMock.mockResolvedValue(undefined);
        removeFromWishlistMock.mockResolvedValue(undefined);
        clearWishlistMock.mockResolvedValue(undefined);
        getWishlistMock.mockResolvedValue([]);
        useWishlistStore.setState({ items: [] });
    });

    it('debería inicializar con una lista vacía', () => {
        const state = useWishlistStore.getState();
        expect(state.items).toEqual([]);
    });

    it('debería agregar un producto a la lista localmente', () => {
        const store = useWishlistStore.getState();
        store.addItem(mockProduct);

        const newState = useWishlistStore.getState();
        expect(newState.items).toHaveLength(1);
        expect(newState.items[0]?.id).toBe(mockProduct.id);
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
        expect(newState.items[0]?.id).toBe(mockProduct2.id);
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

    describe('Sincronización con base de datos y autenticación', () => {
        it('sincroniza en segundo plano cuando el usuario está autenticado al agregar', async () => {
            getCurrentUserMock.mockResolvedValue({ id: 'user-auth-123' });
            const store = useWishlistStore.getState();
            store.addItem(mockProduct);

            // Permitir que la promesa fire-and-forget resuelva
            await Promise.resolve();
            await Promise.resolve();

            expect(getCurrentUserMock).toHaveBeenCalled();
            expect(addToWishlistMock).toHaveBeenCalledWith('user-auth-123', mockProduct.id);
        });

        it('sincroniza en segundo plano cuando el usuario está autenticado al eliminar', async () => {
            getCurrentUserMock.mockResolvedValue({ id: 'user-auth-123' });
            const store = useWishlistStore.getState();
            store.addItem(mockProduct);
            store.removeItem(mockProduct.id);

            await Promise.resolve();
            await Promise.resolve();

            expect(removeFromWishlistMock).toHaveBeenCalledWith('user-auth-123', mockProduct.id);
        });

        it('sincroniza en segundo plano cuando el usuario está autenticado al limpiar lista', async () => {
            getCurrentUserMock.mockResolvedValue({ id: 'user-auth-123' });
            const store = useWishlistStore.getState();
            store.addItem(mockProduct);
            store.clearWishlist();

            await Promise.resolve();
            await Promise.resolve();

            expect(clearWishlistMock).toHaveBeenCalledWith('user-auth-123');
        });

        it('syncToDb envía todos los items locales al backend en un único lote via addItemsToWishlist', async () => {
            getCurrentUserMock.mockResolvedValue({ id: 'user-batch-1' });
            useWishlistStore.setState({ items: [mockProduct, mockProduct2] });

            await useWishlistStore.getState().syncToDb();

            expect(addItemsToWishlistMock).toHaveBeenCalledTimes(1);
            expect(addItemsToWishlistMock).toHaveBeenCalledWith('user-batch-1', ['prod-1', 'prod-2']);
        });

        it('syncToDb no hace llamadas si el usuario es null', async () => {
            getCurrentUserMock.mockResolvedValue(null);
            useWishlistStore.setState({ items: [mockProduct] });

            await useWishlistStore.getState().syncToDb();

            expect(addItemsToWishlistMock).not.toHaveBeenCalled();
            expect(addToWishlistMock).not.toHaveBeenCalled();
        });

        it('loadFromDb carga productos de la DB y fusiona con los items locales sin duplicar', async () => {
            getCurrentUserMock.mockResolvedValue({ id: 'user-merge-1' });
            getWishlistMock.mockResolvedValue([mockProduct, mockProduct2]);
            useWishlistStore.setState({ items: [mockProduct] }); // Ya tiene mockProduct

            await useWishlistStore.getState().loadFromDb();

            const items = useWishlistStore.getState().items;
            expect(items).toHaveLength(2);
            expect(items.map(i => i.id)).toEqual(['prod-1', 'prod-2']);
        });

        it('maneja errores en llamadas a servicios sin romper el estado del store', async () => {
            getCurrentUserMock.mockRejectedValue(new Error('Network error'));
            const store = useWishlistStore.getState();

            // No debe lanzar excepción no manejada
            expect(() => store.addItem(mockProduct)).not.toThrow();
            await useWishlistStore.getState().syncToDb();
            await useWishlistStore.getState().loadFromDb();

            expect(useWishlistStore.getState().items).toHaveLength(1);
        });
    });
});
