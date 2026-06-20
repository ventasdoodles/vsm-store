/**
 * // â”€â”€â”€ STORE: Cart Store â”€â”€â”€
 * // Arquitectura: State Manager (Lego Master)
 * // Proposito principal: Gestión del carrito de compras con persistencia y validación de integridad.
 * // Regla / Notas: Usa Zustand con middleware de persistencia. Valida stock y precios contra API.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';
import type { SmartBundleOffer } from '@/services';
import { getStorefrontProductPurchaseability, getVariantDisplayName } from '@/lib/domain/products';
import { emitConversationConversionEvent, type ConversionSource } from '@/lib/conversion-measurement';

// â”€â”€â”€ Tipos de resultado de validación â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface CartValidationIssue {
    productId: string;
    productName: string;
    type: 'removed' | 'price_changed' | 'stock_adjusted' | 'out_of_stock' | 'variant_removed' | 'variant_stock_adjusted';
    oldValue?: number;
    newValue?: number;
}

export interface CartValidationResult {
    issues: CartValidationIssue[];
    hasIssues: boolean;
}

export interface CartConversionContext {
    source?: ConversionSource;
    sessionId?: string | null;
}

interface CartState {
    // Estado
    items: CartItem[];
    isOpen: boolean;
    lastValidationResult: CartValidationResult | null;

    // Acciones
    addItem: (product: Product, quantity?: number, variant?: { id: string; name: string } | null, context?: CartConversionContext) => void;
    removeItem: (productId: string, variantId?: string | null) => void;
    updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: (context?: CartConversionContext) => void;
    closeCart: () => void;
    loadOrderItems: (items: CartItem[]) => void;
    validateCart: () => Promise<CartValidationResult>;
    clearValidationResult: () => void;
    
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
            lastValidationResult: null,

            // Agregar producto (o incrementar cantidad si ya existe esta combinación variante/producto)
            addItem: (product: Product, quantity = 1, variant = null, context = {}) => {
                const source = context.source ?? 'manual';
                const purchaseability = getStorefrontProductPurchaseability(product, {
                    selectedVariantId: variant?.id ?? null,
                });
                const beforeQuantity = get().items.find(
                    (item) => item.product.id === product.id && (item.variant_id ?? null) === (variant?.id ?? null)
                )?.quantity ?? 0;
                const emitCartMutation = (quantityAdded: number, result: 'added' | 'blocked' | 'clamped') => {
                    emitConversationConversionEvent({
                        sessionId: context.sessionId ?? null,
                        eventType: 'cart_mutation_result',
                        metadata: {
                            source,
                            product_id: product.id,
                            quantity_requested: quantity,
                            quantity_added: quantityAdded,
                            result,
                        },
                    });
                };

                if (!purchaseability.canAddToCart || quantity <= 0) {
                    emitCartMutation(0, 'blocked');
                    return;
                }
                if (quantity > purchaseability.maxQuantity) {
                    emitCartMutation(0, 'blocked');
                    return;
                }

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
                        if (newQty > purchaseability.maxQuantity) return state;

                        const updatedItems = [...state.items];
                        updatedItems[existingIndex] = {
                            ...currentItem,
                            quantity: newQty,
                        };
                        return { items: updatedItems, lastValidationResult: null };
                    }

                    // Verificar stock antes de agregar nuevo item
                    if (quantity > purchaseability.maxQuantity) return state;

                    return {
                        items: [
                            ...state.items,
                            {
                                product,
                                quantity,
                                variant_id: variant?.id || null,
                                variant_name: variant?.name || null
                            }
                        ],
                        lastValidationResult: null,
                    };
                });

                const afterQuantity = get().items.find(
                    (item) => item.product.id === product.id && (item.variant_id ?? null) === (variant?.id ?? null)
                )?.quantity ?? 0;
                const quantityAdded = Math.max(0, afterQuantity - beforeQuantity);
                emitCartMutation(
                    quantityAdded,
                    quantityAdded > 0
                        ? quantityAdded < quantity ? 'clamped' : 'added'
                        : 'blocked',
                );
            },

            // Eliminar producto del carrito (considerando variante)
            removeItem: (productId: string, variantId: string | null = null) => {
                set((state) => ({
                    items: state.items.filter(
                        (item) => !(item.product.id === productId && (item.variant_id ?? null) === (variantId ?? null))
                    ),
                    lastValidationResult: null,
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
                        const purchaseability = getStorefrontProductPurchaseability(item.product, {
                            selectedVariantId: item.variant_id ?? null,
                        });
                        if (!purchaseability.canAddToCart || purchaseability.maxQuantity <= 0) {
                            return item;
                        }
                        const clampedQty = Math.min(
                            quantity,
                            purchaseability.maxQuantity,
                        );
                        return { ...item, quantity: clampedQty };
                    }),
                    lastValidationResult: null,
                }));
            },

            // Vaciar carrito
            clearCart: () => set({ items: [], lastValidationResult: null }),

            // Toggle sidebar
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: (context = {}) => {
                set({ isOpen: true });
                emitConversationConversionEvent({
                    sessionId: context.sessionId ?? null,
                    eventType: 'cart_opened',
                    metadata: {
                        source: context.source ?? 'manual',
                    },
                });
            },
            closeCart: () => set({ isOpen: false }),

            // Cargar items de un pedido anterior al carrito
            loadOrderItems: (orderItems) => {
                set({ items: orderItems.map((i) => ({ 
                    product: i.product, 
                    quantity: i.quantity,
                    variant_id: i.variant_id ?? null,
                    variant_name: i.variant_name ?? null
                })), lastValidationResult: null });
            },

            // â”€â”€â”€ Validar carrito contra la API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
            // Verifica precios, stock y disponibilidad actual
            validateCart: async () => {
                const { items } = get();
                if (items.length === 0) {
                    const emptyResult = { issues: [], hasIssues: false };
                    set({ lastValidationResult: emptyResult });
                    return emptyResult;
                }

                const ids = items.map((item) => item.product.id);

                try {
                    const { getProductsByIds } = await import('@/services/products.service');
                    const currentProducts = await getProductsByIds(ids);
                    const productMap = new Map(currentProducts.map((p) => [p.id, p]));

                    const issues: CartValidationIssue[] = [];
                    const validItems: CartItem[] = [];

                    for (const item of items) {
                        const current = productMap.get(item.product.id);
                        const displayName = item.variant_name
                            ? `${item.product.name} (${item.variant_name})`
                            : item.product.name;

                        if (!current || !current.is_active || current.status === 'discontinued') {
                            issues.push({
                                productId: item.product.id,
                                productName: displayName,
                                type: 'removed',
                            });
                            continue;
                        }

                        const purchaseability = getStorefrontProductPurchaseability(current, {
                            selectedVariantId: item.variant_id ?? null,
                        });

                        if (!purchaseability.canAddToCart) {
                            issues.push({
                                productId: item.product.id,
                                productName: displayName,
                                type: item.variant_id || purchaseability.requiresVariantSelection ? 'variant_removed' : 'out_of_stock',
                            });
                            continue;
                        }

                        if (current.price !== item.product.price) {
                            issues.push({
                                productId: item.product.id,
                                productName: displayName,
                                type: 'price_changed',
                                oldValue: item.product.price,
                                newValue: current.price,
                            });
                        }

                        const clampedQty = Math.min(item.quantity, purchaseability.maxQuantity);
                        if (clampedQty < item.quantity) {
                            issues.push({
                                productId: item.product.id,
                                productName: displayName,
                                type: item.variant_id ? 'variant_stock_adjusted' : 'stock_adjusted',
                                oldValue: item.quantity,
                                newValue: clampedQty,
                            });
                        }

                        validItems.push({
                            product: current,
                            quantity: clampedQty,
                            variant_id: item.variant_id ?? null,
                            variant_name: item.variant_id
                                ? getVariantDisplayName(purchaseability.selectedVariant)
                                : item.variant_name ?? null,
                        });
                    }

                    // Aplicar correcciones al carrito
                    const result = { issues, hasIssues: issues.length > 0 };
                    set({ items: validItems, lastValidationResult: result });

                    return result;
                } catch (err) {
                    console.error('[cart.store] validateCart error:', err);
                    // En caso de error de red, no eliminar items
                    const result = { issues: [], hasIssues: false };
                    set({ lastValidationResult: result });
                    return result;
                }
            },

            clearValidationResult: () => set({ lastValidationResult: null }),

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

// â”€â”€â”€ Selectores memoizados â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Usar estos en componentes para evitar re-renders innecesarios
export const selectTotalItems = (state: CartState) =>
    state.items.reduce((sum, item) => sum + item.quantity, 0);

// Subtotal: suma de productos sin descuentos ni envío
export const selectSubtotal = (state: CartState) =>
    state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

// Total final — actualmente igual a subtotal (descuentos se calculan en checkout)
export const selectTotal = selectSubtotal;

// â”€â”€â”€ Sincronización entre pestañas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            } catch (error) { 
                console.error('[cart.store] Error parsing localStorage cart-storage:', error);
            }
        }
    });
}

