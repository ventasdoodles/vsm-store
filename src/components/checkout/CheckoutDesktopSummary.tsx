import { m } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import type { CartItem } from '@/types/cart';

interface CheckoutDesktopSummaryProps {
    displayItems: CartItem[];
    displaySubtotal: number;
    canContinueCheckout: boolean;
}

export function CheckoutDesktopSummary({
    displayItems,
    displaySubtotal,
    canContinueCheckout,
}: CheckoutDesktopSummaryProps) {
    return (
        <div className="hidden lg:block w-full lg:w-[400px] xl:w-[450px]">
            <div className="sticky top-28 xl:top-32 space-y-6">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-2xl shadow-2xl">
                    <div className="border-b border-white/5 bg-white/[0.02] px-8 py-6">
                        <h3 className="text-lg font-black tracking-tight text-white uppercase italic">Tu Pedido</h3>
                    </div>

                    <div className="max-h-[40vh] overflow-y-auto scrollbar-thin px-8 py-6 space-y-6">
                        {displayItems.length > 0 ? displayItems.map((item) => (
                            <m.div
                                key={`${item.product.id}-${item.variant_id || 'base'}`}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-5"
                            >
                                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5 group">
                                    <OptimizedImage
                                        src={item.product.images?.[0] || ''}
                                        alt={item.product.name}
                                        width={150}
                                        height={150}
                                        containerClassName="h-full w-full"
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-vape-500 text-[10px] font-black text-slate-900 shadow-lg z-10">
                                        {item.quantity}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                    <h4 className="text-sm font-bold leading-tight text-white truncate">{item.product.name}</h4>
                                    {item.variant_name && (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-vape-400">{item.variant_name}</p>
                                    )}
                                    <p className="text-xs font-medium text-theme-tertiary">{formatPrice(item.product.price)} c/u</p>
                                </div>
                                <span className="text-sm font-black text-white">{formatPrice(item.product.price * item.quantity)}</span>
                            </m.div>
                        )) : (
                            <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
                                <p className="text-sm font-medium text-theme-tertiary">
                                    Tu carrito ya no tiene articulos comprables vigentes. Revisa el catalogo antes de continuar.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-white/5 bg-black/20 p-8 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-theme-tertiary">Subtotal</span>
                            <span className="font-bold text-white">{formatPrice(displaySubtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="font-medium text-theme-tertiary">Envío</span>
                            <span className="font-bold text-herbal-400 underline decoration-dotted underline-offset-4 cursor-help">Calculado al confirmar</span>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400 mb-1">Total estimado</p>
                                <p className="text-3xl font-black text-white tracking-tighter">{formatPrice(displaySubtotal)}</p>
                            </div>
                            {canContinueCheckout && (
                                <div className="text-right">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-vape-500/10 px-3 py-1 text-[10px] font-bold text-vape-400 border border-vape-500/20">
                                        Pagarás en MXN
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Trust Badge */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 text-center">
                    <p className="text-[10px] font-medium text-theme-tertiary leading-relaxed italic">
                        Estás en una zona segura de VSM Store. Todos tus datos están encriptados y protegidos por Supabase 256-bit SSL.
                    </p>
                </div>
            </div>
        </div>
    );
}
