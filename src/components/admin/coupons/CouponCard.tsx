import { useState } from 'react';
import { 
    Ticket, Pencil, Trash2, Copy, Link as LinkIcon, 
    CheckCircle2, AlertCircle, Clock, Percent, DollarSign, User
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import type { AdminCoupon } from '@/services/admin';

interface Props {
    coupon: AdminCoupon;
    onEdit: (coupon: AdminCoupon) => void;
    onDelete: (id: string) => void;
    onDuplicate: (coupon: AdminCoupon) => void;
}

export function CouponCard({ coupon, onEdit, onDelete, onDuplicate }: Props) {
    const [copied, setCopied] = useState(false);

    const now = new Date();
    const isExpired = coupon.valid_until && new Date(coupon.valid_until) < now;
    const isDepleted = coupon.max_uses && coupon.current_uses >= coupon.max_uses;
    const isScheduled = coupon.valid_from && new Date(coupon.valid_from) > now;
    
    let status = { label: 'Activo', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30', icon: CheckCircle2 };
    if (!coupon.is_active) status = { label: 'Inactivo', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30', icon: AlertCircle };
    else if (isExpired) status = { label: 'Expirado', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30', icon: Clock };
    else if (isDepleted) status = { label: 'Agotado', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30', icon: AlertCircle };
    else if (isScheduled) status = { label: 'Programado', color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/30', icon: Clock };

    const StatusIcon = status.icon;

    const handleCopyLink = () => {
        const url = `${window.location.origin}/?coupon=${coupon.code}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`rounded-2xl border ${status.border} bg-theme-primary/20 p-5 relative overflow-hidden group transition-all hover:border-theme`}>
            {/* Status Badge */}
            <div className={`absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.bg} ${status.color}`}>
                <StatusIcon className="h-3 w-3" /> {status.label}
            </div>

            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className={`p-3 rounded-xl ${status.bg} ${status.color}`}>
                    <Ticket className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-theme-primary font-mono tracking-wider">{coupon.code}</h3>
                    <p className="text-xs text-theme-primary0 line-clamp-1">{coupon.description || 'Sin descripción'}</p>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-theme-primary/30 p-2 rounded-lg border border-theme/50">
                    <div className="text-[10px] text-theme-primary0 uppercase tracking-wider mb-1">Descuento</div>
                    <div className="text-sm font-bold text-theme-primary flex items-center gap-1">
                        {coupon.discount_type === 'percentage' ? (
                            <><Percent className="h-3 w-3 text-purple-400" /> {coupon.discount_value}%</>
                        ) : (
                            <><DollarSign className="h-3 w-3 text-herbal-400" /> {formatPrice(coupon.discount_value)}</>
                        )}
                    </div>
                </div>
                <div className="bg-theme-primary/30 p-2 rounded-lg border border-theme/50">
                    <div className="text-[10px] text-theme-primary0 uppercase tracking-wider mb-1">Usos</div>
                    <div className="text-sm font-bold text-theme-primary">
                        {coupon.current_uses} / {coupon.max_uses || '∞'}
                    </div>
                </div>
                <div className="bg-theme-primary/30 p-2 rounded-lg border border-theme/50">
                    <div className="text-[10px] text-theme-primary0 uppercase tracking-wider mb-1">Mínimo</div>
                    <div className="text-sm font-bold text-theme-primary">
                        {coupon.min_purchase > 0 ? formatPrice(coupon.min_purchase) : 'Sin mínimo'}
                    </div>
                </div>
                <div className="bg-theme-primary/30 p-2 rounded-lg border border-theme/50">
                    <div className="text-[10px] text-theme-primary0 uppercase tracking-wider mb-1">Audiencia</div>
                    <div className="text-sm font-bold text-theme-primary flex items-center gap-1">
                        <User className="h-3 w-3 text-blue-400" />
                        {coupon.customer_id ? 'Específico' : 'Todos'}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-theme/50">
                <button 
                    onClick={handleCopyLink}
                    className="text-xs flex items-center gap-1 text-theme-secondary hover:text-theme-primary transition-colors"
                >
                    {copied ? <CheckCircle2 className="h-3 w-3 text-green-400" /> : <LinkIcon className="h-3 w-3" />}
                    {copied ? '¡Copiado!' : 'Link Mágico'}
                </button>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onDuplicate(coupon)}
                        className="p-1.5 rounded-lg bg-theme-primary/40 text-theme-primary0 hover:text-blue-400 hover:bg-blue-500/20 transition-colors"
                        title="Clonar Cupón"
                    >
                        <Copy className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onEdit(coupon)}
                        className="p-1.5 rounded-lg bg-theme-primary/40 text-theme-primary0 hover:text-theme-primary hover:bg-theme-secondary/20 transition-colors"
                        title="Editar"
                    >
                        <Pencil className="h-4 w-4" />
                    </button>
                    <button 
                        onClick={() => onDelete(coupon.id)}
                        className="p-1.5 rounded-lg bg-theme-primary/40 text-theme-primary0 hover:text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Desactivar"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
