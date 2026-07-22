import { useNavigate } from '@tanstack/react-router';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { CheckoutTransitionStatus } from '@/components/cart/CheckoutTransitionStatus';
import { OpenRecoverableOrderNotice } from '@/components/cart/OpenRecoverableOrderNotice';
import { SEO } from '@/components/seo/SEO';
import { useCartStore, selectSubtotal } from '@/stores/cart.store';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useRef } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { getStorefrontCheckoutTransitionView } from '@/lib/domain/cart';
import { getStorefrontOpenOrderRecoveryView } from '@/lib/domain/orders';
import { useOpenRecoverableOrder } from '@/hooks/useOrders';
import { useStorefrontCartDependencyOffer } from '@/hooks/useStorefrontCartDependencyOffer';
import { emitConversationConversionEvent, getCesarinSessionId } from '@/lib/conversion-measurement';
import { getStoreMetaCopy } from '@/constants/storeMeta';
import { useActiveVerticalPack } from '@/contexts/VerticalPackContext';
import { CheckoutHeader } from '@/components/checkout/CheckoutHeader';
import { CheckoutMobileSummary } from '@/components/checkout/CheckoutMobileSummary';
import { CheckoutDesktopSummary } from '@/components/checkout/CheckoutDesktopSummary';
import { CheckoutBlockedState } from '@/components/checkout/CheckoutBlockedState';

export function Checkout() {
    const { config } = useActiveVerticalPack();
    const storeMetaCopy = config ? getStoreMetaCopy(config) : null;
    const navigate = useNavigate();
    const items = useCartStore((s) => s.items);
    const lastValidationResult = useCartStore((s) => s.lastValidationResult);
    const subtotal = useCartStore(selectSubtotal);
    const { user, isAuthenticated } = useAuth();
    const { data: openRecoverableOrder } = useOpenRecoverableOrder(isAuthenticated ? user?.id : undefined);
    const { data: cartDependencyOffer } = useStorefrontCartDependencyOffer(items);
    const checkoutStarted = useRef(false);
    const checkoutStartedMeasured = useRef(false);
    const transitionView = getStorefrontCheckoutTransitionView(items, lastValidationResult, cartDependencyOffer ?? null);
    const canContinueCheckout = transitionView.canSubmitCheckout;
    const displayItems = canContinueCheckout ? items : [];
    const displaySubtotal = canContinueCheckout && items.length > 0 ? subtotal : 0;
    const openOrderRecoveryView = openRecoverableOrder
        ? getStorefrontOpenOrderRecoveryView(openRecoverableOrder)
        : null;

    const { warning } = useNotification();

    // Mark that checkout is in progress once we have items
    useEffect(() => {
        if (items.length > 0) checkoutStarted.current = true;
    }, [items]);

    useEffect(() => {
        if (checkoutStartedMeasured.current || items.length === 0) return;

        checkoutStartedMeasured.current = true;
        const sessionId = getCesarinSessionId();
        emitConversationConversionEvent({
            sessionId,
            eventType: 'checkout_started',
            metadata: {
                source: sessionId ? 'cesarin' : 'manual',
                cart_value: subtotal,
                item_count: items.reduce((total, item) => total + item.quantity, 0),
            },
        });
    }, [items, subtotal]);

    // Redirect if cart is empty on initial load
    useEffect(() => {
        if (items.length === 0 && !checkoutStarted.current) {
            warning('Carrito vacío', 'Agrega productos para continuar con tu compra.');
            navigate({ to: '/' });
        }
    }, [items, navigate, warning]);

    const handleOpenDependencyProduct = (missingProduct: NonNullable<typeof transitionView.dependencyGuidance>['missingProduct']) => {
        navigate({ 
            to: '/$section/$slug', 
            params: { section: missingProduct.section, slug: missingProduct.slug } 
        });
    };

    if (!config || !storeMetaCopy) return null; // Wait for config

    return (
        <div className="min-h-screen bg-theme-main pb-20 pt-20 md:pt-24 lg:pt-28">
            <SEO title="Finalizar Compra" description={storeMetaCopy.checkout.seoDescription} />

            <div className="container-vsm max-w-7xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-20">

                    {/* LEFTSIDE: Checkout Form */}
                    <div className="flex-1 lg:max-w-xl">
                        <CheckoutHeader onBack={() => navigate({ to: '..' })} />

                        <CheckoutMobileSummary
                            openRecoverableOrder={openRecoverableOrder}
                            openOrderRecoveryView={openOrderRecoveryView}
                            transitionView={transitionView}
                            onDependencyAction={handleOpenDependencyProduct}
                            displayItems={displayItems}
                            displaySubtotal={displaySubtotal}
                        />

                        <div className="hidden lg:block mb-6">
                            {openRecoverableOrder && openOrderRecoveryView?.shouldRecover && (
                                <div className="mb-4">
                                    <OpenRecoverableOrderNotice
                                        order={openRecoverableOrder}
                                        view={openOrderRecoveryView}
                                    />
                                </div>
                            )}
                            <CheckoutTransitionStatus
                                view={transitionView}
                                onDependencyAction={handleOpenDependencyProduct}
                            />
                        </div>

                        {/* Main Form container */}
                        {canContinueCheckout ? (
                            <CheckoutForm
                                onSuccess={() => { }}
                                onBack={() => navigate({ to: '..' })}
                                openRecoverableOrder={openRecoverableOrder ?? null}
                            />
                        ) : (
                            <CheckoutBlockedState
                                headline={transitionView.headline}
                                detail={transitionView.detail}
                                onGoToCatalog={() => navigate({ to: '/' })}
                            />
                        )}
                    </div>

                    {/* RIGHTSIDE: Sticky Summary (Desktop) */}
                    <CheckoutDesktopSummary
                        displayItems={displayItems}
                        displaySubtotal={displaySubtotal}
                        canContinueCheckout={canContinueCheckout}
                    />
                </div>
            </div>
        </div>
    );
}
