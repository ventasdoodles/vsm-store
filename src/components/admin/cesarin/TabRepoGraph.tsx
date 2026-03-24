import { useDeferredValue, useEffect, useState } from 'react';
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

const overview = getRepoGraphOverview();

function displayNodePath(node: RepoGraphNode): string {
    return node.file_path ?? node.id;
}

function displayChunkCount(node: RepoGraphNode): number {
    return node.chunk_count ?? node.chunks?.length ?? 0;
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
                        sourceSelected
                            ? 'border-vape-500/30 bg-vape-500/10 text-white'
                            : 'border-white/5 bg-black/20 text-white/70 hover:bg-white/[0.05]',
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
                        targetSelected
                            ? 'border-vape-500/30 bg-vape-500/10 text-white'
                            : 'border-white/5 bg-black/20 text-white/70 hover:bg-white/[0.05]',
                    )}
                >
                    <div className="truncate text-xs font-black">{link.target.label}</div>
                    <div className="mt-1 truncate text-[10px] text-inherit/60">{displayNodePath(link.target)}</div>
                </button>
            </div>
        </div>
    );
}

export function TabRepoGraph() {
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [selectedNodeId, setSelectedNodeId] = useState(DEFAULT_REPO_GRAPH_NODE_ID);
    const deferredSearch = useDeferredValue(search);

    const nodes = listRepoGraphNodes({
        search: deferredSearch,
        type: typeFilter || undefined,
        limit: 140,
    });

    useEffect(() => {
        if (!getRepoGraphNodeById(selectedNodeId)) {
            setSelectedNodeId(nodes[0]?.id ?? DEFAULT_REPO_GRAPH_NODE_ID);
        }
    }, [nodes, selectedNodeId]);

    useEffect(() => {
        if (nodes.length === 0) {
            return;
        }

        const visibleSelection = nodes.some((node) => node.id === selectedNodeId);
        if (!visibleSelection && (deferredSearch.trim() || typeFilter)) {
            const firstNode = nodes[0];
            if (firstNode) {
                setSelectedNodeId(firstNode.id);
            }
        }
    }, [deferredSearch, nodes, selectedNodeId, typeFilter]);

    const inspector = getRepoGraphInspector(selectedNodeId) ?? (nodes[0] ? getRepoGraphInspector(nodes[0].id) : null);
    const selectedNode = inspector?.node ?? null;

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
                        Vista operativa del grafo local del repositorio. Sirve para ubicar superficies, leer contencion y abrir contexto sin exponerte al JSON crudo.
                    </p>
                </div>

                <div className="max-w-md rounded-[2rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-400">Contrato de verdad</div>
                    <p className="mt-2 text-xs leading-relaxed text-white/55">
                        El grafo actual solo confirma relaciones de contencion. Esta vista no afirma dependencias de runtime ni certeza de impacto.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">Nodos indexados</div>
                    <div className="mt-3 text-3xl font-black text-white">{overview.totalNodes}</div>
                    <p className="mt-2 text-xs text-white/40">Entidades disponibles para inspeccion operatoria.</p>
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-vape-400">Relaciones cargadas</div>
                    <div className="mt-3 text-3xl font-black text-white">{overview.totalLinks}</div>
                    <p className="mt-2 text-xs text-white/40">Todas las relaciones del baseline actual son de tipo {overview.relationshipTypes.join(', ')}.</p>
                </div>

                <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-5">
                    <div className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">Zona cercana</div>
                    <div className="mt-3 text-3xl font-black text-white">{selectedNode ? inspector?.nearbyNodes.length ?? 0 : 0}</div>
                    <p className="mt-2 text-xs text-white/40">Vecinos del mismo contenedor para abrir contexto rapido sin salir de Cesarin OS.</p>
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

                        <div className="mt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                            <span>Entidades visibles</span>
                            <span>{nodes.length}</span>
                        </div>
                    </div>

                    <div className="max-h-[58rem] overflow-y-auto rounded-[2rem] border border-white/5 bg-white/[0.02] p-3">
                        {nodes.length === 0 ? (
                            <div className="px-4 py-10 text-center text-xs font-black uppercase tracking-[0.2em] text-white/20">
                                No se encontraron entidades.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {nodes.map((node) => (
                                    <button
                                        key={node.id}
                                        onClick={() => setSelectedNodeId(node.id)}
                                        className={cn(
                                            'w-full rounded-[1.6rem] border px-4 py-4 text-left transition-all',
                                            selectedNodeId === node.id
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
                            </div>

                            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
                                                        selectedNodeId={selectedNodeId}
                                                        onSelectNode={setSelectedNodeId}
                                                    />
                                                ))}
                                                {inspector.childLinks.map((link) => (
                                                    <LinkCard
                                                        key={`${link.relationship}:${link.source.id}:${link.target.id}`}
                                                        link={link}
                                                        selectedNodeId={selectedNodeId}
                                                        onSelectNode={setSelectedNodeId}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[2.2rem] border border-white/5 bg-white/[0.03] p-6">
                                    <div className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-400">Zona cercana por contencion</div>
                                    <p className="mt-2 text-xs leading-relaxed text-white/45">
                                        Vecinos derivados por compartir contenedor. Ayuda a abrir la superficie cercana, pero no prueba dependencia.
                                    </p>

                                    <div className="mt-5 flex flex-wrap gap-3">
                                        {inspector.nearbyNodes.length === 0 ? (
                                            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-white/30">
                                                No hay vecinos del mismo contenedor para esta seleccion.
                                            </div>
                                        ) : (
                                            inspector.nearbyNodes.map((node) => (
                                                <button
                                                    key={node.id}
                                                    onClick={() => setSelectedNodeId(node.id)}
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
