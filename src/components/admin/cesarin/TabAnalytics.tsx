import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MessageSquare, Brain, Loader2 } from 'lucide-react';
import { getPilotKPIs, getPilotQueryLog } from '@/services/admin/admin-pilot-ops.service';
import type { PilotKPIs } from '@/services/admin/admin-pilot-ops.service';

function getDateRange() {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - 30);
    return {
        from: from.toISOString(),
        to: to.toISOString(),
    };
}

interface IntentBucket {
    label: string;
    value: number;
    color: string;
}

function buildIntentBuckets(totalInteractions: number, capsuleCounts: Record<string, number>): IntentBucket[] {
    if (totalInteractions === 0) return [];

    const search = capsuleCounts['product_search_integrity'] ?? 0;
    const knowledge = capsuleCounts['knowledge_rag_foundation'] ?? 0;
    const cart = capsuleCounts['cart_operator'] ?? 0;
    const fallback = totalInteractions - search - knowledge - cart;

    const buckets = [
        { label: 'Búsqueda Producto', count: search, color: 'bg-vape-500' },
        { label: 'Consulta Info/Policy', count: knowledge, color: 'bg-indigo-500' },
        { label: 'Intención Carrito', count: cart, color: 'bg-emerald-500' },
        { label: 'Fallback / Sin Cápsula', count: Math.max(0, fallback), color: 'bg-white/10' },
    ].filter(b => b.count > 0);

    return buckets.map(b => ({
        label: b.label,
        value: Math.round((b.count / totalInteractions) * 100),
        color: b.color,
    }));
}

export function TabAnalytics() {
    const [kpis, setKpis] = useState<PilotKPIs | null>(null);
    const [intentBuckets, setIntentBuckets] = useState<IntentBucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // Capsule distribution is a best-effort overlay — failing it (e.g. missing
    // response_text column in live DB) must not crash the KPI cards.
    const [capsuleUnavailable, setCapsuleUnavailable] = useState(false);

    useEffect(() => {
        const { from, to } = getDateRange();
        setLoading(true);

        // KPIs only select id/frustration_detected/ai_logic_debug — safe on all schema versions.
        getPilotKPIs(from, to)
            .then((kpiData) => {
                setKpis(kpiData);

                // Query log selects response_text — may fail if migration not yet applied.
                // Failure here degrades capsule distribution only; KPI cards stay intact.
                return getPilotQueryLog(from, to, 200)
                    .then((rows) => {
                        const capsuleCounts: Record<string, number> = {};
                        for (const row of rows) {
                            if (row.capsule) {
                                capsuleCounts[row.capsule] = (capsuleCounts[row.capsule] ?? 0) + 1;
                            }
                        }
                        setIntentBuckets(buildIntentBuckets(kpiData.totalInteractions, capsuleCounts));
                    })
                    .catch(() => {
                        // response_text column likely missing — migration pending.
                        setCapsuleUnavailable(true);
                    });
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : 'Error cargando analíticas');
            })
            .finally(() => setLoading(false));
    }, []);

    const stats = kpis
        ? [
              {
                  label: 'Consultas (30d)',
                  value: kpis.totalInteractions.toLocaleString(),
                  sub: kpis.totalInteractions === 0 ? 'Sin datos aún' : `${kpis.totalCartActions} intenciones carrito`,
                  icon: MessageSquare,
                  color: 'text-vape-400',
                  bg: 'bg-vape-500/10',
              },
              {
                  label: 'Match Semántico',
                  value: kpis.totalInteractions === 0 ? '—' : `${(kpis.semanticMatchRate * 100).toFixed(1)}%`,
                  sub: 'Cápsulas resueltas vs total',
                  icon: TrendingUp,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
              },
              {
                  label: 'Frustración',
                  value: kpis.totalInteractions === 0 ? '—' : `${(kpis.frustrationRate * 100).toFixed(1)}%`,
                  sub: 'Interacciones con señal negativa',
                  icon: Brain,
                  color: kpis.frustrationRate > 0.15 ? 'text-rose-400' : 'text-indigo-400',
                  bg: kpis.frustrationRate > 0.15 ? 'bg-rose-500/10' : 'bg-indigo-500/10',
              },
              {
                  label: 'Latencia Prom.',
                  value: kpis.totalInteractions === 0 ? '—' : `${kpis.avgLatencyMs}ms`,
                  sub: `Fallback: ${kpis.totalInteractions === 0 ? '—' : (kpis.fallbackRate * 100).toFixed(1) + '%'}`,
                  icon: Users,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10',
              },
          ]
        : [];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-6 w-6 animate-spin text-white/30" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-rose-400 text-sm">
                Error cargando analíticas: {error}
            </div>
        );
    }

    return (
        <motion.div
            key="analytics"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-4 hover:bg-white/[0.04] transition-all group">
                        <div className={`h-12 w-12 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-white">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mt-1">{stat.label}</div>
                            <div className={`text-[10px] font-bold mt-2 ${stat.color}/60`}>{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 p-10 rounded-[3rem] bg-white/[0.02] border border-white/5 h-[400px] flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-vape-500/5 to-transparent shadow-inner" />
                    <div className="relative space-y-4">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 flex items-center justify-center mx-auto mb-6">
                            <TrendingUp className="h-8 w-8 text-white/10" />
                        </div>
                        <h4 className="text-lg font-black text-white uppercase tracking-widest">Analíticas Avanzadas</h4>
                        <p className="text-sm text-theme-secondary max-w-xs mx-auto">
                            {kpis?.totalInteractions === 0
                                ? 'Esperando primeras interacciones reales para generar visualizaciones.'
                                : 'Visualización de tendencias en tiempo real. Disponible en próximas fases de expansión.'}
                        </p>
                        {kpis && kpis.totalInteractions > 0 && (
                            <div className="flex gap-6 justify-center mt-4">
                                <div className="text-center">
                                    <div className="text-xl font-black text-white">{kpis.zeroProductCardCount}</div>
                                    <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Sin resultados</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-black text-white">{kpis.guardrailRescueCount}</div>
                                    <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Rescates guardrail</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-black text-white">{kpis.policyQueryCount}</div>
                                    <div className="text-[9px] text-white/30 uppercase tracking-widest mt-1">Consultas policy</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-8">
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.3em]">Distribución Cápsulas</h4>
                    {capsuleUnavailable ? (
                        <div className="flex items-center justify-center h-32 text-amber-500/60 text-xs text-center px-4">
                            Distribución no disponible — migración <code className="font-mono">response_text</code> pendiente en DB
                        </div>
                    ) : intentBuckets.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-white/20 text-xs uppercase tracking-widest">
                            Sin datos aún
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {intentBuckets.map((intent, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-white/60 uppercase">{intent.label}</span>
                                        <span className="text-white">{intent.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${intent.value}%` }}
                                            transition={{ delay: 0.2 + i * 0.1, duration: 1 }}
                                            className={`h-full ${intent.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
