import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MessageSquare, Brain, Loader2, ShoppingCart, ShieldAlert, AlertTriangle } from 'lucide-react';
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
        { label: 'Busqueda comercial', count: search, color: 'bg-vape-500' },
        { label: 'Consulta documental', count: knowledge, color: 'bg-indigo-500' },
        { label: 'Operacion de carrito', count: cart, color: 'bg-emerald-500' },
        { label: 'Fallback o sin capsule', count: Math.max(0, fallback), color: 'bg-white/10' },
    ].filter(bucket => bucket.count > 0);

    return buckets.map(bucket => ({
        label: bucket.label,
        value: Math.round((bucket.count / totalInteractions) * 100),
        color: bucket.color,
    }));
}

export function TabAnalytics() {
    const [kpis, setKpis] = useState<PilotKPIs | null>(null);
    const [intentBuckets, setIntentBuckets] = useState<IntentBucket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [capsuleUnavailable, setCapsuleUnavailable] = useState(false);

    useEffect(() => {
        const { from, to } = getDateRange();
        setLoading(true);

        getPilotKPIs(from, to)
            .then((kpiData) => {
                setKpis(kpiData);

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
                        setCapsuleUnavailable(true);
                    });
            })
            .catch((err) => {
                setError(err instanceof Error ? err.message : 'Error cargando historico');
            })
            .finally(() => setLoading(false));
    }, []);

    const stats = kpis
        ? [
              {
                  label: 'Consultas en 30 dias',
                  value: kpis.totalInteractions.toLocaleString(),
                  sub: kpis.totalInteractions === 0 ? 'Sin actividad todavia' : `${kpis.totalCartActions} señales de carrito`,
                  icon: MessageSquare,
                  color: 'text-vape-400',
                  bg: 'bg-vape-500/10',
              },
              {
                  label: 'Resolucion semantica',
                  value: kpis.totalInteractions === 0 ? '—' : `${(kpis.semanticMatchRate * 100).toFixed(1)}%`,
                  sub: 'Respuestas comerciales con match util',
                  icon: TrendingUp,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
              },
              {
                  label: 'Frustracion detectada',
                  value: kpis.totalInteractions === 0 ? '—' : `${(kpis.frustrationRate * 100).toFixed(1)}%`,
                  sub: 'Senal negativa en turnos reales',
                  icon: Brain,
                  color: kpis.frustrationRate > 0.15 ? 'text-rose-400' : 'text-indigo-400',
                  bg: kpis.frustrationRate > 0.15 ? 'bg-rose-500/10' : 'bg-indigo-500/10',
              },
              {
                  label: 'Latencia media',
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
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-white/30" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-64 items-center justify-center text-sm text-rose-400">
                Error cargando historico: {error}
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
            <div className="rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8">
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
                    <div className="space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Lectura historica</div>
                        <h3 className="text-2xl font-black tracking-tight text-white">Resumen para entender tendencia, no para decidir casos</h3>
                        <p className="max-w-2xl text-sm leading-relaxed text-white/50">
                            Esta vista sirve para leer volumen, mezcla de rutas y degradaciones del último mes. Si necesitas revisar una respuesta puntual o intervenir hoy, vuelve a Operacion diaria.
                        </p>
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-black/20 p-5">
                        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-vape-400">Que te debe decir esta tab</div>
                        <ul className="mt-3 space-y-2 text-sm text-white/50">
                            <li>Si el sistema viene mejorando o empeorando.</li>
                            <li>Si estan subiendo misses, rescates o frustracion.</li>
                            <li>Si la mezcla de consultas cambió por tipo de ruta.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <div key={index} className="space-y-4 rounded-[2.5rem] border border-white/5 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04]">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-white">{stat.value}</div>
                            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</div>
                            <div className={`mt-2 text-[10px] font-bold ${stat.color}/60`}>{stat.sub}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="space-y-5 rounded-[3rem] border border-white/5 bg-white/[0.02] p-8 lg:col-span-2">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Lo que mas pesa en el historico</div>
                            <h4 className="mt-2 text-xl font-black tracking-tight text-white">Señales que mueven la lectura del mes</h4>
                        </div>
                        <TrendingUp className="h-6 w-6 text-white/20" />
                    </div>

                    {kpis?.totalInteractions === 0 ? (
                        <div className="rounded-[2rem] border border-white/5 bg-black/20 p-8 text-sm text-white/35">
                            Aun no hay suficiente actividad para una lectura historica.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="rounded-[2rem] border border-red-500/10 bg-red-500/5 p-5">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-400" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Sin resultado</div>
                                </div>
                                <div className="mt-3 text-3xl font-black text-white">{kpis!.zeroProductCardCount}</div>
                                <p className="mt-2 text-sm text-white/45">Consultas de producto que terminaron sin cards y merecen lectura operativa.</p>
                            </div>

                            <div className="rounded-[2rem] border border-amber-500/10 bg-amber-500/5 p-5">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert className="h-5 w-5 text-amber-400" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400">Rescates de seguridad</div>
                                </div>
                                <div className="mt-3 text-3xl font-black text-white">{kpis!.guardrailRescueCount}</div>
                                <p className="mt-2 text-sm text-white/45">Casos donde la red de seguridad tuvo que corregir la ruta original.</p>
                            </div>

                            <div className="rounded-[2rem] border border-indigo-500/10 bg-indigo-500/5 p-5">
                                <div className="flex items-center gap-3">
                                    <Brain className="h-5 w-5 text-indigo-400" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Consultas documentales</div>
                                </div>
                                <div className="mt-3 text-3xl font-black text-white">{kpis!.policyQueryCount}</div>
                                <p className="mt-2 text-sm text-white/45">Turnos de policy o conocimiento que se alejaron de la compra directa.</p>
                            </div>

                            <div className="rounded-[2rem] border border-emerald-500/10 bg-emerald-500/5 p-5">
                                <div className="flex items-center gap-3">
                                    <ShoppingCart className="h-5 w-5 text-emerald-400" />
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Intencion de carrito</div>
                                </div>
                                <div className="mt-3 text-3xl font-black text-white">{kpis!.totalCartActions}</div>
                                <p className="mt-2 text-sm text-white/45">Señales comerciales donde el usuario ya estaba entrando en modo compra.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-8 rounded-[3rem] border border-white/5 bg-white/[0.02] p-8">
                    <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white">Distribucion de rutas</h4>
                    {capsuleUnavailable ? (
                        <div className="flex h-32 items-center justify-center px-4 text-center text-xs text-amber-500/60">
                            La distribucion de rutas no esta disponible en esta base. Los KPIs generales siguen siendo validos.
                        </div>
                    ) : intentBuckets.length === 0 ? (
                        <div className="flex h-32 items-center justify-center text-xs uppercase tracking-widest text-white/20">
                            Sin datos aun
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {intentBuckets.map((intent, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-bold">
                                        <span className="uppercase text-white/60">{intent.label}</span>
                                        <span className="text-white">{intent.value}%</span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${intent.value}%` }}
                                            transition={{ delay: 0.2 + index * 0.1, duration: 1 }}
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
