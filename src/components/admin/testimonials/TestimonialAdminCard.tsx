import React from 'react';
import { ShieldCheck, Sparkles, EyeOff, Eye, Pencil, Trash2, Copy, Star } from 'lucide-react';
import type { Testimonial } from '@/types/testimonial';
import { cn } from '@/lib/utils';

interface TestimonialAdminCardProps {
    testimonial: Testimonial;
    onEdit: (t: Testimonial) => void;
    onDuplicate: (t: Testimonial) => void;
    onDelete: (id: string) => void;
    onToggleFeatured: (id: string, v: boolean) => void;
    onToggleActive: (id: string, v: boolean) => void;
}

export function TestimonialAdminCard({
    testimonial: t,
    onEdit,
    onDuplicate,
    onDelete,
    onToggleFeatured,
    onToggleActive,
}: TestimonialAdminCardProps) {
    return (
        <div
            className={cn(
                'group relative flex flex-col p-6 rounded-3xl transition-all duration-300',
                t.is_active
                    ? 'bg-[#181825]/80 backdrop-blur-xl border border-white/[0.06] hover:border-white/20 hover:shadow-xl hover:-translate-y-1'
                    : 'bg-[#181825]/40 border border-white/[0.04] opacity-75 grayscale-[0.3]',
                t.is_featured && t.is_active && 'shadow-[0_0_20px_rgba(251,191,36,0.1)] border-amber-500/20'
            )}
        >
            {/* Absolute Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 transition-opacity duration-300">
                {t.verified_purchase && (
                    <div className="p-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 shadow-sm" title="Compra verificada">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                )}
                {t.is_featured && (
                    <div className="p-1.5 bg-amber-500/10 rounded-full border border-amber-500/20 shadow-sm" title="Testimonio destacado">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
                    </div>
                )}
                {!t.is_active && (
                    <div className="p-1.5 bg-red-500/10 rounded-full border border-red-500/20 shadow-sm" title="Inactivo">
                        <EyeOff className="w-3.5 h-3.5 text-red-400" />
                    </div>
                )}
            </div>

            {/* Top Info */}
            <div className="flex flex-col gap-1 pr-20 mb-3">
                <p className="font-black text-theme-primary text-base truncate tracking-tight">
                    {t.customer_name}
                </p>
                {t.customer_location ? (
                    <p className="text-[11px] font-semibold text-theme-secondary/70 truncate flex items-center gap-1">
                        📍 {t.customer_location}
                    </p>
                ) : (
                    <p className="text-[11px] font-semibold text-theme-secondary/30">Sin ubicación</p>
                )}
            </div>

            {/* Stars & Context */}
            <div className="flex items-center gap-3 mb-4">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                'w-4 h-4 transition-transform',
                                i < t.rating ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-zinc-800'
                            )}
                        />
                    ))}
                </div>
                {t.section && (
                    <span
                        className={cn(
                            'text-[10px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-md shadow-inner border border-white/5',
                            t.section === 'vape'
                                ? 'bg-vape-500/10 text-vape-400'
                                : 'bg-herbal-500/10 text-herbal-400'
                        )}
                    >
                        {t.section}
                    </span>
                )}
                <span className="text-[10px] font-mono text-theme-secondary/40 ml-auto whitespace-nowrap bg-black/20 px-2 py-0.5 rounded-md">
                    #{t.sort_order}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1">
                {t.title && (
                    <p className="text-sm font-bold text-theme-primary mb-2 line-clamp-1 opacity-90">
                        &quot;{t.title}&quot;
                    </p>
                )}
                <p className="text-sm text-theme-secondary/80 line-clamp-4 leading-relaxed font-medium italic">
                    `{t.body}`
                </p>
            </div>

            {/* Date */}
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
                 <p className="text-[10px] font-bold tracking-wider uppercase text-theme-secondary/50">
                    {t.review_date ? new Date(t.review_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric'}) : '—'}
                </p>
            </div>

            {/* Action Bar (Hover reveal on Desktop) */}
            <div className="absolute left-0 right-0 -bottom-1 translate-y-full opacity-0 group-hover:opacity-100 group-hover:translate-y-2 transition-all duration-300 z-20 hidden md:flex justify-center pointer-events-none group-hover:pointer-events-auto">
                <div className="flex items-center gap-1.5 p-1.5 bg-[#13141f]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl scale-95 group-hover:scale-100 transition-transform">
                    <ActionBtn icon={<Pencil className="w-4 h-4" />} label="Editar" onClick={() => onEdit(t)} color="accent" />
                    <ActionBtn icon={<Copy className="w-4 h-4" />} label="Duplicar" onClick={() => onDuplicate(t)} color="blue" />
                    
                    <div className="w-px h-6 bg-white/10 mx-1"></div>

                    <ActionBtn
                        icon={t.is_featured ? <Sparkles className="w-4 h-4 fill-amber-400 text-amber-400" /> : <Sparkles className="w-4 h-4" />}
                        label={t.is_featured ? 'Quitar destacado' : 'Destacar'}
                        onClick={() => onToggleFeatured(t.id, !t.is_featured)}
                        color="amber"
                        active={t.is_featured}
                    />
                    <ActionBtn
                        icon={t.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        label={t.is_active ? 'Ocultar' : 'Mostrar'}
                        onClick={() => onToggleActive(t.id, !t.is_active)}
                        color="emerald"
                        active={t.is_active}
                    />

                    <div className="w-px h-6 bg-white/10 mx-1"></div>

                    <ActionBtn
                        icon={<Trash2 className="w-4 h-4" />}
                        label="Eliminar"
                        onClick={() => onDelete(t.id)}
                        color="red"
                    />
                </div>
            </div>

            {/* Mobile Action Bar (Always visible on touch) */}
            <div className="flex md:hidden border-t border-white/5 -mx-6 -mb-6 mt-4 bg-[#13141f] justify-around rounded-b-3xl">
                <button onClick={() => onEdit(t)} className="p-3 text-accent-primary" aria-label="Editar"><Pencil className="w-5 h-5" /></button>
                <button onClick={() => onDuplicate(t)} className="p-3 text-blue-400" aria-label="Duplicar"><Copy className="w-5 h-5" /></button>
                <button onClick={() => onToggleFeatured(t.id, !t.is_featured)} className="p-3 text-amber-400" aria-label={t.is_featured ? 'Quitar destacado' : 'Destacar'}>
                    <Sparkles className={cn('w-5 h-5', t.is_featured && 'fill-amber-400')} />
                </button>
                <button onClick={() => onToggleActive(t.id, !t.is_active)} className="p-3 text-emerald-400" aria-label={t.is_active ? 'Ocultar' : 'Mostrar'}>
                    {t.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button onClick={() => onDelete(t.id)} className="p-3 text-red-400" aria-label="Eliminar"><Trash2 className="w-5 h-5" /></button>
            </div>
        </div>
    );
}

function ActionBtn({
    icon,
    label,
    onClick,
    color,
    active = false,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color: 'accent' | 'blue' | 'amber' | 'emerald' | 'red';
    active?: boolean;
}) {
    const colors = {
        accent: 'hover:bg-accent-primary/20 hover:text-accent-primary focus:ring-accent-primary/30',
        blue: 'hover:bg-blue-500/20 hover:text-blue-400 focus:ring-blue-500/30',
        amber: 'hover:bg-amber-500/20 hover:text-amber-400 focus:ring-amber-500/30 text-amber-500/80',
        emerald: 'hover:bg-emerald-500/20 hover:text-emerald-400 focus:ring-emerald-500/30 text-emerald-500/80',
        red: 'hover:bg-red-500/20 hover:text-red-400 focus:ring-red-500/30 text-red-500/80',
    };

    return (
        <button
            onClick={onClick}
            title={label}
            className={cn(
                'p-2.5 rounded-xl transition-all duration-200 outline-none focus:ring-2 active:scale-90',
                active ? 'bg-white/10 text-white shadow-inner' : 'text-theme-secondary',
                colors[color]
            )}
        >
            {icon}
        </button>
    );
}
