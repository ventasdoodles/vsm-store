/**
 * TAB INTERVENTIONS
 * Operator-facing panel for reviewing and approving intervention recommendations
 * Part of Cesarin OS learning workflow
 *
 * Shows:
 * - Pending intervention recommendations
 * - Signal evidence + diagnosis
 * - Operator decision buttons
 * - Decision history
 *
 * Actions remain manual/out-of-band (no automatic execution)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import {
  getRecommendations,
  recordOperatorDecision,
  acknowledgeSignal
} from '@/services/admin/intervention-workflow.service';
import {
  createImprovementItemFromRecommendation,
  getImprovementItemsByRecommendationIds,
  type ImprovementItem,
} from '@/services/admin/admin-improvement.service';
import { buildAdminImprovementWorkflowViewFromRecommendation } from '@/services/admin/admin-improvement-workflow.service';
import type { InterventionSignal, InterventionRecommendation } from '@/types/cesarin';
import { cn } from '@/lib/utils';
import { CesarinImprovementWorkflowPanel } from './CesarinImprovementWorkflowPanel';

interface RecommendationWithSignal extends InterventionRecommendation {
  signal: InterventionSignal;
}

export function TabInterventions() {
  const [recommendations, setRecommendations] = useState<RecommendationWithSignal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [improvementMap, setImprovementMap] = useState<Record<string, ImprovementItem>>({});


  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    try {
      const recs = await getRecommendations({
        operator_decision: filter === 'pending' ? 'pending' : undefined,
        limit: 50
      });
      setRecommendations(recs);
      setImprovementMap(await getImprovementItemsByRecommendationIds(recs.map((rec) => rec.id)));
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Error loading recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Fetch recommendations on mount and when filter changes
  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleApprove = async (rec: RecommendationWithSignal) => {
    setDecidingId(rec.id);
    try {
      // Get current user
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('No authenticated user');
        return;
      }

      // Record operator decision
      const result = await recordOperatorDecision({
        recommendation_id: rec.id,
        operator_decision: 'approved',
        operator_id: user.id,
        notes: 'Approved for manual execution'
      });

      if (!result) {
        toast.error('Failed to save operator decision');
        return;
      }

      const improvementItem = await createImprovementItemFromRecommendation({
        recommendation: result,
        signal: rec.signal,
      });

      await acknowledgeSignal(rec.signal.id);

      if (improvementItem) {
        setImprovementMap(prev => ({ ...prev, [rec.id]: improvementItem }));
      }

      toast.success('Recommendation approved and promoted to Cola de Mejoras.');
      fetchRecommendations();
    } catch (error) {
      console.error('Error approving recommendation:', error);
      toast.error('Error approving recommendation');
    } finally {
      setDecidingId(null);
    }
  };

  const handleReject = async (rec: RecommendationWithSignal, reason?: string) => {
    setDecidingId(rec.id);
    try {
      const {
        data: { user }
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('No authenticated user');
        return;
      }

      const result = await recordOperatorDecision({
        recommendation_id: rec.id,
        operator_decision: 'rejected',
        operator_id: user.id,
        notes: reason || 'Rejected by operator'
      });

      if (!result) {
        toast.error('Failed to save operator decision');
        return;
      }

      toast.success('Recommendation rejected');
      fetchRecommendations();
    } catch (error) {
      console.error('Error rejecting recommendation:', error);
      toast.error('Error rejecting recommendation');
    } finally {
      setDecidingId(null);
    }
  };

  const pendingCount = recommendations.filter(r => r.operator_decision === 'pending').length;

  return (
    <motion.div
      key="interventions"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="p-10 rounded-[3rem] bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
          <Zap className="h-40 w-40 text-amber-400" />
        </div>

        <div className="relative space-y-4">
          <h2 className="text-2xl font-black text-white flex items-center gap-4">
            <div className="h-10 w-10 rounded-2xl bg-amber-500 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            Recomendaciones del Sistema
          </h2>
          <div className="text-sm text-white/60 max-w-2xl leading-relaxed space-y-1">
            <p>Cesarin detecta automáticamente gaps de enriquecimiento, faltas de compatibilidad y temas recurrentes.</p>
            <p className="text-xs text-white/40">Revisa cada recomendación. Aprobar la promueve a la Cola de Mejoras canonica; rechazar cierra esta ruta sin abrir trabajo.</p>
          </div>
        </div>
      </div>

      {/* Filter & Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-tight transition-all',
              filter === 'pending'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
            )}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-tight transition-all',
              filter === 'all'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
            )}
          >
            Todas
          </button>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-20 text-center space-y-4 rounded-[2rem] border-2 border-dashed border-white/5">
            <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber-500"></div>
            <p className="text-white/40 text-sm">Cargando recomendaciones...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-20 text-center space-y-6 rounded-[3rem] border-2 border-dashed border-white/5">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/5">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
            <p className="text-white/40 text-sm font-medium">
              {filter === 'pending' ? 'No hay intervenciones pendientes. Sistema operando óptimamente.' : 'Sin recomendaciones aún.'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {recommendations.map((rec) => (
              (() => {
                const workflow = buildAdminImprovementWorkflowViewFromRecommendation({
                  recommendation: rec,
                  signal: rec.signal,
                  improvementItem: improvementMap[rec.id] ?? null,
                });
                return (
              <motion.div
                key={rec.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  'rounded-[2rem] border transition-all',
                  rec.operator_decision === 'pending'
                    ? 'bg-white/[0.03] border-amber-500/20 hover:border-amber-500/40 hover:bg-white/[0.05]'
                    : rec.operator_decision === 'approved'
                      ? 'bg-emerald-500/5 border-emerald-500/20'
                      : 'bg-red-500/5 border-red-500/20'
                )}
              >
                <div className="p-6 space-y-4">
                  {/* Signal Type Badge + Evidence */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <span
                        className={cn(
                          'text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg',
                          rec.signal.signal_type === 'enrichment_gap'
                            ? 'bg-violet-500/20 text-violet-400'
                            : rec.signal.signal_type === 'compatibility_miss'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-pink-500/20 text-pink-400'
                        )}
                      >
                        {rec.signal.signal_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-white/40 font-bold">
                        {rec.signal.evidence_count} evidencia
                        {rec.signal.evidence_count !== 1 ? 's' : ''} en{' '}
                        {rec.signal.evidence_window_days}d
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold px-2 py-1 rounded-lg',
                          rec.signal.confidence === 'high'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : rec.signal.confidence === 'medium'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-orange-500/20 text-orange-400'
                        )}
                      >
                        {rec.signal.confidence} confidence
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      {rec.operator_decision === 'pending' && (
                        <Clock className="h-4 w-4 text-amber-400" />
                      )}
                      {rec.operator_decision === 'approved' && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      )}
                      {rec.operator_decision === 'rejected' && (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      <span
                        className={cn(
                          'text-[10px] font-bold uppercase',
                          rec.operator_decision === 'pending'
                            ? 'text-amber-400'
                            : rec.operator_decision === 'approved'
                              ? 'text-emerald-400'
                              : 'text-red-400'
                        )}
                      >
                        {rec.operator_decision}
                      </span>
                      <span className={cn(
                        'text-[10px] font-bold uppercase px-2 py-1 rounded-lg border',
                        workflow.evidenceKind === 'authoritative'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      )}>
                        {workflow.currentStatusLabel}
                      </span>
                    </div>
                  </div>

                  {/* Signal Context */}
                  <div className="text-sm">
                    <p className="text-white/80 font-medium">
                      {rec.signal.product_id ? `Product: ${rec.signal.product_id}` : ''}
                      {rec.signal.category ? ` · Category: ${rec.signal.category}` : ''}
                      {!rec.signal.product_id && !rec.signal.category ? 'System-wide signal' : ''}
                    </p>
                  </div>

                  {/* Diagnosis Section */}
                  <button
                    onClick={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                    className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-amber-400" />
                          <span className="text-sm font-bold text-white">
                            {rec.intervention_type === 'enrichment'
                              ? 'Enriquecimiento de Producto'
                              : rec.intervention_type === 'compatibility'
                                ? 'Actualizar Matriz de Compatibilidad'
                                : 'Crear Playbook de Escalación'}
                          </span>
                        </div>
                        <p className="text-xs text-white/60 line-clamp-2">
                          {rec.diagnosis.root_cause}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-[10px] font-black text-amber-400 uppercase">
                          {rec.diagnosis.effort_hours}h esfuerzo
                        </p>
                        <p
                          className={cn(
                            'text-[10px] font-bold uppercase',
                            rec.diagnosis.estimated_impact === 'high'
                              ? 'text-emerald-400'
                              : rec.diagnosis.estimated_impact === 'medium'
                                ? 'text-amber-400'
                                : 'text-white/40'
                          )}
                        >
                          Impacto: {rec.diagnosis.estimated_impact}
                        </p>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Diagnosis Details */}
                  {expandedId === rec.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4 p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-wide mb-2">
                          Raíz del Problema
                        </p>
                        <p className="text-sm text-white/80">{rec.diagnosis.root_cause}</p>
                      </div>

                      <div>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-wide mb-2">
                          Razonamiento
                        </p>
                        <p className="text-sm text-white/80">{rec.diagnosis.reasoning}</p>
                      </div>

                      {rec.diagnosis.implementation_notes && (
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-wide mb-2">
                            Notas de Implementación
                          </p>
                          <p className="text-sm text-white/80">{rec.diagnosis.implementation_notes}</p>
                        </div>
                      )}

                      {rec.operator_notes && (
                        <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-wide mb-2">
                            Notas del Operador
                          </p>
                          <p className="text-sm text-white/80 italic">{rec.operator_notes}</p>
                        </div>
                      )}

                      <CesarinImprovementWorkflowPanel
                        workflow={workflow}
                        title="Workflow de recomendación a cierre"
                      />
                    </motion.div>
                  )}

                  {/* Operator Decision Buttons (only for pending) */}
                  {rec.operator_decision === 'pending' && (
                    <div className="flex gap-3 pt-4 border-t border-white/5">
                      <button
                        onClick={() => handleApprove(rec)}
                        disabled={decidingId === rec.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-bold uppercase tracking-tight border border-emerald-500/20 hover:bg-emerald-500 hover:text-white disabled:opacity-50 transition-all"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        {decidingId === rec.id ? 'Procesando...' : 'Aprobar'}
                      </button>
                      <button
                        onClick={() => handleReject(rec, 'Not applicable at this time')}
                        disabled={decidingId === rec.id}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm font-bold uppercase tracking-tight border border-red-500/20 hover:bg-red-500 hover:text-white disabled:opacity-50 transition-all"
                      >
                        <XCircle className="h-4 w-4" />
                        {decidingId === rec.id ? 'Procesando...' : 'Rechazar'}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
                );
              })()
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footnote */}
      <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-[11px] text-white/40 space-y-2">
        <p className="flex items-start gap-2">
          <span className="font-bold text-amber-400">⚠️ Nota:</span>
          <span>
            Las aprobaciones abren seguimiento gobernado en Cola de Mejoras. La ejecución de intervenciones
            (enriquecimiento de productos, actualizaciones de compatibilidad, etc.) sigue siendo manual y fuera de banda.
          </span>
        </p>
      </div>
    </motion.div>
  );
}
