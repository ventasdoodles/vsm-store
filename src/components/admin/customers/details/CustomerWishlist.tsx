/**
 * CustomerWishlist — Lista de Favoritos del Cliente
 * 
 * Muestra los productos que el cliente ha marcado como favoritos.
 * Los datos se sincronizan desde el storefront (localStorage → DB)
 * cuando el usuario inicia sesión.
 * 
 * @module admin/customers/details
 */
import { useQuery } from '@tanstack/react-query';
import { getCustomerWishlist } from '@/services/admin';
import { Heart, ExternalLink, Loader2, Package } from 'lucide-react';
import { formatPrice, optimizeImage } from '@/lib/utils';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerWishlist({ customer }: Props) {
    const { data: items = [], isLoading } = useQuery({
        queryKey: ['admin', 'customer', customer.id, 'wishlist'],
        queryFn: () => getCustomerWishlist(customer.id),
        enabled: !!customer.id,
        staleTime: 60_000,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-[#13141f]/50 border border-white/5 rounded-[2rem] min-h-[150px]">
                <Loader2 className="w-6 h-6 animate-spin text-rose-500 mb-2" />
                <p className="text-xs text-theme-secondary">Cargando favoritos...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="rounded-[2rem] border border-white/5 bg-[#13141f]/50 p-6 flex items-center justify-center min-h-[120px] shadow-inner">
                <div className="text-center">
                    <Heart className="w-6 h-6 text-theme-secondary/30 mx-auto mb-2" />
                    <p className="text-sm font-medium text-white mb-0.5">Sin favoritos registrados</p>
                    <p className="text-[10px] text-theme-secondary">
                        Los favoritos se sincronizan cuando el cliente inicia sesión.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl p-6 shadow-2xl">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <div className="relative mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/5 border border-rose-500/20 shadow-inner">
                        <Heart className="h-5 w-5 text-rose-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Wishlist</h3>
                        <p className="text-xs text-theme-secondary/70">{items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide">
                {items.map(({ product, created_at }) => (
                    <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-rose-500/20 transition-all group"
                    >
                        {/* Thumbnail */}
                        <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                            {(product.cover_image || product.images?.[0]) ? (
                                <img
                                    src={optimizeImage(product.cover_image || product.images[0], { width: 96, height: 96, quality: 70, format: 'webp' }) ?? ''}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    onError={(e) => {
                                        const img = e.currentTarget;
                                        const original = product.cover_image || product.images[0];
                                        if (original && img.src !== original) img.src = original;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-4 h-4 text-white/20" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{product.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-white/80">{formatPrice(product.price)}</span>
                                {product.compare_at_price && (
                                    <span className="text-[10px] text-white/30 line-through">{formatPrice(product.compare_at_price)}</span>
                                )}
                                {!product.is_active && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Inactivo</span>
                                )}
                                {product.stock === 0 && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">Agotado</span>
                                )}
                            </div>
                            <p className="text-[10px] text-white/25 mt-0.5">
                                Agregado {new Date(created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>

                        {/* Link to storefront */}
                        <a
                            href={`/${product.section}/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2 rounded-lg text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                            title="Ver en tienda"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
