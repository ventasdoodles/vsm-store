// ─── useCheckout ─────────────────────────────────
// Orquesta todo el flujo de checkout: validación de carrito, creación de orden,
// cupones, pago MercadoPago, envío WhatsApp, puntos de lealtad, analytics.
// Extrae la lógica de negocio de CheckoutForm.tsx para que el componente sea solo UI.

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';
import { useHaptic } from '@/hooks/useHaptic';
import { useCartValidator } from '@/hooks/useCartValidator';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatAddress } from '@/hooks/useAddresses';
import { SITE_CONFIG } from '@/config/site';
import { calculateLoyaltyPoints } from '@/lib/domain/loyalty';
import { calculateOrderTotal } from '@/lib/domain/pricing';
import { applyCoupon } from '@/services/coupons.service';
import { mercadopagoService } from '@/services/payments/mercadopago.service';
import { markWhatsAppSent } from '@/services/orders.service';
import type { CheckoutFormData, Order } from '@/types/cart';
import type { Address } from '@/hooks/useAddresses';
import type { CouponValidation } from '@/services/coupons.service';
import type { CartItem } from '@/types/cart';

export interface UseCheckoutOptions {
    onSuccess: () => void;
}

export interface UseCheckoutReturn {
    /** Whether the order was successfully submitted */
    sent: boolean;
    /** Whether the submission is in progress */
    sending: boolean;
    /** Final total after discount */
    finalTotal: number;
    /** Discount amount from applied coupon */
    discount: number;
    /** Subtotal before discount */
    subtotal: number;
    /** Applied coupon data */
    appliedCoupon: CouponValidation | null;
    /** Earned loyalty points for this order */
    earnedPoints: number;
    /** Submit the order */
    handleSubmit: (
        formData: CheckoutFormData,
        selectedAddressId: string,
        useNewAddress: boolean,
        shippingAddresses: Address[],
    ) => Promise<void>;
    /** Mark a coupon as applied */
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
    const createOrderMutation = useCreateOrder();

    const [sent, setSent] = useState(false);
    const [sending, setSending] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState<CouponValidation | null>(null);

    const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0;
    const finalTotal = calculateOrderTotal(subtotal, discount);
    const earnedPoints = calculateLoyaltyPoints(finalTotal, settings?.loyalty_config?.points_per_currency);

    const handleSubmit = useCallback(async (
        formData: CheckoutFormData,
        selectedAddressId: string,
        useNewAddress: boolean,
        shippingAddresses: Address[],
    ) => {
        setSending(true);

        // 1. Validar carrito contra API
        try {
            const validation = await runValidation();
            if (validation.hasIssues) {
                const hasCritical = validation.issues.some(
                    (i) => i.type === 'removed' || i.type === 'out_of_stock'
                );
                if (hasCritical) {
                    notifyError('Carrito actualizado', 'Algunos productos cambiaron. Revisa tu carrito antes de continuar.');
                    setSending(false);
                    return;
                }
            }
        } catch {
            // Si falla la validación por red, permitir continuar
        }

        try {
            // 2. Construir objeto local de orden (para WhatsApp message generation)
            const order: Order = {
                ...formData,
                id: Date.now().toString(36).toUpperCase(),
                items,
                subtotal,
                total: finalTotal,
                createdAt: new Date().toISOString(),
            };

            // Usar dirección guardada
            if (isAuthenticated && formData.deliveryType === 'delivery' && !useNewAddress && selectedAddressId) {
                const addr = shippingAddresses.find((a: Address) => a.id === selectedAddressId);
                if (addr) order.address = formatAddress(addr);
            }

            // 3. Crear en Supabase si autenticado
            let dbOrderId: string | undefined;
            if (isAuthenticated && user) {
                const dbOrder = await createOrderMutation.mutateAsync({
                    customer_id: user.id,
                    items: items.map((item: CartItem) => ({
                        product_id: item.product.id,
                        variant_id: item.variant_id,
                        variant_name: item.variant_name,
                        name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                        image: item.product.images?.[0],
                        section: item.product.section,
                    })),
                    subtotal,
                    discount,
                    total: finalTotal,
                    payment_method: formData.paymentMethod,
                    shipping_address_id: (!useNewAddress && selectedAddressId) ? selectedAddressId : undefined,
                    earned_points: earnedPoints,
                });
                dbOrderId = dbOrder.id;

                // 4. Registrar uso de cupón
                if (appliedCoupon?.valid && appliedCoupon.coupon_id) {
                    await applyCoupon(formData.customerName, user.id, dbOrder.id).catch(() => { });
                }
            }

            // 5. Si es Mercado Pago, generar link y redirigir
            if (formData.paymentMethod === 'mercadopago' && dbOrderId) {
                const { init_point } = await mercadopagoService.createPayment(dbOrderId);

                // Validate redirect URL to prevent open redirect attacks
                try {
                    const url = new URL(init_point);
                    if (!url.hostname.endsWith('.mercadopago.com') && !url.hostname.endsWith('.mercadolibre.com')) {
                        throw new Error('URL de pago no válida');
                    }
                } catch {
                    throw new Error('URL de pago no válida');
                }

                window.location.href = init_point;
                return;
            }

            // 6. WhatsApp (default flow)
            const waNumber = settings?.whatsapp_number || SITE_CONFIG.whatsapp.number;
            const message = SITE_CONFIG.orderWhatsApp.generateMessage(order);
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/${waNumber}?text=${encodedMessage}`, '_blank');

            if (dbOrderId) {
                await markWhatsAppSent(dbOrderId).catch(() => { });
            }

            haptic('success');
            success('¡Pedido creado!', 'Tu pedido ha sido registrado. Te contactaremos por WhatsApp.');

            // 7. Analytics: Purchase
            import('@/lib/analytics').then(({ trackEvent }) => {
                trackEvent({
                    action: 'purchase',
                    params: {
                        transaction_id: order.id,
                        value: finalTotal,
                        currency: 'MXN',
                        coupon: appliedCoupon?.valid ? 'applied' : undefined,
                        items: items.map((item: CartItem) => ({
                            item_id: item.product.id,
                            item_name: item.product.name,
                            price: item.product.price,
                            quantity: item.quantity,
                        })),
                    },
                });
            });

            setSent(true);
            setTimeout(() => {
                clearCart();
                closeCart();
                if (dbOrderId) navigate(`/orders/${dbOrderId}`);
                onSuccess();
            }, 2500);
        } catch (err) {
            console.error('Error creando orden:', err);
            notifyError('Error', 'No se pudo procesar tu pedido. Inténtalo de nuevo.');
            // NO borrar carrito en error — el usuario debe poder reintentar
        } finally {
            setSending(false);
        }
    }, [
        items, subtotal, finalTotal, discount, earnedPoints, appliedCoupon,
        isAuthenticated, user, settings, createOrderMutation,
        runValidation, haptic, success, notifyError,
        clearCart, closeCart, navigate, onSuccess,
    ]);

    return {
        sent,
        sending,
        finalTotal,
        discount,
        subtotal,
        appliedCoupon,
        earnedPoints,
        handleSubmit,
        setAppliedCoupon,
    };
}
