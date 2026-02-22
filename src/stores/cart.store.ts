// Store global del carrito - VSM Store
// Persiste en localStorage automáticamente
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';

// ─── Tipos de resultado de validación ────────────
export interface CartValidationIssue {
    productId: string;
    productName: string;
    type: 'removed' | 'price_changed' | 'stock_adjusted' | 'out_of_stock';
    oldValue?: number;
    newValue?: number;
}

export interface CartValidationResult {
    issues: CartValidationIssue[];
    hasIssues: boolean;
}

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
    validateCart: () => Promise<CartValidationResult>;
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

                // Analytics
                import('@/lib/analytics').then(({ trackAddToCart }) => {
                    trackAddToCart(product, quantity);
                });

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

            // ─── Validar carrito contra la API ──────────────
            // Verifica precios, stock y disponibilidad actual
            validateCart: async () => {
                const { items } = get();
                if (items.length === 0) return { issues: [], hasIssues: false };

                const ids = items.map((item) => item.product.id);

                try {
                    const { getProductsByIds } = await import('@/services/products.service');
                    const currentProducts = await getProductsByIds(ids);
                    const productMap = new Map(currentProducts.map((p) => [p.id, p]));

                    const issues: CartValidationIssue[] = [];
                    const validItems: CartItem[] = [];

                    for (const item of items) {
                        const current = productMap.get(item.product.id);

                        // Producto eliminado, desactivado o discontinuado
                        if (!current || !current.is_active || current.status === 'discontinued') {
                            issues.push({
                                productId: item.product.id,
                                productName: item.product.name,
                                type: 'removed',
                            });
                            continue;
                        }

                        // Sin stock
                        if (current.stock <= 0) {
                            issues.push({
                                productId: item.product.id,
                                productName: item.product.name,
                                type: 'out_of_stock',
                            });
                            continue;
                        }

                        // Precio cambió
                        if (current.price !== item.product.price) {
                            issues.push({
                                productId: item.product.id,
                                productName: item.product.name,
                                type: 'price_changed',
                                oldValue: item.product.price,
                                newValue: current.price,
                            });
                        }

                        // Stock insuficiente para cantidad solicitada
                        const clampedQty = Math.min(item.quantity, current.stock);
                        if (clampedQty < item.quantity) {
                            issues.push({
                                productId: item.product.id,
                                productName: item.product.name,
                                type: 'stock_adjusted',
                                oldValue: item.quantity,
                                newValue: clampedQty,
                            });
                        }

                        // Mantener con datos actualizados
                        validItems.push({
                            product: current,
                            quantity: clampedQty,
                        });
                    }

                    // Aplicar correcciones al carrito
                    set({ items: validItems });

                    return { issues, hasIssues: issues.length > 0 };
                } catch (err) {
                    console.error('[cart.store] validateCart error:', err);
                    // En caso de error de red, no eliminar items
                    return { issues: [], hasIssues: false };
                }
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
