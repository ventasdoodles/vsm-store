/**
 * // ─── STORE: Cart Store ───
 * // Arquitectura: State Manager (Lego Master)
 * // Proposito principal: Gestión del carrito de compras con persistencia y validación de integridad.
 * // Regla / Notas: Usa Zustand con middleware de persistencia. Valida stock y precios contra API.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';
import type { SmartBundleOffer } from '@/services/bundle.service';

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
    addItem: (product: Product, quantity?: number, variant?: { id: string; name: string } | null) => void;
    removeItem: (productId: string, variantId?: string | null) => void;
    updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    loadOrderItems: (items: CartItem[]) => void;
    validateCart: () => Promise<CartValidationResult>;
    
    // Bundles Smart
    bundleOffer: SmartBundleOffer | null;
    setBundleOffer: (offer: SmartBundleOffer | null) => void;
    applyBundle: (product: Product, couponCode: string) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // Estado inicial
            items: [],
            isOpen: false,
            bundleOffer: null,

            // Agregar producto (o incrementar cantidad si ya existe esta combinación variante/producto)
            addItem: (product: Product, quantity = 1, variant = null) => {
                // Producto inactivo o discontinuado: no agregar
                if (!product.is_active || product.status === 'discontinued') return;

                // Analytics
                import('@/lib/analytics').then(({ trackAddToCart }) => {
                    trackAddToCart(product, quantity);
                });

                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (item) => item.product.id === product.id && (item.variant_id ?? null) === (variant?.id ?? null)
                    );

                    if (existingIndex >= 0) {
                        const currentItem = state.items[existingIndex];
                        if (!currentItem) return state; // Safety check

                        const currentQty = currentItem.quantity;
                        const newQty = currentQty + quantity;

                        // No exceder stock disponible (si es variante, el stock debería validarse contra la variante en el futuro)
                        // Por ahora usamos el stock del producto base como fallback
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

                    return {
                        items: [
                            ...state.items,
                            {
                                product,
                                quantity,
                                variant_id: variant?.id || null,
                                variant_name: variant?.name || null
                            }
                        ]
                    };
                });
            },

            // Eliminar producto del carrito (considerando variante)
            removeItem: (productId: string, variantId: string | null = null) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.product.id === productId && (item.variant_id ?? null) === (variantId ?? null))
                    ),
                }));
            },

            // Actualizar cantidad (considerando variante)
            updateQuantity: (productId: string, quantity: number, variantId = null) => {
                if (quantity <= 0) {
                    get().removeItem(productId, variantId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) => {
                        if (item.product.id !== productId || (item.variant_id ?? null) !== (variantId ?? null)) return item;
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
                set({ items: orderItems.map((i) => ({ 
                    product: i.product, 
                    quantity: i.quantity,
                    variant_id: i.variant_id ?? null,
                    variant_name: i.variant_name ?? null
                })) });
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

            // Bundles Smart Actions
            setBundleOffer: (offer) => set({ bundleOffer: offer }),
            
            applyBundle: (product, couponCode) => {
                // 1. Agregar el producto sugerido
                get().addItem(product, 1);
                
                // 2. Notificar éxito (el componente UI se encargará de aplicar el cupón al checkout)
                // Opcionalmente podríamos guardar el cupón en una pestaña de "cupón activo" 
                // pero por ahora el flujo es que al ir al checkout se aplique.
                // Guardamos el código en sessionStorage para que useCheckout lo tome.
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('active_bundle_coupon', couponCode);
                }
                
                // 3. Limpiar oferta actual para no repetirla
                set({ bundleOffer: null });
            },
        }),
        {
            name: 'vsm-cart', // Key en localStorage
            version: 2, // Incrementar al cambiar schema de Product/CartItem
            partialize: (state) => ({ items: state.items }), // Solo persistir items
            migrate: (persisted, version) => {
                // Si la versión guardada es vieja, limpiar el carrito
                // para evitar objetos Product con campos faltantes
                if (version < 2) {
                    return { items: [] };
                }
                return persisted as { items: CartItem[] };
            },
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

// ─── Sincronización entre pestañas ────────────────
// Cuando otra pestaña modifica el carrito en localStorage, actualizar este store
if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
        if (e.key === 'vsm-cart' && e.newValue) {
            try {
                const parsed = JSON.parse(e.newValue);
                // Validate the parsed data has the expected shape
                if (
                    parsed?.state?.items &&
                    Array.isArray(parsed.state.items) &&
                    parsed.state.items.every(
                        (item: unknown) =>
                            typeof item === 'object' &&
                            item !== null &&
                            'product' in item &&
                            'quantity' in item &&
                            typeof (item as Record<string, unknown>).quantity === 'number'
                    )
                ) {
                    useCartStore.setState({ items: parsed.state.items });
                }
            } catch { /* ignore malformed JSON */ }
        }
    });
}
