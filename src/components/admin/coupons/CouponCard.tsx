import { useState } from 'react';
import {
    Ticket, Pencil, Trash2, Copy, Link as LinkIcon,
    CheckCircle2, AlertCircle, Clock, Percent, DollarSign, User
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import type { AdminCoupon } from '@/services/admin';

interface Props {
    coupon: AdminCoupon;
    onEdit: (coupon: AdminCoupon) => void;
    onDelete: (code: string) => void;
    onDuplicate: (coupon: AdminCoupon) => void;
}

export function CouponCard({ coupon, onEdit, onDelete, onDuplicate }: Props) {  
    const [copied, setCopied] = useState(false);

    const now = new Date();
    const isExpired = coupon.valid_until && new Date(coupon.valid_until) < now; 
    const isDepleted = coupon.max_uses && coupon.used_count >= coupon.max_uses;
    const isScheduled = coupon.valid_from && new Date(coupon.valid_from) > now; 

    let status = { label: 'Activo', color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'bg-emerald-500', border: 'border-emerald-500/20', shadow: 'shadow-[0_0_10px_rgba(52,211,153,0.1)]', icon: CheckCircle2 };
    if (!coupon.is_active) status = { label: 'Inactivo', color: 'text-zinc-500', bg: 'bg-zinc-500/10', glow: 'bg-zinc-500', border: 'border-white/5', shadow: 'shadow-none', icon: AlertCircle };
    else if (isExpired) status = { label: 'Expirado', color: 'text-red-400', bg: 'bg-red-500/10', glow: 'bg-red-500', border: 'border-red-500/20', shadow: 'shadow-[0_0_10px_rgba(248,113,113,0.1)]', icon: Clock };
    else if (isDepleted) status = { label: 'Agotado', color: 'text-orange-400', bg: 'bg-orange-500/10', glow: 'bg-orange-500', border: 'border-orange-500/20', shadow: 'shadow-[0_0_10px_rgba(251,146,60,0.1)]', icon: AlertCircle };
    else if (isScheduled) status = { label: 'Programado', color: 'text-blue-400', bg: 'bg-blue-500/10', glow: 'bg-blue-500', border: 'border-blue-500/20', shadow: 'shadow-[0_0_10px_rgba(96,165,250,0.1)]', icon: Clock };      
    
    const StatusIcon = status.icon;

    const handleCopyLink = () => {
        const url = `${window.location.origin}/?coupon=${coupon.code}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={cn(
            "rounded-3xl border bg-[#181825]/60 backdrop-blur-md p-6 relative overflow-hidden group transition-all duration-300 hover:bg-[#181825]/80 hover:-translate-y-1 flex flex-col",
            status.border,
            status.shadow,
            !coupon.is_active && "opacity-75 grayscale-[0.5]"
        )}>
            {/* Ambient Background Glow matching the status */}
            <div className={cn("absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-all group-hover:opacity-40", status.glow)} />

            {/* Status Badge */}
            <div className={cn("absolute top-5 right-5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", status.bg, status.color, status.border)}>                                                                                   
                <StatusIcon className="h-3 w-3" /> {status.label}
            </div>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6 relative z-10 pr-24">
                <div className={cn("p-3 rounded-2xl border shadow-inner shrink-0", status.bg, status.color, status.border)}> 
                    <Ticket className="h-6 w-6 drop-shadow-sm" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-theme-primary font-mono tracking-tight">{coupon.code}</h3>
                    <p className="text-xs font-medium text-theme-secondary/70 line-clamp-1 mt-0.5">{coupon.description || 'Sin descripción'}</p>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10 flex-1">
                <div className="bg-black/20 p-3 rounded-xl border border-white/[0.03]">
                    <div className="text-[10px] text-theme-secondary/60 font-bold uppercase tracking-widest mb-1.5">Descuento</div>                                                                     
                    <div className="text-base font-black text-theme-primary flex items-center gap-1.5">                                                                                      
                        {coupon.discount_type === 'percentage' ? (
                            <><Percent className="h-3.5 w-3.5 text-fuchsia-400" /> {coupon.discount_value}%</>                                                                               
                        ) : (
                            <><DollarSign className="h-3.5 w-3.5 text-emerald-400" /> {formatPrice(coupon.discount_value)}</>                                                                
                        )}
                    </div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/[0.03]">
                    <div className="text-[10px] text-theme-secondary/60 font-bold uppercase tracking-widest mb-1.5">Usos</div>
                    <div className="text-base font-black text-theme-primary flex items-baseline gap-1">      
                        {coupon.used_count} <span className="text-xs text-theme-secondary/50 font-medium">/ {coupon.max_uses || ''}</span>
                    </div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/[0.03]">
                    <div className="text-[10px] text-theme-secondary/60 font-bold uppercase tracking-widest mb-1.5">Mínimo</div>
                    <div className="text-sm font-bold text-theme-primary">      
                        {coupon.min_purchase > 0 ? formatPrice(coupon.min_purchase) : 'Sin mínimo'}
                    </div>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/[0.03]">
                    <div className="text-[10px] text-theme-secondary/60 font-bold uppercase tracking-widest mb-1.5">Audiencia</div>
                    <div className="text-sm font-bold text-theme-primary flex items-center gap-1.5">                                                                                      
                        <User className="h-3.5 w-3.5 text-blue-400" />
                        {coupon.customer_id ? 'Específico' : 'Global'}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10 mt-auto">                                                                                      
                <button
                    onClick={handleCopyLink}
                    className="text-xs font-bold flex items-center gap-1.5 text-theme-secondary hover:text-theme-primary transition-colors bg-white/5 px-3 py-1.5 rounded-lg hover:bg-white/10"                                                 
                >
                    {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <LinkIcon className="h-3.5 w-3.5" />}                                                               
                    {copied ? '¡Copiado!' : 'Link Mágico'}
                </button>

                <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">                                                                      
                    <button
                        onClick={() => onDuplicate(coupon)}
                        className="p-2 rounded-xl bg-theme-primary/10 text-theme-secondary hover:text-blue-400 hover:bg-blue-500/20 transition-all border border-transparent hover:border-blue-500/30"                          
                        title="Clonar Cupón"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onEdit(coupon)}
                        className="p-2 rounded-xl bg-theme-primary/10 text-theme-secondary hover:text-fuchsia-400 hover:bg-fuchsia-500/20 transition-all border border-transparent hover:border-fuchsia-500/30"                                                                                                    
                        title="Editar"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(coupon.code)}
                        className="p-2 rounded-xl bg-theme-primary/10 text-theme-secondary hover:text-red-400 hover:bg-red-500/20 transition-all border border-transparent hover:border-red-500/30"                                  
                        title="Desactivar"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
