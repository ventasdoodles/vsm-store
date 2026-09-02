import { Link } from '@tanstack/react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderHeaderProps {
    orderNumber: string;
    createdAt: string;
    statusConfig: {
        label: string;
        color: string;
        bg: string;
        border: string;
    };
}

export function OrderHeader({ orderNumber, createdAt, statusConfig }: OrderHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-6">
                <Link to={"/orders" as any} aria-label="Ver historial de pedidos" className="h-12 w-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-theme-secondary hover:bg-white/10 hover:text-white transition-all shadow-xl">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-black text-white uppercase italic tracking-tight">{orderNumber}</h1>
                        <Sparkles className="h-4 w-4 text-accent-primary animate-pulse" />
                    </div>
                    <p className="text-[10px] text-theme-tertiary font-black uppercase tracking-[0.2em] opacity-60">
                        Registro de compra: {new Date(createdAt).toLocaleDateString('es-MX', {
                            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>
            </div>
            <div className={cn(
                'inline-flex items-center gap-3 rounded-2xl border px-6 py-3 text-[10px] font-black uppercase tracking-widest shadow-2xl',
                statusConfig.color, statusConfig.bg, statusConfig.border
            )}>
                <div className={cn("h-2 w-2 rounded-full animate-pulse", statusConfig.bg.replace('/10', ''))} />
                {statusConfig.label}
            </div>
        </div>
    );
}
