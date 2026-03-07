import { useState, useEffect } from 'react';
import {
    Activity, Calendar, CreditCard,
    MessageSquare, Award, Ticket,
    TrendingUp, Heart, AlertCircle,
    CheckCircle2, Clock, Sparkles, ArrowRight
} from 'lucide-react';
import {
    getCustomerIntelligence,
    getCustomerTimeline,
    getCustomerInsights,
    type CustomerIntelligence,
    type TimelineEvent,
    type CustomerInsight
} from '@/services/admin/admin-crm.service';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerIntelligencePanelProps {
    customerId: string;
}

export function CustomerIntelligencePanel({ customerId }: CustomerIntelligencePanelProps) {
    const [intelligence, setIntelligence] = useState<CustomerIntelligence | null>(null);
    const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
    const [insights, setInsights] = useState<CustomerInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [intelData, timelineData] = await Promise.all([
                    getCustomerIntelligence(customerId),
                    getCustomerTimeline(customerId)
                ]);
                setIntelligence(intelData);
                setTimeline(timelineData);
                if (intelData) {
                    setInsights(getCustomerInsights(intelData));
                }
            } catch (error) {
                console.error('Error loading CRM data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (customerId) loadData();
    }, [customerId]);

    const getSegmentColor = (segment: string) => {
        switch (segment) {
            case 'Campeón': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
            case 'Leal': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
            case 'Nuevo': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            case 'En Riesgo': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    const getHealthIcon = (status: string) => {
        switch (status) {
            case 'Saludable': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case 'Estable': return <Activity className="h-4 w-4 text-blue-400" />;
            case 'Requiere Atención': return <AlertCircle className="h-4 w-4 text-rose-400" />;
            default: return <Clock className="h-4 w-4 text-white/20" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-4 animate-pulse">
                <div className="h-32 rounded-3xl bg-white/5 border border-white/5" />
                <div className="h-64 rounded-3xl bg-white/5 border border-white/5" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* 1. Header de Inteligencia (RFM Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Recency Card */}
                <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Recencia</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                        {intelligence?.recency_days ?? '—'} <span className="text-xs text-white/20 font-medium">días</span>
                    </p>
                    <p className="text-[10px] text-white/20 mt-1 uppercase font-bold">Desde última compra</p>
                </div>

                {/* Frequency Card */}
                <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <TrendingUp className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Frecuencia</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                        {intelligence?.frequency ?? 0} <span className="text-xs text-white/20 font-medium">órdenes</span>
                    </p>
                    <p className="text-[10px] text-white/20 mt-1 uppercase font-bold">Totales completadas</p>
                </div>

                {/* Monetary Card */}
                <div className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-5 backdrop-blur-md transition-all hover:border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Valor</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                        ${intelligence?.monetary?.toLocaleString() ?? '0'}
                    </p>
                    <p className="text-[10px] text-white/20 mt-1 uppercase font-bold">Gasto acumulado</p>
                </div>

                {/* Segment Card */}
                <div className={cn(
                    "group relative overflow-hidden rounded-[2rem] border p-5 backdrop-blur-md transition-all",
                    getSegmentColor(intelligence?.segment || '')
                )}>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-current opacity-10">
                            <Heart className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Segmento</span>
                    </div>
                    <p className="text-2xl font-black">{intelligence?.segment ?? 'Prospecto'}</p>
                    <div className="flex items-center gap-1.5 mt-2 opacity-60">
                        {getHealthIcon(intelligence?.health_status || '')}
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{intelligence?.health_status}</span>
                    </div>
                </div>
            </div>

            {/* 1.5. Sección de Insights Inteligentes (Fase A) */}
            {insights.length > 0 && (
                <div className="relative overflow-hidden rounded-[2.5rem] border border-vape-500/20 bg-gradient-to-br from-vape-950/40 to-black/40 p-1 backdrop-blur-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.1),transparent_50%)]" />
                    <div className="relative p-6 px-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-4 w-4 text-vape-400 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400/80">Recomendaciones del Sistema</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {insights.map((insight, idx) => (
                                <div key={idx} className="flex gap-4 group">
                                    <div className={cn(
                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-xl",
                                        insight.type === 'success' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                                        insight.type === 'warning' && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                                        insight.type === 'critical' && "bg-rose-500/10 border-rose-500/20 text-rose-400",
                                        insight.type === 'info' && "bg-vape-500/10 border-vape-500/20 text-vape-400"
                                    )}>
                                        {insight.type === 'critical' ? <AlertCircle className="h-6 w-6" /> : <Sparkles className="h-5 w-5" />}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h5 className="text-sm font-bold text-white mb-1">{insight.title}</h5>
                                        <p className="text-xs text-white/50 leading-relaxed mb-2">{insight.description}</p>
                                        {insight.actionLabel && (
                                            <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-vape-400 hover:text-vape-300 transition-colors w-fit group/btn">
                                                {insight.actionLabel}
                                                <ArrowRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-1" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Gemini IA Narrative Placeholder */}
                            <div className="flex gap-4 p-4 rounded-[1.5rem] bg-white/[0.02] border border-white/5 border-dashed relative group">
                                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-vape-500 text-[8px] font-black uppercase text-black animate-pulse">
                                    Fase B
                                </div>
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 border border-white/10 text-white/40">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">IA Narrativa (Gemini)</h5>
                                    <p className="text-[10px] text-white/10 font-medium italic">
                                        Próximamente: Resumen ejecutivo del comportamiento del cliente generado por IA.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Timeline Unificada */}
            <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-xl">
                <h4 className="flex items-center gap-3 text-sm font-bold text-white mb-8">
                    <Activity className="h-5 w-5 text-vape-400" />
                    Línea de Tiempo 360
                </h4>

                <div className="relative space-y-8 before:absolute before:inset-0 before:ml-[1.25rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-vape-500/50 before:via-white/5 before:to-transparent">
                    {timeline.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-xs text-white/20 uppercase font-black tracking-widest">Sin actividad registrada aún</p>
                        </div>
                    ) : (
                        timeline.map((event, idx) => (
                            <div key={event.id} className="relative flex items-start gap-6 group animate-in slide-in-from-left-4 fade-in duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                                {/* Icon Container */}
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border backdrop-blur-xl z-10 transition-transform group-hover:scale-110 shadow-lg",
                                    event.type === 'order' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                                    event.type === 'note' && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                                    event.type === 'loyalty' && "bg-violet-500/10 border-violet-500/20 text-violet-400",
                                    event.type === 'coupon' && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
                                    event.type === 'system' && "bg-white/5 border-white/10 text-white/30"
                                )}>
                                    {event.type === 'order' && <TrendingUp className="h-5 w-5" />}
                                    {event.type === 'note' && <MessageSquare className="h-5 w-5" />}
                                    {event.type === 'loyalty' && <Award className="h-5 w-5" />}
                                    {event.type === 'coupon' && <Ticket className="h-5 w-5" />}
                                    {event.type === 'system' && <Activity className="h-5 w-5" />}
                                </div>

                                {/* Content */}
                                <div className="flex-1 pt-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                                        <h5 className="text-sm font-bold text-white group-hover:text-vape-400 transition-colors">
                                            {event.title}
                                        </h5>
                                        <span className="text-[10px] font-black uppercase text-white/20 bg-white/5 px-2 py-0.5 rounded-full">
                                            {format(new Date(event.date), "PPP p", { locale: es })}
                                        </span>
                                    </div>
                                    <p className="text-xs text-white/40 leading-relaxed max-w-2xl px-1">
                                        {event.description}
                                    </p>

                                    {/* Order Badges if applicable */}
                                    {event.status && (
                                        <div className="mt-2 flex gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                {event.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
