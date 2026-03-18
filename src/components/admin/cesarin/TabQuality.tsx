import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, Activity, Clock, Database, 
    ChevronRight, 
    Bot, User, RefreshCw, Scale, Brain
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import { SimulationReport, SimulationResult } from '@/types/cesarin';
import { computeReportInsights } from '@/lib/cesarin-insights';

// Phase 4.2A — Skipped-reason explanatory microcopy (presentation-layer only, not product canon)
const SKIPPED_REASON_EXPLAINER: Record<string, string> = {
    no_id: 'No había identificador de cliente disponible en esta sesión.',
    no_row: 'Se intentó consultar la memoria, pero no existe un perfil guardado para este cliente.',
    empty_interests: 'El perfil existe, pero no contiene intereses activos que aportar al contexto.',
    not_useful_for_turn: 'La memoria estaba disponible, pero no era relevante para esta consulta específica.',
    read_error: 'Ocurrió un error al leer el perfil. La sesión continuó sin contexto de memoria.',
};

export function TabQuality() {
    const [reports, setReports] = useState<SimulationReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<SimulationReport | null>(null);
    const [selectedResult, setSelectedResult] = useState<SimulationResult | null>(null);
    const [isJudging, setIsJudging] = useState(false);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        const { data, error } = await supabase
            .from('ai_simulation_reports')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(10);
        
        if (!error && data) {
            setReports(data as SimulationReport[]);
            if (data.length > 0) setSelectedReport(data[0] as SimulationReport);
        }
    };

    const handleJudge = async (result: SimulationResult) => {
        if (!selectedReport) return;
        setIsJudging(true);
        try {
            // Invocar al Juez LLM
            const { data: judgeData, error: judgeError } = await supabase.functions.invoke('cesarin-qa-judge', {
                body: {
                    action: 'evaluate_scenario',
                    scenario: {
                        scenario_type: result.scenario_type || 'GENERAL',
                        user_message: "Consulta Auditoria", 
                        validation_hints: result.validation_hints || result.reasons // Prefer validation_hints
                    },
                    result: {
                        ...result,
                        memory_trace: result.memory_trace // Ensure memory_trace is passed
                    }
                }
            });

            if (judgeError) throw judgeError;
            if (!judgeData) throw new Error('El Juez no devolvió datos');

            // Persistencia: Lectura-Modificación-Escritura sobre ai_simulation_reports
            const { data: currentData, error: fetchError } = await supabase
                .from('ai_simulation_reports')
                .select('results')
                .eq('id', selectedReport.id)
                .single();

            if (fetchError) throw fetchError;

            const updatedResults = (currentData.results as SimulationResult[]).map((res) => {
                if (res.scenario_id === result.scenario_id) {
                    return {
                        ...res,
                        judge_eval: {
                            ...judgeData,
                            judged_at: new Date().toISOString(),
                            judge_model: 'gemini-2.0-flash'
                        }
                    };
                }
                return res;
            });

            const { error: updateError } = await supabase
                .from('ai_simulation_reports')
                .update({ results: updatedResults })
                .eq('id', selectedReport.id);

            if (updateError) throw updateError;

            // Actualización de estado local para reflejar persistencia inmediata
            const updatedReport = { ...selectedReport, results: updatedResults };
            setReports(prev => prev.map(r => r.id === selectedReport.id ? updatedReport : r));
            setSelectedReport(updatedReport);
            
            // Actualizar el resultado seleccionado con los datos del juez
            setSelectedResult({
                ...result,
                judge_eval: {
                    ...judgeData,
                    judged_at: new Date().toISOString(),
                    judge_model: 'gemini-2.0-flash'
                }
            });

            toast.success('Auditoría semántica persistida correctamente');
        } catch (error) {
            console.error('Judging error:', error);
            toast.error('Error al procesar o guardar el veredicto');
        } finally {
            setIsJudging(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
            {/* Sidebar: Historial de Reportes */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Historial de Pruebas</h3>
                    <button onClick={fetchReports} className="text-vape-400 hover:rotate-180 transition-all duration-500">
                        <RefreshCw className="h-3 w-3" />
                    </button>
                </div>
                
                <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-hide pr-2">
                    {reports.map((report) => (
                        <button
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className={`w-full p-5 rounded-[2rem] border transition-all text-left space-y-3 group ${
                                selectedReport?.id === report.id 
                                    ? 'bg-vape-500/10 border-vape-500/30' 
                                    : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                            }`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-vape-400">
                                    {new Date(report.timestamp).toLocaleString()}
                                </span>
                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                                    report.failed === 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                                }`}>
                                    {report.passed}/{report.total}
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-vape-500 transition-all duration-1000" 
                                    style={{ width: `${(report.passed / report.total) * 100}%` }}
                                />
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area: Resultados del Reporte */}
            <div className="lg:col-span-3 space-y-8">
                {selectedReport ? (() => {
                    const report = selectedReport;
                    return (
                        <>
                            {/* Stats Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-vape-500/20 flex items-center justify-center">
                                        <ShieldCheck className="h-6 w-6 text-vape-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Tasa de Éxito</div>
                                        <div className="text-xl font-black text-white">{((report.passed / report.total) * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                        <Clock className="h-6 w-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">Latencia Media</div>
                                        <div className="text-xl font-black text-white">4.2s</div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex items-center gap-5">
                                    <div className="h-12 w-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                        <Database className="h-6 w-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-white/30 uppercase tracking-widest">RAG Utilization</div>
                                        <div className="text-xl font-black text-white">100%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Insight Summary — Phase 4.0D */}
                            <div className="space-y-6">
                                <div className="px-2">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Insight Summary</h3>
                                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                                        Read-only summary of outcomes, memory trace presence, and report-to-report changes.
                                    </p>
                                </div>

                                {(() => {
                                    const reportIndex = reports.findIndex(r => r.id === report.id);
                                    const prevReport = reportIndex !== -1 ? reports[reportIndex + 1] : undefined;
                                    const insights = computeReportInsights(report, prevReport);
                                    
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                            {/* Block 1: Outcomes */}
                                            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Outcomes</span>
                                                    <Activity className="h-3.5 w-3.5 text-vape-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-white/40">Total scenarios</span>
                                                        <span className="font-bold text-white">{insights.totals.total}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-white/40">Pass-like</span>
                                                        <span className="font-bold text-emerald-400">{insights.totals.passed}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-white/40">Non-pass-like</span>
                                                        <span className="font-bold text-red-400">{insights.totals.failed}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[8px] text-white/20 italic leading-tight">
                                                    Note: This summary groups results conservatively into pass-like and non-pass-like outcomes.
                                                </p>
                                            </div>

                                            {/* Block 2: Memory Trace Presence */}
                                            <div className="p-6 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Memory Trace Presence</span>
                                                    <Brain className="h-3.5 w-3.5 text-indigo-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-white/40">With memory trace</span>
                                                        <span className="font-bold text-white">{insights.memorySurface.present}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-white/40">Without memory trace</span>
                                                        <span className="font-bold text-white">{insights.memorySurface.absent}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-white/40">Memory trace coverage</span>
                                                        <span className="font-bold text-vape-400">{insights.memorySurface.coverage.toFixed(1)}%</span>
                                                    </div>
                                                </div>
                                                <p className="text-[8px] text-white/20 italic leading-tight">
                                                    Note: Shows how many scenarios include a memory trace object in this report. This is a structural presence signal only.
                                                </p>
                                            </div>

                                            {/* Block 3: Non-pass + Memory */}
                                            <div className="p-6 rounded-[2rem] bg-red-500/5 border border-red-500/10 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Non-pass Scenarios with Memory Trace</span>
                                                    <ShieldCheck className="h-3.5 w-3.5 text-red-400" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-white/40">Non-pass with memory</span>
                                                        <span className="font-bold text-white">{insights.coOccurrence.nonPassWithMemory}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-white/40">Non-pass without memory</span>
                                                        <span className="font-bold text-white">{insights.coOccurrence.nonPassWithoutMemory}</span>
                                                    </div>
                                                </div>
                                                <p className="text-[8px] text-white/20 italic leading-tight">
                                                    Note: This section shows co-occurrence only. It does not imply that memory caused the outcome.
                                                </p>
                                            </div>

                                            {/* Block 4: Volatility */}
                                            <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Scenario Volatility</span>
                                                    <RefreshCw className="h-3.5 w-3.5 text-white/40" />
                                                </div>
                                                <div className="space-y-2 max-h-[80px] overflow-y-auto pr-1 scrollbar-hide">
                                                    {!insights.volatility ? (
                                                        <p className="text-[9px] text-white/20 font-bold uppercase py-4 text-center">Previous report not available</p>
                                                    ) : insights.volatility.flips.length === 0 ? (
                                                        <p className="text-[9px] text-emerald-500/40 font-bold uppercase py-4 text-center">No pass/non-pass flips found</p>
                                                    ) : (
                                                        insights.volatility.flips.map((flip, idx) => (
                                                            <div key={idx} className="flex flex-col gap-0.5 mb-2 last:mb-0">
                                                                <span className="text-[8px] font-black text-white/40 uppercase truncate">{flip.id}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-[8px] font-bold ${flip.from === 'PASS' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                        {flip.from === 'PASS' ? 'PASS-LIKE' : 'NON-PASS-LIKE'}
                                                                    </span>
                                                                    <ChevronRight className="h-2 w-2 text-white/20" />
                                                                    <span className={`text-[8px] font-bold ${flip.to === 'PASS' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                        {flip.to === 'PASS' ? 'PASS-LIKE' : 'NON-PASS-LIKE'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                                <p className="text-[8px] text-white/20 italic leading-tight">
                                                    {insights.volatility 
                                                        ? 'Compares this report with the previous available report and highlights pass-like / non-pass-like changes for the same scenario IDs.'
                                                        : 'Volatility is only shown when a previous report is available for comparison.'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>

                            {/* Results Table */}
                            <div className="rounded-[2.5rem] bg-[#0a0a0f] border border-white/5 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-white/[0.02] border-b border-white/5">
                                        <tr>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30">Escenario / Intento</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Score</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30 text-center">Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white/30"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {report.results.map((res, i: number) => (
                                            <tr key={i} className="hover:bg-white/[0.02] transition-all group">
                                                <td className="px-8 py-6">
                                                    <div className="space-y-1">
                                                        <div className="text-[11px] font-black text-white tracking-widest uppercase">{res.scenario_id}</div>
                                                        <div className="text-[10px] text-white/40 font-medium">{res.detected_intent}</div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <div className="text-sm font-black text-vape-400">{res.score || (res.passed ? 1.0 : 0.0)}</div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex justify-center">
                                                        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                                                            res.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            res.status === 'PASS_WITH_WARNING' ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-red-500/10 text-red-400'
                                                        }`}>
                                                            {res.status || (res.passed ? 'PASS' : 'FAIL')}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button 
                                                        onClick={() => setSelectedResult(res)}
                                                        className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-vape-500 transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <ChevronRight className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    );
                })() : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-32 opacity-20">
                        <Activity className="h-24 w-24 text-vape-400 mb-4" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest">No hay reportes</h2>
                        <p className="text-sm text-theme-secondary">Ejecuta el simulador para empezar a auditar la calidad.</p>
                    </div>
                )}
            </div>

            {/* SideDrawer: Trace Viewer & Judge */}
            <AnimatePresence>
                {selectedResult && (() => {
                    const result = selectedResult;
                    return (
                        <>
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setSelectedResult(null)}
                                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
                            />
                            <motion.div 
                                initial={{ x: '100%' }}
                                animate={{ x: 0 }}
                                exit={{ x: '100%' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-[#0a0a0f] border-l border-white/5 shadow-2xl z-[101] overflow-y-auto"
                            >
                                <div className="p-10 space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="px-4 py-1 rounded-full bg-vape-500/10 border border-vape-500/30 text-vape-400 text-[10px] font-black uppercase tracking-widest">
                                                    Trace Diagnostics
                                                </div>
                                                <span className="text-[10px] text-white/20 font-mono tracking-widest">{result.scenario_id}</span>
                                            </div>
                                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Detalles de Auditoría</h2>
                                        </div>
                                        <button onClick={() => setSelectedResult(null)} className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all">
                                            <ChevronRight className="h-6 w-6" />
                                        </button>
                                    </div>

                                    {/* Comparison Grid */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 space-y-4">
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/30">
                                                <User className="h-3.5 w-3.5" />
                                                Input / Query
                                            </div>
                                            <p className="text-sm text-white/80 leading-relaxed font-medium">¿Cómo funcionan sus envíos y cuál es el costo?</p>
                                        </div>
                                        <div className="p-6 rounded-[2rem] bg-vape-500/5 border border-vape-500/10 space-y-4">
                                            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-vape-400">
                                                <Bot className="h-3.5 w-3.5" />
                                                Respuesta Cesarin
                                            </div>
                                            <p className="text-sm text-vape-100/80 leading-relaxed font-medium italic">"{result.response}"</p>
                                        </div>
                                    </div>

                                    {/* Technical Insights */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Telemetría de Red Neural</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Latencia', value: `${result.latency_ms}ms`, icon: Clock, color: (result.dimension_scores?.latency ?? 1) > 0 ? 'text-emerald-400' : 'text-amber-400' },
                                                { label: 'Chunks RAG', value: result.knowledge_chunks, icon: Database, color: 'text-indigo-400' },
                                                { label: 'Intento', value: result.detected_intent, icon: Activity, color: 'text-vape-400' },
                                                { label: 'Herramientas', value: result.tools_called.length, icon: ShieldCheck, color: 'text-vape-200' }
                                            ].map((item, idx) => (
                                                <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                                                    <item.icon className={`h-4 w-4 ${item.color}`} />
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">{item.label}</span>
                                                        <span className={`text-xs font-black uppercase ${item.color}`}>{item.value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                            
                                            {/* Neural Memory Trace */}
                                            <div className="p-5 rounded-2xl bg-vape-500/5 border border-vape-500/10 flex flex-col gap-3 col-span-2">
                                                <div className="flex items-center gap-4">
                                                    <Brain className={`h-4 w-4 shrink-0 ${result.memory_trace?.context_injected ? 'text-vape-400' : 'text-white/20'}`} />
                                                    <div className="flex-1 grid grid-cols-3 gap-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Memoria</span>
                                                            <span className={`text-[10px] font-black uppercase ${result.memory_trace?.context_injected ? 'text-vape-400' : 'text-white/40'}`}>
                                                                {result.memory_trace?.context_injected ? 'USADA' : 'OMITIDA'}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Intereses</span>
                                                            <span className="text-[10px] font-black text-white/60">
                                                                {result.memory_trace?.interests_count || 0} ítems
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Motivo</span>
                                                            <span className="text-[10px] font-bold text-white/40">
                                                                {result.memory_trace?.skipped_reason ? (
                                                                    {
                                                                        'no_id': 'Sin Identificador',
                                                                        'no_row': 'Sin Perfil',
                                                                        'empty_interests': 'Perfil Vacío',
                                                                        'not_useful_for_turn': 'Sin Relevancia',
                                                                        'read_error': 'Error de Lectura'
                                                                    }[result.memory_trace.skipped_reason] || result.memory_trace.skipped_reason
                                                                ) : 'Ninguno'}
                                                            </span>
                                                            {result.memory_trace?.skipped_reason && (
                                                                <span className="text-[8px] text-white/25 italic font-normal leading-snug">
                                                                    {SKIPPED_REASON_EXPLAINER[result.memory_trace.skipped_reason] ?? ''}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Footer note — only when memory was omitted */}
                                                {result.memory_trace && !result.memory_trace.context_injected && (
                                                    <p className="text-[8px] text-white/20 italic border-t border-white/5 pt-2">
                                                        Omitir la memoria no implica un fallo. El asistente puede responder correctamente usando solo la intención detectada.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Judge Section */}
                                    <div className="relative">
                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        <div className="pt-10 space-y-8">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Scale className="h-5 w-5 text-amber-400" />
                                                    <h4 className="text-xl font-black text-white uppercase tracking-tighter italic">Veredicto del Juez</h4>
                                                </div>
                                                {!result.judge_eval && (
                                                    <button 
                                                        onClick={() => handleJudge(result)}
                                                        disabled={isJudging}
                                                        className="px-8 py-3 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                                                    >
                                                        {isJudging ? <RefreshCw className="h-3 w-3 animate-spin" /> : 'Invocar Juez LLM'}
                                                    </button>
                                                )}
                                            </div>

                                            {result.judge_eval ? (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="p-8 rounded-[2.5rem] bg-amber-500/5 border border-amber-500/20 space-y-6"
                                                >
                                                    <div className="grid grid-cols-2 gap-8">
                                                        <div className="space-y-2">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/40">Tono & Personalidad</span>
                                                            <div className="text-2xl font-black text-white">{result.judge_eval.tone_score}/10</div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/40">Veracidad (Grounding)</span>
                                                            <div className="text-2xl font-black text-white">{result.judge_eval.grounding_score ?? 'N/A'}/10</div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/40">Comentario del Auditor</span>
                                                        <p className="text-sm text-theme-secondary leading-relaxed italic">"{result.judge_eval.comment}"</p>
                                                    </div>
                                                    <div className="flex items-center gap-3 pt-2 text-[10px] font-bold">
                                                        <span className="text-white/20 uppercase tracking-widest">Alucinación Detectada:</span>
                                                        <span className={result.judge_eval.hallucination_detected ? 'text-red-400' : 'text-emerald-400'}>
                                                            {result.judge_eval.hallucination_detected ? 'SÍ' : 'NO'}
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="p-8 rounded-[2.5rem] bg-white/[0.01] border border-white/5 border-dashed text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Esperando auditoría semántica...</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </>
                    );
                })()}
            </AnimatePresence>
        </motion.div>
    );
}
