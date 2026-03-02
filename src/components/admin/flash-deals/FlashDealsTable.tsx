/**
 * // ─── COMPONENTE: FlashDealsTable ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Tabla glassmorphism de ofertas flash con thumbnail, precios,
 *    descuento %, barra de stock, status badge, y acciones (edit, toggle, delete).
 * // Regla / Notas: Props tipadas. Sin `any`. Tema naranja/rojo.
 */
import {
    Zap, Package, Pencil, Trash2, ToggleLeft, ToggleRight, AlertTriangle,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { FlashDeal } from '@/services/admin/admin-flash-deals.service';

interface FlashDealsTableProps {
    deals: FlashDeal[];
    isLoading: boolean;
    onEdit: (deal: FlashDeal) => void;
    onToggle: (id: string, currentActive: boolean) => void;
    onDelete: (id: string, name: string) => void;
    togglingId?: string;
    deletingId?: string;
}

/** Status helper */
function getDealStatus(deal: FlashDeal): { label: string; cls: string } {
    const now = Date.now();
    const start = new Date(deal.starts_at).getTime();
    const end = new Date(deal.ends_at).getTime();

    if (!deal.is_active) return { label: 'Inactiva', cls: 'bg-white/5 text-white/30 ring-white/10' };
    if (now < start) return { label: 'Programada', cls: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' };
    if (now > end) return { label: 'Expirada', cls: 'bg-red-500/10 text-red-400 ring-red-500/20' };
    if (deal.sold_count >= deal.max_qty) return { label: 'Agotada', cls: 'bg-amber-500/10 text-amber-400 ring-amber-500/20' };
    return { label: 'En vivo', cls: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' };
}

export function FlashDealsTable({
    deals,
    isLoading,
    onEdit,
    onToggle,
    onDelete,
    togglingId,
    deletingId,
}: FlashDealsTableProps) {
    /* ── Loading ── */
    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-[1.25rem] bg-white/5 border border-white/5" />
                ))}
            </div>
        );
    }

    /* ── Empty ── */
    if (deals.length === 0) {
        return (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 py-16 backdrop-blur-md">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[80px]" />
                <Zap className="relative z-10 mb-4 h-14 w-14 text-orange-500/20" />
                <p className="relative z-10 text-sm font-medium text-white/40">No hay ofertas flash creadas</p>
                <p className="relative z-10 mt-1 text-xs text-white/20">Crea tu primera oferta con el botón "Nueva Oferta"</p>
            </div>
        );
    }

    /* ── Table ── */
    return (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/5 bg-theme-primary/10 backdrop-blur-md shadow-xl">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            <th className="px-4 py-3.5 text-left text-[11px] font-bold text-white/30 uppercase tracking-wider">Producto</th>
                            <th className="px-4 py-3.5 text-right text-[11px] font-bold text-white/30 uppercase tracking-wider">Original</th>
                            <th className="px-4 py-3.5 text-right text-[11px] font-bold text-white/30 uppercase tracking-wider">Flash</th>
                            <th className="px-4 py-3.5 text-center text-[11px] font-bold text-white/30 uppercase tracking-wider">Dcto</th>
                            <th className="px-4 py-3.5 text-center text-[11px] font-bold text-white/30 uppercase tracking-wider">Stock</th>
                            <th className="px-4 py-3.5 text-center text-[11px] font-bold text-white/30 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3.5 text-center text-[11px] font-bold text-white/30 uppercase tracking-wider">Fechas</th>
                            <th className="px-4 py-3.5 text-right text-[11px] font-bold text-white/30 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {deals.map((deal) => {
                            const product = deal.product;
                            const originalPrice = product?.price ?? 0;
                            const discountPercent = originalPrice > 0
                                ? Math.round(((originalPrice - deal.flash_price) / originalPrice) * 100)
                                : 0;
                            const soldPercent = deal.max_qty > 0
                                ? Math.round((deal.sold_count / deal.max_qty) * 100)
                                : 0;
                            const status = getDealStatus(deal);
                            const isToggling = togglingId === deal.id;
                            const isDeleting = deletingId === deal.id;

                            return (
                                <tr key={deal.id} className={cn(
                                    'transition-colors hover:bg-white/[0.03]',
                                    !deal.is_active && 'opacity-40',
                                )}>
                                    {/* Product */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-[0.75rem] border border-white/10 bg-white/5 shadow-inner">
                                                {product?.images?.[0] ? (
                                                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <Package className="h-4 w-4 text-white/20" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold text-white max-w-[180px]">{product?.name ?? '—'}</p>
                                                <p className="text-xs text-white/30">{product?.section?.toUpperCase()}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Original price */}
                                    <td className="px-4 py-3 text-right">
                                        <span className="text-white/40 line-through text-xs">{formatPrice(originalPrice)}</span>
                                    </td>

                                    {/* Flash price */}
                                    <td className="px-4 py-3 text-right">
                                        <span className="font-bold text-orange-400">{formatPrice(deal.flash_price)}</span>
                                    </td>

                                    {/* Discount */}
                                    <td className="px-4 py-3 text-center">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-black text-red-400 ring-1 ring-inset ring-red-500/20">
                                            <Zap className="h-3 w-3" />
                                            -{discountPercent}%
                                        </span>
                                    </td>

                                    {/* Stock bar */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="text-xs text-white/50">{deal.sold_count}/{deal.max_qty}</span>
                                            <div className="h-1.5 w-16 rounded-full bg-white/10 overflow-hidden">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full transition-all',
                                                        soldPercent >= 80 ? 'bg-red-500' : soldPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500',
                                                    )}
                                                    style={{ width: `${Math.min(soldPercent, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3 text-center">
                                        <span className={cn(
                                            'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold ring-1 ring-inset',
                                            status.cls,
                                        )}>
                                            {status.label}
                                        </span>
                                    </td>

                                    {/* Dates */}
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex flex-col text-[10px] text-white/30">
                                            <span>{new Date(deal.starts_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                                            <span className="text-white/15">→</span>
                                            <span>{new Date(deal.ends_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-0.5">
                                            <button
                                                onClick={() => onEdit(deal)}
                                                className="rounded-lg p-1.5 text-white/20 hover:bg-orange-500/10 hover:text-orange-400 transition-all"
                                                title="Editar"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => onToggle(deal.id, deal.is_active)}
                                                disabled={isToggling}
                                                className="transition-all disabled:opacity-50"
                                                title={deal.is_active ? 'Desactivar' : 'Activar'}
                                            >
                                                {deal.is_active ? (
                                                    <ToggleRight className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.3)]" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5 text-white/20" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => onDelete(deal.id, deal.product?.name ?? 'Oferta')}
                                                disabled={isDeleting}
                                                className="rounded-lg p-1.5 text-white/20 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Warning if none active */}
            {deals.length > 0 && deals.every(d => !d.is_active || new Date(d.ends_at).getTime() <= Date.now()) && (
                <div className="flex items-center gap-2 border-t border-white/5 px-4 py-3 text-xs text-amber-400/70">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Ninguna oferta está activa actualmente. La sección no se mostrará en el storefront.
                </div>
            )}
        </div>
    );
}
