import { useState, useEffect } from 'react';
import {
  Search, Plus, ChevronDown, ChevronRight,
  Settings2, Tag, Link2, Trash2, Edit3,
  HelpCircle, CheckCircle2, XCircle, Info, Database, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminCompatibilityService, Concept, Alias, Relation } from '@/services/admin-compatibility.service';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export function TabConcepts() {
  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedConcept, setExpandedConcept] = useState<string | null>(null);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [allConceptOptions, setAllConceptOptions] = useState<Concept[]>([]);
  const [newAlias, setNewAlias] = useState('');
  const [isCreatingConcept, setIsCreatingConcept] = useState(false);
  const [newConcept, setNewConcept] = useState({ name: '', concept_type: 'device', brand: '' });

  const [isAddingRelation, setIsAddingRelation] = useState(false);
  const [newRelation, setNewRelation] = useState<{ concept_b_id: string; relation_type: string; scope: string; status: string }>({
    concept_b_id: '',
    relation_type: 'recommended_for_liquid',
    scope: 'specific_model',
    status: 'unknown_unconfirmed'
  });

  const fetchConcepts = async () => {
    setLoading(true);
    try {
      const data = await adminCompatibilityService.fetchConcepts(search);
      setConcepts(data);
    } catch (_error) {
      toast.error('Error al cargar conceptos');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllConceptOptions = async () => {
    try {
      const data = await adminCompatibilityService.fetchConcepts();
      setAllConceptOptions(data);
    } catch (_error) {
      toast.error('Error al cargar opciones de conceptos');
    }
  };

  const refreshExpandedConceptDetails = async (conceptId: string) => {
    const [rels, als] = await Promise.all([
      adminCompatibilityService.fetchRelations(conceptId),
      adminCompatibilityService.fetchAliases(conceptId)
    ]);

    setRelations(rels);
    setAliases(als);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchConcepts();
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    fetchAllConceptOptions();
  }, []);

  const toggleExpand = async (conceptId: string) => {
    if (expandedConcept === conceptId) {
      setExpandedConcept(null);
      setRelations([]);
      setAliases([]);
      setIsAddingRelation(false);
      setNewAlias('');
    } else {
      setExpandedConcept(conceptId);
      setIsAddingRelation(false);
      setNewAlias('');
      try {
        await refreshExpandedConceptDetails(conceptId);
      } catch (_error) {
        toast.error('Error al cargar detalles');
      }
    }
  };

  const handleUpdateRelationStatus = async (relId: string, status: Relation['status']) => {
    if (!expandedConcept) return;
    try {
      await adminCompatibilityService.updateRelation(relId, { status });
      await refreshExpandedConceptDetails(expandedConcept);
      toast.success('Estatus actualizado');
    } catch (_error) {
      toast.error('Error al actualizar');
    }
  };

  const handleUpdateRelationNotes = async (relId: string, notes: string) => {
    if (!expandedConcept) return;
    try {
      await adminCompatibilityService.updateRelation(relId, { notes });
      await refreshExpandedConceptDetails(expandedConcept);
      toast.success('Notas guardadas');
    } catch (_error) {
      toast.error('Error al guardar notas');
    }
  };

  const handleDeleteRelation = async (relId: string) => {
    if (!expandedConcept) return;
    if (!window.confirm('Eliminar esta relacion de forma permanente?')) return;
    try {
      await adminCompatibilityService.deleteRelation(relId);
      await refreshExpandedConceptDetails(expandedConcept);
      await fetchConcepts();
      await fetchAllConceptOptions();
      toast.success('Relacion eliminada');
    } catch (_error) {
      toast.error('Error al eliminar relacion');
    }
  };

  const handleSaveNewRelation = async () => {
    if (!expandedConcept) return;
    if (!newRelation.concept_b_id) {
      toast.error('Debes seleccionar un concepto destino');
      return;
    }

    try {
      await adminCompatibilityService.addRelation({
        concept_a_id: expandedConcept,
        concept_b_id: newRelation.concept_b_id,
        relation_type: newRelation.relation_type,
        scope: newRelation.scope,
        status: newRelation.status
      });
      toast.success('Relacion direccional creada');
      setIsAddingRelation(false);
      await refreshExpandedConceptDetails(expandedConcept);
      await fetchConcepts();
      await fetchAllConceptOptions();
    } catch (error: any) {
      toast.error(error.message || 'Error al crear relacion (posible duplicado)');
    }
  };

  const handleAddAlias = async () => {
    if (!expandedConcept) return;
    if (!newAlias.trim()) {
      toast.error('Debes escribir un alias');
      return;
    }

    try {
      await adminCompatibilityService.addAlias(expandedConcept, newAlias.trim());
      await refreshExpandedConceptDetails(expandedConcept);
      await fetchConcepts();
      await fetchAllConceptOptions();
      setNewAlias('');
      toast.success('Alias agregado');
    } catch (error: any) {
      toast.error(error.message || 'Error al agregar alias');
    }
  };

  const handleRemoveAlias = async (aliasId: string) => {
    if (!expandedConcept) return;
    if (!window.confirm('Eliminar este alias de forma permanente?')) return;

    try {
      await adminCompatibilityService.removeAlias(aliasId);
      await refreshExpandedConceptDetails(expandedConcept);
      await fetchConcepts();
      await fetchAllConceptOptions();
      toast.success('Alias eliminado');
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar alias');
    }
  };

  const handleCreateConcept = async () => {
    if (!newConcept.name.trim() || !newConcept.concept_type.trim()) {
      toast.error('Nombre y tipo son obligatorios');
      return;
    }

    try {
      await adminCompatibilityService.addConcept({
        name: newConcept.name.trim(),
        concept_type: newConcept.concept_type.trim(),
        brand: newConcept.brand.trim() || undefined,
      });
      await fetchConcepts();
      await fetchAllConceptOptions();
      setNewConcept({ name: '', concept_type: 'device', brand: '' });
      setIsCreatingConcept(false);
      toast.success('Concepto creado');
    } catch (error: any) {
      toast.error(error.message || 'Error al crear concepto');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Vista avanzada</div>
          <p className="max-w-3xl text-sm leading-relaxed text-white/45">
            Este modulo concentra la compatibilidad operativa, taxonomia y relaciones persistidas que Cesarin usa para resolver encajes de producto.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
              <input
                type="text"
                placeholder="Buscar concepto, marca o alias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              />
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              <div className="max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Compatibilidad activa</div>
                <p className="mt-2 text-xs leading-relaxed text-white/45">
                  Esta vista ya permite crear conceptos y administrar aliases/relaciones persistidas. El conteo de relaciones suma edges entrantes y salientes; la eliminacion de conceptos sigue fuera de este workbench.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingConcept((current) => !current)}
                className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300 transition-all hover:bg-indigo-500/20"
              >
                {isCreatingConcept ? 'Cancelar concepto nuevo' : 'Crear concepto'}
              </button>
            </div>
          </div>

          {isCreatingConcept && (
            <div className="rounded-[2rem] border border-indigo-500/20 bg-indigo-500/5 p-6 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Nuevo concepto persistido</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  value={newConcept.name}
                  onChange={(e) => setNewConcept((current) => ({ ...current, name: e.target.value }))}
                  placeholder="Nombre del concepto"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
                <input
                  value={newConcept.concept_type}
                  onChange={(e) => setNewConcept((current) => ({ ...current, concept_type: e.target.value }))}
                  placeholder="Tipo taxonomico"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
                <input
                  value={newConcept.brand}
                  onChange={(e) => setNewConcept((current) => ({ ...current, brand: e.target.value }))}
                  placeholder="Marca (opcional)"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsCreatingConcept(false)}
                  className="px-4 py-2 text-xs font-bold text-white/40 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateConcept}
                  className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                >
                  Guardar concepto
                </button>
              </div>
            </div>
          )}

          <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
              <div className="col-span-1 text-center">GAP</div>
              <div className="col-span-4 px-4">Concepto Taxonomico</div>
              <div className="col-span-2 text-center">Clasificacion</div>
              <div className="col-span-2 text-center">Aliases</div>
              <div className="col-span-2 text-center">Relaciones (Edges)</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y divide-white/5">
              {loading && concepts.length === 0 ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <div className="h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-white/20 text-xs font-black uppercase tracking-widest">Consultando conceptos...</span>
                </div>
              ) : concepts.length === 0 ? (
                <div className="p-20 text-center text-white/20 text-xs font-black uppercase tracking-widest">
                  No se encontraron conceptos en la base de compatibilidad.
                </div>
              ) : (
                concepts.map((concept) => {
                  const hasAliasGap = (concept.alias_count || 0) === 0;
                  const hasRelationGap = (concept.relation_count || 0) === 0;
                  const hasGap = hasAliasGap || hasRelationGap;

                  return (
                    <div key={concept.id} className="group">
                      <div
                        onClick={() => toggleExpand(concept.id)}
                        className={cn(
                          'grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.03] transition-all cursor-pointer',
                          expandedConcept === concept.id && 'bg-white/[0.05]'
                        )}
                      >
                        <div className="col-span-1 flex justify-center">
                          {hasGap ? (
                            <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" title="Incompleto (Falta alias/relacion)" />
                          ) : (
                            <div className="h-2 w-2 rounded-full bg-indigo-500/20 border border-indigo-500" title="Concepto sano" />
                          )}
                        </div>
                        <div className="col-span-4 px-4 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                            <Settings2 className="h-5 w-5 text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-white truncate pr-2">{concept.name}</div>
                            <div className="text-[10px] text-white/40 font-medium truncate">{concept.brand || 'Generico'}</div>
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/60">
                            {concept.concept_type}
                          </span>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className={cn('flex items-center justify-center gap-1.5 text-xs font-bold', hasAliasGap ? 'text-amber-400' : 'text-vape-400')}>
                            <Tag className="h-3 w-3" />
                            {concept.alias_count}
                          </div>
                        </div>
                        <div className="col-span-2 text-center">
                          <div className={cn('flex items-center justify-center gap-1.5 text-xs font-bold', hasRelationGap ? 'text-amber-400' : 'text-indigo-400')}>
                            <Link2 className="h-3 w-3" />
                            {concept.relation_count}
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-end">
                          {expandedConcept === concept.id ? <ChevronDown className="h-4 w-4 text-white/20" /> : <ChevronRight className="h-4 w-4 text-white/10" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {expandedConcept === concept.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white/[0.01]"
                          >
                            <div className="p-8 space-y-8 border-t border-white/5">
                              {(hasAliasGap || hasRelationGap) && (
                                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4">
                                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                                  <div className="text-xs text-amber-400/80 font-medium">
                                    <strong>Gap de integridad:</strong>
                                    {hasAliasGap && ' Este concepto no tiene alias cargados; el operador puede estar dejando sinonimos sin cubrir. '}
                                    {hasRelationGap && ' Este concepto no tiene relaciones ancladas; sigue aislado dentro de la matriz de compatibilidad.'}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400 flex items-center gap-2">
                                  <Tag className="h-3 w-3" /> Variantes del nombre
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {aliases.map(a => (
                                    <div key={a.id} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
                                      {a.alias}
                                      <button
                                        onClick={() => handleRemoveAlias(a.id)}
                                        className="rounded-md p-1 text-white/20 transition-all hover:bg-red-500/20 hover:text-red-400"
                                        title="Eliminar alias"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex flex-col md:flex-row gap-3">
                                  <input
                                    value={newAlias}
                                    onChange={(e) => setNewAlias(e.target.value)}
                                    placeholder="Agregar alias persistido"
                                    className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:outline-none focus:border-vape-500/50"
                                  />
                                  <button
                                    onClick={handleAddAlias}
                                    className="px-5 py-3 rounded-xl bg-vape-500/10 border border-vape-500/20 text-vape-300 text-[10px] font-black uppercase tracking-widest hover:bg-vape-500/20 transition-all"
                                  >
                                    Agregar alias
                                  </button>
                                </div>
                                <p className="text-[11px] text-white/35">
                                  Los aliases se persisten en DB desde esta vista. La eliminacion del concepto completo sigue fuera de este workbench.
                                </p>
                              </div>

                              <div className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 flex items-center gap-2">
                                  <Link2 className="h-3 w-3" /> Relaciones Direccionales
                                </h4>
                                <p className="text-[11px] text-white/35">
                                  El conteo superior marca el total de relaciones entrantes y salientes. Aqui ves el detalle direccional de cada edge persistido.
                                </p>
                                <div className="grid grid-cols-1 gap-4">
                                  {relations.length === 0 && !isAddingRelation ? (
                                    <div className="text-white/20 text-xs italic">Aun no hay relaciones cargadas. Si este concepto debe guiar compatibilidad, agrega al menos una relacion.</div>
                                  ) : (
                                    relations.map(rel => (
                                      <div key={rel.id} className={cn(
                                        'p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6',
                                        rel.status === 'confirmed_compatible' ? 'bg-emerald-500/5 border-emerald-500/10' :
                                        rel.status === 'confirmed_incompatible' ? 'bg-red-500/5 border-red-500/10' : 'bg-white/5 border-white/10'
                                      )}>
                                        <div className="flex items-center gap-4">
                                          <div className={cn(
                                            'h-8 w-8 rounded-lg flex items-center justify-center',
                                            rel.status === 'confirmed_compatible' ? 'bg-emerald-500/20 text-emerald-400' :
                                            rel.status === 'confirmed_incompatible' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white/40'
                                          )}>
                                            {rel.status === 'confirmed_compatible' ? <CheckCircle2 className="h-4 w-4" /> :
                                             rel.status === 'confirmed_incompatible' ? <XCircle className="h-4 w-4" /> : <HelpCircle className="h-4 w-4" />}
                                          </div>
                                          <div>
                                            <div className="text-xs font-black text-white/40 uppercase tracking-widest mb-1 flex items-center gap-2">
                                              {rel.relation_type.replace(/_/g, ' ')}
                                              <span className={cn(
                                                'px-2 py-0.5 rounded-md text-[8px] border',
                                                rel.scope === 'specific_model' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                              )}>
                                                {rel.scope === 'specific_model' ? 'ESPECIFICO' : 'GENERALIZACION'}
                                              </span>
                                            </div>
                                            <div className="text-sm font-bold text-white flex items-center gap-2">
                                              <span className={rel.concept_a_id === concept.id ? 'text-indigo-400' : 'text-white'}>{rel.concept_a?.name}</span>
                                              <ChevronRight className="h-3 w-3 text-white/20" />
                                              <span className={rel.concept_b_id === concept.id ? 'text-indigo-400' : 'text-white'}>{rel.concept_b?.name}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex-1 max-w-md">
                                          <div className="relative group/note">
                                            <input
                                              type="text"
                                              placeholder="Sin notas guardadas..."
                                              defaultValue={rel.notes}
                                              onBlur={(e) => handleUpdateRelationNotes(rel.id, e.target.value)}
                                              className="w-full bg-transparent border-none text-xs text-white/60 focus:outline-none focus:text-white transition-all italic h-8"
                                            />
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/note:opacity-100 transition-all">
                                              <Edit3 className="h-3 w-3 text-white/20" />
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                          <select
                                            value={rel.status}
                                            onChange={(e) => handleUpdateRelationStatus(rel.id, e.target.value as Relation['status'])}
                                            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white/80 focus:outline-none hover:bg-white/10 transition-all cursor-pointer"
                                          >
                                            <option value="confirmed_compatible">Compatible</option>
                                            <option value="confirmed_incompatible">Incompatible</option>
                                            <option value="unknown_unconfirmed">Desconocido (Unknown)</option>
                                          </select>
                                          <button
                                            onClick={() => handleDeleteRelation(rel.id)}
                                            className="p-2 hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-xl transition-all"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}

                                  {isAddingRelation && (
                                    <div className="p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-4">
                                      <div className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2">Construir Edges Direccionales</div>
                                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="space-y-1">
                                          <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Concepto B (Destino)</label>
                                          <select
                                            value={newRelation.concept_b_id}
                                            onChange={e => setNewRelation({ ...newRelation, concept_b_id: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white"
                                          >
                                            <option value="">-- Seleccionar --</option>
                                            {allConceptOptions.filter(c => c.id !== concept.id).map(c => (
                                              <option key={c.id} value={c.id}>{c.name} ({c.concept_type})</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Tipo de Relacion</label>
                                          <select
                                            value={newRelation.relation_type}
                                            onChange={e => setNewRelation({ ...newRelation, relation_type: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white"
                                          >
                                            <option value="uses_coil">uses_coil</option>
                                            <option value="uses_pod">uses_pod</option>
                                            <option value="uses_battery">uses_battery</option>
                                            <option value="uses_liquid">uses_liquid</option>
                                            <option value="recommended_for_liquid">recommended_for_liquid</option>
                                            <option value="has_connector">has_connector</option>
                                            <option value="replaces">replaces</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Scope</label>
                                          <select
                                            value={newRelation.scope}
                                            onChange={e => setNewRelation({ ...newRelation, scope: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white"
                                          >
                                            <option value="specific_model">Specific Model</option>
                                            <option value="class_generalization">Class Generalization</option>
                                          </select>
                                        </div>
                                        <div className="space-y-1">
                                          <label className="text-[9px] uppercase tracking-wider text-white/40 font-bold">Certeza Neuronal</label>
                                          <select
                                            value={newRelation.status}
                                            onChange={e => setNewRelation({ ...newRelation, status: e.target.value })}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-xs text-white"
                                          >
                                            <option value="confirmed_compatible">Confirmado Compatible</option>
                                            <option value="confirmed_incompatible">Confirmado Incompatible</option>
                                            <option value="unknown_unconfirmed">Desconocido (Honesto)</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-3 mt-2">
                                        <button
                                          onClick={() => setIsAddingRelation(false)}
                                          className="px-4 py-2 text-xs font-bold text-white/40 hover:text-white"
                                        >
                                          Cancelar
                                        </button>
                                        <button
                                          onClick={handleSaveNewRelation}
                                          className="px-6 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                                        >
                                          Inyectar Grafo
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {!isAddingRelation && (
                                    <button
                                      onClick={() => setIsAddingRelation(true)}
                                      className="p-4 rounded-2xl border border-dashed border-white/10 flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest text-white/20 hover:border-indigo-500/50 hover:text-indigo-400 transition-all bg-indigo-500/0 hover:bg-indigo-500/5"
                                    >
                                      <Plus className="h-4 w-4" /> Agregar Relacion Direccional
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20 font-medium">
                                <div className="flex gap-4">
                                  <div className="flex items-center gap-2">
                                    <Info className="h-3 w-3" /> ID Concepto: <span className="font-mono">{concept.id}</span>
                                  </div>
                                  {concept.product_id && (
                                    <div className="flex items-center gap-2">
                                      <Database className="h-3 w-3" /> Producto VIN: <span className="font-mono">{concept.product_id}</span>
                                    </div>
                                  )}
                                </div>
                                 <div>
                                   <AlertCircle className="h-3 w-3 inline mr-1" />
                                   Conceptos, aliases y relaciones sincronizan directo con DB. Esta vista no recalcula embeddings ni elimina conceptos.
                                 </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          </div>
    </div>
  );
}
