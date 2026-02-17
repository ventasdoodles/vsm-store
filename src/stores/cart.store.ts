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
    loadOrderItems: (items: { product: Product; quantity: number }[]) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            items: [],
            isOpen: false,

            // Agregar producto (o incrementar cantidad si ya existe)
            addItem: (product: Product, quantity = 1) => {
                // Producto inactivo o discontinuado: no agregar
                if (!product.is_active || product.status === 'discontinued') return;

                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (item) => item.product.id === product.id
                    );

                    if (existingIndex >= 0) {
                        const currentItem = state.items[existingIndex];
                        if (!currentItem) return state; // Safety check

                        const currentQty = currentItem.quantity;
                        const newQty = currentQty + quantity;

                        // No exceder stock disponible
                        if (newQty > product.stock) return state;

                        const updatedItems = [...state.items];
                        updatedItems[existingIndex] = {
                            ...currentItem,
                            quantity: newQty,
                        };
                        return { items: updatedItems };
                    }

                    // Verificar stock antes de agregar nuevo item
                    if (quantity > product.stock) return state;
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
                    items: state.items.map((item) => {
                        if (item.product.id !== productId) return item;
                        // Clamp al stock disponible
                        const clampedQty = Math.min(quantity, item.product.stock);
                        return { ...item, quantity: clampedQty };
                    }),
                }));
            },

            // Vaciar carrito
            clearCart: () => set({ items: [] }),

            // Toggle sidebar
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            // Cargar items de un pedido anterior al carrito
            loadOrderItems: (orderItems) => {
                set({ items: orderItems.map((i) => ({ product: i.product, quantity: i.quantity })) });
            },
        }),
        {
            name: 'vsm-cart', // Key en localStorage
            partialize: (state) => ({ items: state.items }), // Solo persistir items
        }
    )
);

// ─── Selectores memoizados ────────────────────────
// Usar estos en componentes para evitar re-renders innecesarios
export const selectTotalItems = (state: CartState) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0);

// Subtotal: suma de productos sin descuentos ni envío
export const selectSubtotal = (state: CartState) =>
    state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

// Total final — actualmente igual a subtotal.
// TODO: cuando se implemente descuentos/envío, recibir como parámetros aquí.
export const selectTotal = selectSubtotal;
