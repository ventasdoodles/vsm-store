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
    getCustomerNarrative,
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
    const [narrative, setNarrative] = useState<string>('');
    const [strategicAnalysis, setStrategicAnalysis] = useState<import('@/services/admin/admin-crm.service').StrategicAIResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingNarrative, setLoadingNarrative] = useState(false);
    const [loadingStrategic, setLoadingStrategic] = useState(false);

    const loadStrategicAI = async () => {
        setLoadingStrategic(true);
        try {
            const { getStrategicLoyaltyAnalysis } = await import('@/services/admin/admin-crm.service');
            const result = await getStrategicLoyaltyAnalysis(customerId);
            setStrategicAnalysis(result);
        } catch (error) {
            console.error('Error loading strategic analysis:', error);
        } finally {
            setLoadingStrategic(false);
        }
    };

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

        const loadNarrative = async () => {
            setLoadingNarrative(true);
            try {
                const text = await getCustomerNarrative(customerId);
                setNarrative(text);
            } catch (error) {
                console.error('Error loading narrative:', error);
            } finally {
                setLoadingNarrative(false);
            }
        };

        if (customerId) {
            loadData();
            loadNarrative();
        }
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

                            {/* AI Narrative Section */}
                            <div className={cn(
                                "col-span-1 md:col-span-2 flex gap-6 p-6 rounded-[2rem] bg-gradient-to-br from-vape-500/5 to-indigo-500/5 border border-vape-500/20 relative group transition-all hover:bg-vape-500/10",
                                loadingNarrative && "animate-pulse"
                            )}>
                                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-indigo-500 text-[9px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-500/20">
                                    IA Estratégica
                                </div>
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                                    <Sparkles className={cn("h-7 w-7", loadingNarrative && "animate-spin-slow")} />
                                </div>
                                <div className="flex flex-col justify-center w-full">
                                    <h5 className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300/80 mb-2">Análisis de Comportamiento</h5>
                                    {loadingNarrative ? (
                                        <div className="space-y-2">
                                            <div className="h-2 w-3/4 bg-white/10 rounded-full" />
                                            <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                                        </div>
                                    ) : (
                                        <p className="text-sm font-medium text-white/80 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">
                                            "{narrative || "No se ha podido generar una estrategia en este momento."}"
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Strategic AI Analyst Section (On-Demand) */}
                            <div className={cn(
                                "col-span-1 md:col-span-2 flex flex-col gap-6 p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 via-vape-500/5 to-transparent border border-white/10 relative overflow-hidden transition-all duration-700",
                                strategicAnalysis ? "shadow-[0_0_50px_-12px_rgba(99,102,241,0.3)]" : "hover:border-white/20"
                            )}>
                                {/* Background Glow */}
                                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
                                
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
                                            <Sparkles className={cn("h-6 w-6", loadingStrategic && "animate-spin-slow")} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-white tracking-tight">Analista Estratégico Pro</h4>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 opacity-80">Motor de Retención Gemini 1.5</p>
                                        </div>
                                    </div>

                                    {!strategicAnalysis && (
                                        <button
                                            onClick={loadStrategicAI}
                                            disabled={loadingStrategic}
                                            className="px-6 py-3 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-indigo-400 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-indigo-500/40"
                                        >
                                            {loadingStrategic ? 'Analizando Historial...' : 'Ejecutar Análisis Profundo'}
                                        </button>
                                    )}
                                </div>

                                {strategicAnalysis && (
                                    <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-top-2 duration-500">
                                        {/* Analysis Text */}
                                        <div className="p-6 rounded-3xl bg-white/5 border border-white/5">
                                            <p className="text-sm font-medium text-white/90 leading-relaxed mb-4">
                                                {strategicAnalysis.analysis}
                                            </p>
                                            
                                            {/* Next Steps */}
                                            {strategicAnalysis.next_steps && (
                                                <div className="space-y-3 mt-6">
                                                    <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Pasos Recomendados</h6>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {strategicAnalysis.next_steps.map((step: string, i: number) => (
                                                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 group/step hover:bg-white/10 transition-colors">
                                                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 group-hover/step:scale-150 transition-transform" />
                                                                <span className="text-xs font-medium text-white/70">{step}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Suggested Coupon */}
                                        {strategicAnalysis.suggested_coupon && (
                                            <div className="group relative p-6 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-xl shadow-indigo-500/20">
                                                            <Ticket className="h-7 w-7" />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-sm font-black text-white uppercase tracking-wider">Incentivo Sugerido</h5>
                                                            <p className="text-xs text-indigo-300/80 font-medium">{strategicAnalysis.suggested_coupon.reason}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/10">
                                                        <div className="text-center px-4">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-1">Código</p>
                                                            <p className="text-lg font-black text-white tracking-[0.1em]">{strategicAnalysis.suggested_coupon.code}</p>
                                                        </div>
                                                        <div className="h-8 w-px bg-white/10" />
                                                        <div className="text-center px-4">
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-1">DCTO</p>
                                                            <p className="text-lg font-black text-white">{strategicAnalysis.suggested_coupon.discount}%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => setStrategicAnalysis(null)}
                                            className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors mx-auto block"
                                        >
                                            Resetear Análisis IA
                                        </button>
                                    </div>
                                )}
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
