// Store global del carrito - VSM Store
// Persiste en localStorage automáticamente
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';

interface CartState {
    // Estado
    items: CartItem[];
    isOpen: boolean;

    // Acciones
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;

    // Getters computados
    totalItems: () => number;
    subtotal: () => number;
    total: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            items: [],
            isOpen: false,

            // Agregar producto (o incrementar cantidad si ya existe)
            addItem: (product: Product, quantity = 1) => {
                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (item) => item.product.id === product.id
                    );

                    if (existingIndex >= 0) {
                        // Ya existe: incrementar cantidad
                        const updatedItems = [...state.items];
                        updatedItems[existingIndex] = {
                            ...updatedItems[existingIndex],
                            quantity: updatedItems[existingIndex].quantity + quantity,
                        };
                        return { items: updatedItems };
                    }

                    // Nuevo item
                    return { items: [...state.items, { product, quantity }] };
                });
            },

            // Eliminar producto del carrito
            removeItem: (productId: string) => {
                set((state) => ({
                    items: state.items.filter((item) => item.product.id !== productId),
                }));
            },

            // Actualizar cantidad (elimina si quantity <= 0)
            updateQuantity: (productId: string, quantity: number) => {
                if (quantity <= 0) {
                    get().removeItem(productId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.product.id === productId ? { ...item, quantity } : item
                    ),
                }));
            },

            // Vaciar carrito
            clearCart: () => set({ items: [] }),

            // Toggle sidebar
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            // Getters
            totalItems: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            subtotal: () => {
                return get().items.reduce(
                    (sum, item) => sum + item.product.price * item.quantity,
                    0
                );
            },

            total: () => {
                // Por ahora sin impuestos ni envío
                return get().subtotal();
            },
        }),
        {
            name: 'vsm-cart', // Key en localStorage
            partialize: (state) => ({ items: state.items }), // Solo persistir items
        }
    )
);
