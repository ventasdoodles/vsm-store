/**
 * // ─── HOOK: USE CHECKOUT ───
 * // Proposito: Orquestador del flujo de finalizacion de compra.
 * // Arquitectura: Controller Hook (§1.1).
 * // Responsabilidades: 
 * // - Validacion de stock final.
 * // - Persistencia de ordenes.
 * // - Integracion con Mercado Pago y WhatsApp.
 * // - Gestion de cupones y lealtad.
 */

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useHaptic } from '@/hooks/useHaptic';
import { useCartValidator } from '@/hooks/useCartValidator';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { submitCheckout } from '@/actions/checkout';
import { formatAddress } from '@/hooks/useAddresses';
import { SITE_CONFIG } from '@/config/site';
import { calculateLoyaltyPoints } from '@/lib/domain/loyalty';
import { calculateOrderTotal } from '@/lib/domain/pricing';
import { validateCoupon } from '@/services';
import { mercadopagoService } from '@/services';
import { markWhatsAppSent } from '@/services';
import type { CheckoutFormData, Order } from '@/types/cart';
import type { CheckoutActionItem } from '@/actions/checkout';
import type { Address } from '@/hooks/useAddresses';
import type { CouponValidation } from '@/services';
import type { CartItem } from '@/types/cart';

export interface UseCheckoutOptions {
    onSuccess: () => void;
}

export interface UseCheckoutReturn {
    sent: boolean;
    sending: boolean;
    finalTotal: number;
    discount: number;
    subtotal: number;
    appliedCoupon: CouponValidation | null;
    earnedPoints: number;
    orderId: string | null;
    handleSubmit: (
        formData: CheckoutFormData,
        selectedAddressId: string,
        useNewAddress: boolean,
        shippingAddresses: Address[],
    ) => Promise<void>;
    setAppliedCoupon: (coupon: CouponValidation | null) => void;
}

export function useCheckout({ onSuccess }: UseCheckoutOptions): UseCheckoutReturn {
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const subtotal = useCartStore(selectSubtotal);
    const clearCart = useCartStore((s) => s.clearCart);
    const closeCart = useCartStore((s) => s.closeCart);

    const { user, isAuthenticated } = useAuth();
    const { success, error: notifyError } = useNotification();
    const { trigger: haptic } = useHaptic();
    const { runValidation } = useCartValidator();
    const { data: settings } = useStoreSettings();

    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);

    // Auto-aplicación de cupón de bundle
    useEffect(() => {
        const bundleCoupon = sessionStorage.getItem('active_bundle_coupon');
        if (bundleCoupon && !appliedCoupon) {
            validateCoupon(bundleCoupon, subtotal, user?.id).then(res => {
                if (res.valid) {
                    setAppliedCoupon(res);
                    sessionStorage.removeItem('active_bundle_coupon');
                    haptic('success');
                }
            });
        }
    }, [subtotal, user?.id, appliedCoupon, haptic]);

    const safeSubtotal = typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0;
    const discount = (appliedCoupon?.valid && typeof appliedCoupon.discount === 'number') ? appliedCoupon.discount : 0;
    const finalTotal = calculateOrderTotal(safeSubtotal, discount);
    
    const pointsRatio = settings?.loyalty_config?.points_per_currency;
    const earnedPoints = calculateLoyaltyPoints(finalTotal, typeof pointsRatio === 'number' ? pointsRatio : undefined);

    /**
     * Procesa la orden completa.
     * Separado en fases para mayor legibilidad y mantenibilidad.
     */
    const handleSubmit = useCallback(async (
        formData: CheckoutFormData,
        selectedAddressId: string,
        useNewAddress: boolean,
        shippingAddresses: Address[],
    ) => {
        if (sending) return;
        setSending(true);

        try {
            // FASE 1: Validación de Stock
            const validation = await runValidation();
            if (validation.hasIssues) {
                const hasCritical = validation.issues.some(i => i.type === 'removed' || i.type === 'out_of_stock');
                if (hasCritical) {
                    console.warn('[Checkout] Inventario insuficiente:', validation.issues);
                    notifyError('Inventario actualizado', 'Algunos productos ya no están disponibles. Revisa tu carrito.');
                    setSending(false);
                    return;
                }
            }

            // FASE 2: Construcción de Objeto de Orden
            const orderObj: Order = {
                ...formData,
                id: Date.now().toString(36).toUpperCase(),
                items,
                subtotal,
                total: finalTotal,
                createdAt: new Date().toISOString(),
            };

            if (isAuthenticated && formData.deliveryType === 'delivery' && !useNewAddress && selectedAddressId) {
                const addr = shippingAddresses.find((a: Address) => a.id === selectedAddressId);
                if (addr) orderObj.address = formatAddress(addr);
            }

                        // FASE 3: Persistencia en Base de Datos (Secure Submission Bridge)
            let dbOrderId: string | undefined;
            if (isAuthenticated && user) {
                const checkoutItems: CheckoutActionItem[] = items.map((item: CartItem) => ({
                    product_id: item.product.id,
                    variant_id: item.variant_id ?? null,
                    variant_name: item.variant_name ?? null,
                    quantity: item.quantity,
                }));

                const shippingAddressText = useNewAddress
                    ? formData.address
                    : undefined;

                const result = await submitCheckout({
                    form: formData,
                    items: checkoutItems,
                    shippingAddressId: (!useNewAddress && selectedAddressId && selectedAddressId.trim().length > 10)
                        ? selectedAddressId
                        : null,
                    shippingAddressText,
                    couponCode: appliedCoupon?.valid ? (appliedCoupon.coupon_code ?? null) : null,
                });

                if (!result.ok) {
                    notifyError('Error de procesamiento', result.message || 'No se pudo crear el pedido.');
                    setSending(false);
                    return;
                }

                dbOrderId = result.orderId;
                if (dbOrderId) setOrderId(dbOrderId);
            }

            // FASE 4: Procesamiento de Pago / Redirección
            if (formData.paymentMethod === 'mercadopago' && dbOrderId) {
                const { init_point } = await mercadopagoService.createPayment(dbOrderId);
                window.location.href = init_point;
                return;
            }

            // FASE 5: Canal de Finalización (WhatsApp)
            const waNumber = settings?.whatsapp_number || SITE_CONFIG.whatsapp.number;
            const message = SITE_CONFIG.orderWhatsApp.generateMessage(orderObj);
            window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`, '_blank');

            if (dbOrderId) {
                await markWhatsAppSent(dbOrderId).catch(() => { });
            }

            // FASE 6: Post-procesamiento
            haptic('success');
            success('¡Pedido creado!', 'Tu pedido ha sido registrado correctamente.');

            const { trackEvent } = await import('@/lib/analytics');
            trackEvent({
                action: 'purchase',
                params: {
                    transaction_id: dbOrderId || orderObj.id,
                    value: finalTotal,
                    items: items.map(i => ({ item_id: i.product.id, item_name: i.product.name, price: i.product.price, quantity: i.quantity })),
                },
            });

            setSent(true);
            setTimeout(() => {
                clearCart();
                closeCart();
                if (dbOrderId) navigate(`/payment/success?order_id=${dbOrderId}`);
                onSuccess();
                setSending(false);
            }, 2000);

        } catch (err: unknown) {
            const error = err instanceof Error ? err : new Error(String(err));
            const supabaseError = err as { details?: string; hint?: string; code?: string };
            
            console.error('[Checkout] ERROR CRÍTICO:', {
                message: error.message,
                details: supabaseError.details,
                hint: supabaseError.hint,
                code: supabaseError.code,
                stack: error.stack,
                full: err
            });
            
            let userMessage = 'Hubo un problema al crear tu pedido. ';
            if (supabaseError.code === '22P02') userMessage += '(Error de Formato de Datos)';
            if (supabaseError.code === '42501') userMessage += '(Error de Permisos/RLS)';
            if (error.message?.includes('network')) userMessage += '(Error de red)';
            
            notifyError('Error de procesamiento', userMessage + ' Por favor intenta de nuevo.');
            setSending(false);
        }
    }, [
        items, subtotal, finalTotal, discount, earnedPoints, appliedCoupon,
        isAuthenticated, user, settings,
        runValidation, haptic, success, notifyError,
        clearCart, closeCart, navigate, onSuccess, sending
    ]);

    return {
        sent,
        sending,
        finalTotal,
        discount,
        subtotal,
        appliedCoupon,
        earnedPoints,
        orderId,
        handleSubmit,
        setAppliedCoupon,
    };
}

