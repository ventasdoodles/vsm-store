import { useState } from 'react';
import { ShoppingBag, ChevronDown } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { cn, formatPrice } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { CheckoutTransitionStatus } from '@/components/cart/CheckoutTransitionStatus';
import { OpenRecoverableOrderNotice } from '@/components/cart/OpenRecoverableOrderNotice';
import type { CartItem } from '@/types/cart';
import type { StorefrontCheckoutTransitionView } from '@/lib/domain/cart';
import type { StorefrontOpenOrderRecoveryView } from '@/lib/domain/orders';
import type { OrderRecord } from '@/hooks/useOrders';

interface CheckoutMobileSummaryProps {
    openRecoverableOrder?: OrderRecord | null;
    openOrderRecoveryView?: StorefrontOpenOrderRecoveryView | null;
    transitionView: StorefrontCheckoutTransitionView;
    onDependencyAction: (missingProduct: NonNullable<StorefrontCheckoutTransitionView['dependencyGuidance']>['missingProduct']) => void;
    displayItems: CartItem[];
    displaySubtotal: number;
}

export function CheckoutMobileSummary({
    openRecoverableOrder,
    openOrderRecoveryView,
    transitionView,
    onDependencyAction,
    displayItems,
    displaySubtotal,
}: CheckoutMobileSummaryProps) {
    const [showSummaryMobile, setShowSummaryMobile] = useState(false);

    return (
        <div className="lg:hidden mb-6">
            {openRecoverableOrder && openOrderRecoveryView?.shouldRecover && (
                <div className="mb-4">
                    <OpenRecoverableOrderNotice
                        order={openRecoverableOrder}
                        view={openOrderRecoveryView}
                        compact
                    />
                </div>
            )}
            <div className="mb-4">
                <CheckoutTransitionStatus
                    view={transitionView}
                    onDependencyAction={onDependencyAction}
                />
            </div>
            <button
                onClick={() => setShowSummaryMobile(!showSummaryMobile)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-md"
            >
                <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-vape-400" />
                    <span className="text-sm font-bold text-white">Ver resumen del pedido</span>
                    <ChevronDown className={cn("h-4 w-4 text-theme-tertiary transition-transform", showSummaryMobile && "rotate-180")} />
                </div>
                <span className="font-black text-white">{formatPrice(displaySubtotal)}</span>
            </button>

            <AnimatePresence>
                {showSummaryMobile && (
                    <m.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-x border-b border-white/5 bg-white/[0.01] rounded-b-2xl mx-1"
                    >
                        <div className="p-4 space-y-4">
                            {displayItems.length > 0 ? displayItems.map(item => (
                                <div key={`${item.product.id}-${item.variant_id || 'base'}`} className="flex gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                                        <OptimizedImage 
                                            src={item.product.images?.[0] || ''} 
                                            width={100} 
                                            alt={item.product.name}
                                            containerClassName="h-full w-full"
                                            className="h-full w-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-white truncate">{item.product.name}</p>
                                        <p className="text-[10px] text-theme-tertiary">Cantidad: {item.quantity}</p>
                                    </div>
                                    <span className="text-xs font-bold text-white">{formatPrice(item.product.price * item.quantity)}</span>
                                </div>
                            )) : (
                                <p className="text-xs font-medium text-theme-tertiary">
                                    Tu carrito ya no tiene articulos comprables vigentes. Revisa el catalogo antes de continuar.
                                </p>
                            )}
                        </div>
                    </m.div>
                )}
            </AnimatePresence>
        </div>
    );
}
