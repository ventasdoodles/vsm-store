import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowRight,
    Boxes,
    FileCode2,
    FolderTree,
    Network,
    Search,
    ShieldCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import {
    DEFAULT_REPO_GRAPH_NODE_ID,
    getRepoGraphInspector,
    getRepoGraphNodeById,
    getRepoGraphOverview,
    listRepoGraphNodes,
    RepoGraphNode,
    RepoGraphResolvedLink,
} from '@/services/admin/admin-repo-graph.service';

type RepoGraphListScope = 'all' | 'same_container' | 'same_type' | 'path_local' | 'review_set';

const overview = getRepoGraphOverview();

function displayNodePath(node: RepoGraphNode): string {
    return node.file_path ?? node.id;
}

function displayChunkCount(node: RepoGraphNode): number {
    return node.chunk_count ?? node.chunks?.length ?? 0;
}

function buildScopeLabel(scope: RepoGraphListScope): string {
    switch (scope) {
        case 'same_container':
            return 'Mismo contenedor';
        case 'same_type':
            return 'Mismo tipo';
        case 'path_local':
            return 'Ruta local';
        case 'review_set':
            return 'Review set';
        default:
            return 'Vista general';
    }
}

function LinkCard({
    link,
    selectedNodeId,
    onSelectNode,
}: {
    link: RepoGraphResolvedLink;
    selectedNodeId: string;
    onSelectNode: (nodeId: string) => void;
}) {
    const sourceSelected = link.source.id === selectedNodeId;
    const targetSelected = link.target.id === selectedNodeId;

    return (
        <div className="rounded-[1.6rem] border border-white/5 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300/70">
                <span>{link.relationship}</span>
                {typeof link.weight === 'number' && (
                    <span className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] text-white/35">
                        peso {link.weight}
                    </span>
                )}
            </div>

            <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-center">
                <button
                    onClick={() => onSelectNode(link.source.id)}
                    className={cn(
                        'min-w-0 rounded-2xl border px-4 py-3 text-left transition-all',
                        sourceSelected ? 'border-vape-500/30 bg-vape-500/10 text-white' : 'border-white/5 bg-black/20 text-white/70 hover:bg-white/[0.05]',
                    )}
                >
                    <div className="truncate text-xs font-black">{link.source.label}</div>
                    <div className="mt-1 truncate text-[10px] text-inherit/60">{displayNodePath(link.source)}</div>
                </button>

                <div className="flex shrink-0 items-center justify-center text-white/20">
                    <ArrowRight className="h-4 w-4" />
                </div>

                <button
                    onClick={() => onSelectNode(link.target.id)}
                    className={cn(
                        'min-w-0 rounded-2xl border px-4 py-3 text-left transition-all',
                        targetSelected ? 'border-vape-500/30 bg-vape-500/10 text-white' : 'border-white/5 bg-black/20 text-white/70 hover:bg-white/[0.05]',
                    )}
                >
                    <div className="truncate text-xs font-black">{link.target.label}</div>
                    <div className="mt-1 truncate text-[10px] text-inherit/60">{displayNodePath(link.target)}</div>
                </button>
            </div>
        </div>
    );
}

function RelatedSetCard({
    title,
    subtitle,
    nodes,
    emptyLabel,
    onSelectNode,
    onActivateScope,
}: {
    title: string;
    subtitle: string;
    nodes: RepoGraphNode[];
    emptyLabel: string;
    onSelectNode: (nodeId: string) => void;
    onActivateScope: () => void;
}) {
    return (
        <div className="rounded-[2.2rem] border border-white/5 bg-white/[0.03] p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300">{title}</div>
                    <p className="mt-2 text-xs leading-relaxed text-white/45">{subtitle}</p>
                </div>
                <button
                    onClick={onActivateScope}
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/60 transition-all hover:bg-white/[0.05] hover:text-white"
                >
                    Filtrar lista
                </button>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                {nodes.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-white/30">
                        {emptyLabel}
                    </div>
                ) : (
                    nodes.map((node) => (
                        <button
                            key={node.id}
                            onClick={() => onSelectNode(node.id)}
                            className="max-w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition-all hover:bg-white/[0.05]"
                        >
                            <div className="truncate text-xs font-black text-white">{node.label}</div>
                            <div className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-white/35">{node.type}</div>
                            <div className="mt-2 truncate text-[11px] text-white/45">{displayNodePath(node)}</div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

export function TabRepoGraph() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState(DEFAULT_REPO_GRAPH_NODE_ID);
    const [listScope, setListScope] = useState<RepoGraphListScope>('all');
    const [reviewSetIds, setReviewSetIds] = useState<string[]>([]);
    const deferredSearch = useDeferredValue(search);

    const baseNodes = useMemo(() => listRepoGraphNodes({
        search: deferredSearch,
        type: typeFilter || undefined,
        limit: 240,
    }), [deferredSearch, typeFilter]);

    const inspector = useMemo(() => {
        const selectedInspector = getRepoGraphInspector(selectedNodeId);
        if (selectedInspector) {
            return selectedInspector;
        }

        const firstNode = baseNodes[0];
        return firstNode ? getRepoGraphInspector(firstNode.id) : null;
    }, [baseNodes, selectedNodeId]);

    const selectedNode = inspector?.node ?? null;
    const reviewSetNodes = useMemo(
        () => reviewSetIds
            .map((nodeId) => getRepoGraphNodeById(nodeId))
            .filter((node): node is RepoGraphNode => Boolean(node)),
        [reviewSetIds],
    );

    const scopedNodeIds = useMemo(() => {
        if (!selectedNode || !inspector) {
            return null;
        }

        switch (listScope) {
            case 'same_container':
                return new Set([selectedNode.id, ...inspector.sameContainerNodes.map((node) => node.id)]);
            case 'same_type':
                return new Set([selectedNode.id, ...inspector.sameTypeNodes.map((node) => node.id)]);
            case 'path_local':
                return new Set([selectedNode.id, ...inspector.pathLocalNodes.map((node) => node.id)]);
            case 'review_set':
                return new Set(reviewSetIds);
            default:
                return null;
        }
    }, [inspector, listScope, reviewSetIds, selectedNode]);

    const nodes = useMemo(() => {
        if (!scopedNodeIds) {
            return baseNodes;
        }

        return baseNodes.filter((node) => scopedNodeIds.has(node.id));
    }, [baseNodes, scopedNodeIds]);

    const selectedInReviewSet = selectedNode ? reviewSetIds.includes(selectedNode.id) : false;

    useEffect(() => {
        if (listScope === 'review_set' && reviewSetIds.length === 0) {
            setListScope('all');
        }
    }, [listScope, reviewSetIds.length]);

    useEffect(() => {
        if (!selectedNode && baseNodes.length > 0) {
            const firstNode = baseNodes[0];
            if (firstNode) {
                setSelectedNodeId(firstNode.id);
            }
            return;
        }

        if (selectedNode && !getRepoGraphNodeById(selectedNode.id)) {
            setSelectedNodeId(baseNodes[0]?.id ?? DEFAULT_REPO_GRAPH_NODE_ID);
        }
    }, [baseNodes, selectedNode]);

    useEffect(() => {
        if (nodes.length === 0) {
            return;
        }

        const visibleSelection = selectedNode ? nodes.some((node) => node.id === selectedNode.id) : false;
        if (!visibleSelection) {
            const firstNode = nodes[0];
            if (firstNode) {
                setSelectedNodeId(firstNode.id);
            }
        }
    }, [nodes, selectedNode]);

    const handleCopyPath = async () => {
        if (!selectedNode) return;

        try {
            if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
                throw new Error('clipboard_unavailable');
            }

            await navigator.clipboard.writeText(displayNodePath(selectedNode));
            toast.success('Ruta copiada al portapapeles');
        } catch (_error) {
            toast.error('No se pudo copiar la ruta');
        }
    };

    const handleToggleReviewSet = () => {
        if (!selectedNode) return;

        setReviewSetIds((current) => (
            current.includes(selectedNode.id)
                ? current.filter((nodeId) => nodeId !== selectedNode.id)
                : [...current, selectedNode.id]
        ));
    };

    const reviewNextLabel = !selectedNode || !inspector
        ? 'Selecciona una entidad para abrir sugerencias de lectura.'
        : inspector.sameContainerNodes.length > 0
            ? `Empieza por el mismo contenedor: ${inspector.containerNode?.label ?? 'contenedor resuelto'}.`
            : inspector.pathLocalNodes.length > 0
                ? 'No hay contenedor claro; sigue por la misma ruta local.'
                : inspector.sameTypeNodes.length > 0
                    ? 'Si falta contexto estructural, compara con entidades del mismo tipo.'
                    : 'Solo hay evidencia local del nodo actual; apoyate en sus fragmentos y relaciones directas.';

    return (
        <motion.div
            key="repo_graph"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h3 className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight text-white">
                            <Network className="h-6 w-6 text-indigo-400" />
                            Repo Graph
                        </h3>
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
                            Read only
                        </span>
                    </div>
                    <p className="max-w-3xl text-sm text-theme-secondary">
                        Vista operativa del grafo local del repositorio. Ahora tambien te ayuda a ordenar que superficies revisar despues, sin inflar lo que el grafo realmente demuestra.
                    </p>
                </div>

                <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400">Contrato de verdad</div>
                    <p className="mt-2 text-xs leading-relaxed text-white/55">
                        El grafo actual confirma contencion y vecindad estructural. No prueba dependencias de runtime, impacto en produccion ni correccion funcional.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">Nodos indexados</div>
                    <div className="mt-3 text-3xl font-black text-white">{overview.totalNodes}</div>
                    <p className="mt-2 text-xs text-white/40">Entidades disponibles para inspeccion operatoria.</p>
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-vape-400">Relaciones cargadas</div>
                    <div className="mt-3 text-3xl font-black text-white">{overview.totalLinks}</div>
                    <p className="mt-2 text-xs text-white/40">El baseline actual solo expone {overview.relationshipTypes.join(', ')}.</p>
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">Scope activo</div>
                    <div className="mt-3 text-2xl font-black text-white">{buildScopeLabel(listScope)}</div>
                    <p className="mt-2 text-xs text-white/40">La lista puede reducirse a contenedor, tipo, ruta local o review set.</p>
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400">Review set</div>
                    <div className="mt-3 text-3xl font-black text-white">{reviewSetNodes.length}</div>
                    <p className="mt-2 text-xs text-white/40">Conjunto local de lectura para esta sesion. No se persiste fuera del navegador.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
                <div className="space-y-4">
                    <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar entidad, ruta o descripcion..."
                                    className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:border-indigo-500/40 focus:outline-none"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(event) => setTypeFilter(event.target.value)}
                                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white focus:border-indigo-500/40 focus:outline-none"
                            >
                                <option value="">Todos los tipos</option>
                                {overview.nodeTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {([
                                { id: 'all', label: 'General' },
                                { id: 'same_container', label: 'Mismo contenedor' },
                                { id: 'same_type', label: 'Mismo tipo' },
                                { id: 'path_local', label: 'Ruta local' },
                                { id: 'review_set', label: 'Review set' },
                            ] as Array<{ id: RepoGraphListScope; label: string }>).map((scope) => (
                                <button
                                    key={scope.id}
                                    onClick={() => setListScope(scope.id)}
                                    disabled={scope.id === 'review_set' && reviewSetNodes.length === 0}
                                    className={cn(
                                        'rounded-xl border px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition-all',
                                        listScope === scope.id
                                            ? 'border-vape-500/30 bg-vape-500/10 text-white'
                                            : 'border-white/10 bg-black/20 text-white/45 hover:text-white/75',
                                        scope.id === 'review_set' && reviewSetNodes.length === 0 && 'cursor-not-allowed opacity-40',
                                    )}
                                >
                                    {scope.label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                            <span>Entidades visibles</span>
                            <span>{nodes.length}</span>
                        </div>
                    </div>

                    <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                        <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">Conjunto de revision</div>
                        <p className="mt-2 text-xs leading-relaxed text-white/45">
                            Guarda superficies para un pase local de lectura. Este set es de sesion y no se sincroniza.
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {reviewSetNodes.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-white/30">
                                    Aun no agregas entidades al review set.
                                </div>
                            ) : (
                                reviewSetNodes.map((node) => (
                                    <button
                                        key={node.id}
                                        onClick={() => {
                                            setSelectedNodeId(node.id);
                                            setListScope('review_set');
                                        }}
                                        className="max-w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left transition-all hover:bg-white/[0.05]"
                                    >
                                        <div className="truncate text-xs font-black text-white">{node.label}</div>
                                        <div className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-white/35">{node.type}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="max-h-[50rem] overflow-y-auto rounded-[2rem] border border-white/5 bg-white/[0.02] p-3">
                        {nodes.length === 0 ? (
                            <div className="px-4 py-10 text-center text-xs font-black uppercase tracking-[0.2em] text-white/20">
                                No se encontraron entidades para el scope actual.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {nodes.map((node) => (
                                    <button
                                        key={node.id}
                                        onClick={() => setSelectedNodeId(node.id)}
                                        className={cn(
                                            'w-full rounded-[1.6rem] border px-4 py-4 text-left transition-all',
                                            selectedNode?.id === node.id
                                                ? 'border-vape-500/30 bg-vape-500/10 text-white'
                                                : 'border-white/5 bg-black/20 text-white/65 hover:bg-white/[0.04]',
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-black">{node.label}</div>
                                                <div className="mt-1 truncate text-[10px] uppercase tracking-[0.16em] text-inherit/55">
                                                    {node.type}
                                                </div>
                                            </div>
                                            <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-black text-inherit/65">
                                                {displayChunkCount(node)} chunks
                                            </span>
                                        </div>
                                        <div className="mt-3 truncate text-[11px] text-inherit/55">{displayNodePath(node)}</div>
                                        {node.description && (
                                            <div className="mt-2 line-clamp-2 text-xs text-inherit/45">{node.description}</div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    {!inspector || !selectedNode ? (
                        <div className="rounded-[2.2rem] border border-white/5 bg-white/[0.03] p-10 text-center">
                            <div className="text-sm font-black uppercase tracking-[0.2em] text-white/30">Sin seleccion</div>
                            <p className="mt-3 text-sm text-white/45">Selecciona una entidad del grafo para abrir su lectura operatoria.</p>
                        </div>
                    ) : (
                        <>
                            <div className="rounded-[2.4rem] border border-white/5 bg-white/[0.03] p-6">
                                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300">
                                                {selectedNode.type}
                                            </span>
                                            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                                                {displayChunkCount(selectedNode)} chunks
                                            </span>
                                            {inspector.containerNode && (
                                                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">
                                                    contenedor: {inspector.containerNode.label}
                                                </span>
                                            )}
                                        </div>

                                        <div>
                                            <h4 className="text-3xl font-black tracking-tight text-white">{selectedNode.label}</h4>
                                            <p className="mt-2 break-all font-mono text-xs text-white/30">{displayNodePath(selectedNode)}</p>
                                        </div>
                                    </div>

                                    <div className="rounded-[1.8rem] border border-white/10 bg-black/20 px-4 py-3">
                                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Fuente</div>
                                        <p className="mt-2 text-xs text-white/55">Consumo local de graqle.json, sin backend en vivo ni escritura.</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-vape-400">
                                            <FileCode2 className="h-3.5 w-3.5" />
                                            Etiqueta
                                        </div>
                                        <p className="mt-3 text-sm font-black text-white">{selectedNode.label}</p>
                                    </div>

                                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-300">
                                            <Boxes className="h-3.5 w-3.5" />
                                            Tipo
                                        </div>
                                        <p className="mt-3 text-sm font-black text-white">{selectedNode.type}</p>
                                    </div>

                                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-400">
                                            <FolderTree className="h-3.5 w-3.5" />
                                            Ruta
                                        </div>
                                        <p className="mt-3 break-all text-xs font-semibold text-white/70">{displayNodePath(selectedNode)}</p>
                                    </div>

                                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-400">
                                            <ShieldCheck className="h-3.5 w-3.5" />
                                            Contexto
                                        </div>
                                        <p className="mt-3 text-sm font-black text-white">
                                            {inspector.parentLinks.length + inspector.childLinks.length} conexiones directas
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 rounded-[1.8rem] border border-white/5 bg-black/20 p-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">Descripcion corta</div>
                                    <p className="mt-3 text-sm leading-relaxed text-white/70">
                                        {selectedNode.description ?? 'No hay descripcion sintetizada para esta entidad en el grafo actual.'}
                                    </p>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-2">
                                    <button
                                        onClick={handleCopyPath}
                                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/65 transition-all hover:bg-white/[0.05] hover:text-white"
                                    >
                                        Copiar ruta
                                    </button>
                                    <button
                                        onClick={handleToggleReviewSet}
                                        className={cn(
                                            'rounded-xl border px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] transition-all',
                                            selectedInReviewSet
                                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                                                : 'border-white/10 bg-black/20 text-white/65 hover:bg-white/[0.05] hover:text-white',
                                        )}
                                    >
                                        {selectedInReviewSet ? 'Quitar de review set' : 'Agregar a review set'}
                                    </button>
                                    <button
                                        onClick={() => setListScope('same_container')}
                                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/65 transition-all hover:bg-white/[0.05] hover:text-white"
                                    >
                                        Ver mismo contenedor
                                    </button>
                                    <button
                                        onClick={() => setListScope('same_type')}
                                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/65 transition-all hover:bg-white/[0.05] hover:text-white"
                                    >
                                        Ver mismo tipo
                                    </button>
                                    <button
                                        onClick={() => setListScope('path_local')}
                                        className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-white/65 transition-all hover:bg-white/[0.05] hover:text-white"
                                    >
                                        Ver ruta local
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">Si muestra</div>
                                    <p className="mt-3 text-sm leading-relaxed text-white/65">
                                        Contenedor, vecinos estructurales, tipo compartido y fragmentos del nodo seleccionado.
                                    </p>
                                </div>

                                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400">No prueba</div>
                                    <p className="mt-3 text-sm leading-relaxed text-white/65">
                                        Dependencia de runtime, impacto en produccion, cobertura de pruebas o correccion de implementacion.
                                    </p>
                                </div>

                                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300">Inspeccion siguiente</div>
                                    <p className="mt-3 text-sm leading-relaxed text-white/65">{reviewNextLabel}</p>
                                </div>
                            </div>

                            <div className="rounded-[2.2rem] border border-white/5 bg-white/[0.03] p-6">
                                <div className="text-[10px] font-black uppercase tracking-[0.22em] text-indigo-300">Conectado por grafo</div>
                                <p className="mt-2 text-xs leading-relaxed text-white/45">
                                    Relaciones directas del baseline actual. Se muestran tal como aparecen en el grafo local.
                                </p>

                                <div className="mt-5 space-y-3">
                                    {inspector.parentLinks.length === 0 && inspector.childLinks.length === 0 ? (
                                        <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-white/30">
                                            Esta entidad no tiene conexiones directas resueltas en el grafo cargado.
                                        </div>
                                    ) : (
                                        <>
                                            {inspector.parentLinks.map((link) => (
                                                <LinkCard
                                                    key={`${link.relationship}:${link.source.id}:${link.target.id}`}
                                                    link={link}
                                                    selectedNodeId={selectedNode.id}
                                                    onSelectNode={setSelectedNodeId}
                                                />
                                            ))}
                                            {inspector.childLinks.map((link) => (
                                                <LinkCard
                                                    key={`${link.relationship}:${link.source.id}:${link.target.id}`}
                                                    link={link}
                                                    selectedNodeId={selectedNode.id}
                                                    onSelectNode={setSelectedNodeId}
                                                />
                                            ))}
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                                <RelatedSetCard
                                    title="Mismo contenedor"
                                    subtitle="Entidades que comparten contenedor directo con el nodo actual."
                                    nodes={inspector.sameContainerNodes}
                                    emptyLabel="No hay hermanos directos para este nodo."
                                    onSelectNode={setSelectedNodeId}
                                    onActivateScope={() => setListScope('same_container')}
                                />
                                <RelatedSetCard
                                    title="Mismo tipo"
                                    subtitle="Entidades del mismo tipo para comparar superficies equivalentes."
                                    nodes={inspector.sameTypeNodes}
                                    emptyLabel="No hay otros nodos del mismo tipo en el indice cargado."
                                    onSelectNode={setSelectedNodeId}
                                    onActivateScope={() => setListScope('same_type')}
                                />
                                <RelatedSetCard
                                    title="Ruta local"
                                    subtitle="Entidades del mismo directorio para seguir el contexto estructural inmediato."
                                    nodes={inspector.pathLocalNodes}
                                    emptyLabel="No hay vecinos de ruta local para esta entidad."
                                    onSelectNode={setSelectedNodeId}
                                    onActivateScope={() => setListScope('path_local')}
                                />
                            </div>

                            {inspector.chunkPreviews.length > 0 && (
                                <div className="rounded-[2.2rem] border border-white/5 bg-white/[0.03] p-6">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-vape-400">Preview de evidencia</div>
                                    <p className="mt-2 text-xs leading-relaxed text-white/45">
                                        Fragmentos sintetizados del nodo seleccionado para entender rapidamente que contiene.
                                    </p>

                                    <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">
                                        {inspector.chunkPreviews.map((chunk, index) => (
                                            <div key={`${chunk.type}-${index}`} className="rounded-[1.8rem] border border-white/5 bg-black/20 p-5">
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">{chunk.type}</div>
                                                <p className="mt-3 text-sm leading-relaxed text-white/70">{chunk.preview}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
