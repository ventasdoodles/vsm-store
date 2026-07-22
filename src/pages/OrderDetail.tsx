/**
 * // ─── PÁGINA: ORDER DETAIL ───
 * // Propósito: Visualización detallada de una adquisición (Recibo Cinemático).
 * // Arquitectura: Pure presentation with domain hooks integration (§1.1).
 * // Estilo: High-End Premium Receipt & Cinematic Timeline (§2.1).
 */
import { useEffect } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { 
    ArrowLeft, 
    Loader2, 
    Clock,
    XCircle,
    Package, 
    Truck, 
    ShieldCheck,
    Zap,
    type LucideIcon
} from 'lucide-react';
import { useOrderWithCrossSurfaceReconciliation, ORDER_STATUS } from '@/hooks/useOrders';
import { useStorefrontPaymentReentry } from '@/hooks/useStorefrontPaymentReentry';
import {
    getStorefrontOrderLifecycleView,
    getStorefrontOrdersIndexActionView,
    getStorefrontOrderFreshnessView,
} from '@/lib/domain/orders';
import { useAuthenticatedOrderReorder } from '@/hooks/useAuthenticatedOrderReorder';
import { SEO } from '@/components/seo/SEO';
import { SITE_CONFIG } from '@/config/site';
import { getStorefrontOrderTrackingTrustView } from '@/services/storefront-order-tracking.service';
import type { OrderStatus, OrderItem } from '@/hooks/useOrders';

import { OrderHeader } from '@/components/orders/detail/OrderHeader';
import { OrderStatusBanner } from '@/components/orders/detail/OrderStatusBanner';
import { OrderTimeline } from '@/components/orders/detail/OrderTimeline';
import { OrderShippingCard } from '@/components/orders/detail/OrderShippingCard';
import { OrderSummaryCard } from '@/components/orders/detail/OrderSummaryCard';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_ICONS: Record<OrderStatus, LucideIcon> = {
    pending: Clock,
    confirmed: ShieldCheck,
    processing: Zap,
    shipped: Truck,
    delivered: Package,
    cancelled: XCircle
};

export function OrderDetail() {
    const { orderId } = useParams({ strict: false }) as any;
    const { data: order, isLoading } = useOrderWithCrossSurfaceReconciliation(orderId);
    const { reorderOrder, reorderingOrderId } = useAuthenticatedOrderReorder();
    const { continuePayment, continuingOrderId } = useStorefrontPaymentReentry();

    useEffect(() => {
        if (order) document.title = `Pedido ${order.order_number} | VSM Store`;
        return () => { document.title = 'VSM Store'; };
    }, [order]);

    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-accent-primary" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-theme-tertiary animate-pulse">Consultando Archivo...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container-vsm py-32 text-center space-y-6">
                <div className="mx-auto w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <Package size={40} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic">Adquisición No Encontrada</h2>
                <Link to={"/orders" as any} className="vsm-button-primary inline-flex">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver a Bitácora
                </Link>
            </div>
        );
    }

    const currentStatus = order.status as OrderStatus;
    const statusConfig = ORDER_STATUS[currentStatus] ?? ORDER_STATUS.pending;
    const isCancelled = currentStatus === 'cancelled';
    const currentStepIndex = STATUS_STEPS.indexOf(currentStatus);
    const items = (Array.isArray(order.items) ? order.items : []) as OrderItem[];
    const lifecycleView = getStorefrontOrderLifecycleView(order);
    const indexActionView = getStorefrontOrdersIndexActionView(order);
    const freshnessView = getStorefrontOrderFreshnessView(order);
    const paymentView = lifecycleView.paymentView;
    const continuationView = lifecycleView.continuationView;
    const trackingTrustView = getStorefrontOrderTrackingTrustView(order);
    const canContinuePayment = continuationView.canContinue;
    const canReorder = indexActionView.showReorder;
    const continuingPayment = continuingOrderId === order.id;

    const handleReorder = async () => {
        await reorderOrder({
            id: order.id,
            items,
        });
    };

    const handleWhatsApp = () => {
        const msg = `Hola, tengo una consulta sobre mi pedido *${order.order_number}* de fecha ${new Date(order.created_at).toLocaleDateString()}.`;
        window.open(`https://wa.me/${SITE_CONFIG.whatsapp.number}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const handleContinuePayment = async () => {
        if (!canContinuePayment) return;
        await continuePayment(order);
    };

    return (
        <div className="container-vsm py-12 space-y-12 max-w-4xl">
            <SEO title={`Pedido ${order.order_number}`} />

            <OrderHeader
                orderNumber={order.order_number}
                createdAt={order.created_at}
                statusConfig={statusConfig}
            />

            <OrderStatusBanner
                currentStatus={currentStatus}
                statusConfig={statusConfig}
                statusIcons={STATUS_ICONS}
                paymentView={paymentView}
                freshnessView={freshnessView}
            />

            {!isCancelled && (
                <OrderTimeline
                    statusSteps={STATUS_STEPS}
                    currentStepIndex={currentStepIndex}
                    statusConfigMap={ORDER_STATUS}
                    statusIcons={STATUS_ICONS}
                />
            )}

            <OrderShippingCard trackingTrustView={trackingTrustView} />

            <OrderSummaryCard
                orderNumber={order.order_number}
                items={items}
                subtotal={order.subtotal}
                shippingCost={order.shipping_cost}
                discount={order.discount}
                total={order.total}
                paymentMethod={order.payment_method}
                paymentView={paymentView}
                continuationView={continuationView}
                canContinuePayment={canContinuePayment}
                continuingPayment={continuingPayment}
                canReorder={canReorder}
                reorderingOrderId={reorderingOrderId}
                orderId={order.id}
                onContinuePayment={handleContinuePayment}
                onReorder={handleReorder}
                onWhatsApp={handleWhatsApp}
            />
        </div>
    );
}
