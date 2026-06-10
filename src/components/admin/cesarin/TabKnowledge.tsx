import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, MessageSquare, EyeOff, Database, Fingerprint, Clock, AlertCircle, Save, Edit3, X } from 'lucide-react';
import { ProductAIInfo } from '@/types/cesarin';
import { useAdminKnowledge } from '@/hooks/useAdminKnowledge';
import { cn } from '@/lib/utils';
import { KnowledgeCategory } from '@/services/admin-knowledge.service';

interface TabKnowledgeProps {
    products: ProductAIInfo[];
    productSearch: string;
    setProductSearch: (search: string) => void;
    onUpdateProduct: (id: string, field: string, value: any) => void;
}

export function TabKnowledge({ products, productSearch, setProductSearch, onUpdateProduct }: TabKnowledgeProps) {
    const [viewMode, setViewMode] = useState<'products' | 'vectors'>('vectors');
    
    // Vector Knowledge Hook
    const knowledge = useAdminKnowledge();
    
    // Safe Edit State
    const [isEditMode, setIsEditMode] = useState(false);
    const [editPayload, setEditPayload] = useState({ title: '', content: '', category: 'faq' as KnowledgeCategory, source_type: 'manual' });

    const openDrawer = (id: string) => {
        knowledge.selectNode(id);
        const node = knowledge.nodes.find(n => n.id === id);
        if (node) {
            setEditPayload({
                title: node.title,
                content: node.content,
                category: node.category,
                source_type: node.source_type
            });
        }
        setIsEditMode(false);
    };

    const closeDrawer = () => {
        knowledge.selectNode(null);
        setIsEditMode(false);
    };

    const handleSaveVector = async () => {
        if (!knowledge.selectedNode) return;
        
        // Client-side early blocking
        if (editPayload.content.length < 20) {
            alert('El contenido debe tener al menos 20 caracteres.');
            return;
        }

        await knowledge.updateNode(knowledge.selectedNode.id, editPayload);
        setIsEditMode(false);
    };

    return (
        <motion.div 
            key="knowledge"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Database className="h-6 w-6 text-emerald-400" />
                        Base de Conocimiento
                    </h2>
                    <p className="text-sm text-theme-secondary">
                        Entrena a Cesarin con notas de venta específicas y conocimiento documental RAG. Después de cada guardado, esta vista vuelve a leer la fila persistida real; no muestra una confirmación sintética.
                    </p>
                </div>
                
                {/* Sub-tabs toggle */}
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
                    <button 
                        onClick={() => setViewMode('vectors')}
                        className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                            viewMode === 'vectors' ? "bg-emerald-500 text-white shadow-lg" : "text-white/40 hover:text-white/80"
                        )}
                    >
                        Base Documental (RAG)
                    </button>
                    <button 
                        onClick={() => setViewMode('products')}
                        className={cn("px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                            viewMode === 'products' ? "bg-vape-500 text-white shadow-lg" : "text-white/40 hover:text-white/80"
                        )}
                    >
                        Notas de Producto
                    </button>
                </div>
            </div>

            {/* VECTORS VIEW */}
            {viewMode === 'vectors' && (
                <div className="space-y-6">
                    {/* Toolbar */}
                    <div className="flex gap-4 items-center">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                            <input 
                                type="text"
                                value={knowledge.search}
                                onChange={(e) => knowledge.setSearch(e.target.value)}
                                placeholder="Buscar en fragmentos vectoriales..."
                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                            />
                        </div>
                        <select 
                            value={knowledge.categoryFilter || ''}
                            onChange={(e) => knowledge.setCategoryFilter(e.target.value as KnowledgeCategory || undefined)}
                            className="bg-white/5 border border-white/10 text-white text-xs py-3 px-4 rounded-2xl focus:outline-none"
                        >
                            <option value="">Todas las categorías</option>
                            <option value="shipping">Envíos (Shipping)</option>
                            <option value="payments">Pagos (Payments)</option>
                            <option value="vape_basics">Vapeo Básico</option>
                            <option value="420_basics">420 Básico</option>
                            <option value="policies">Políticas Generales</option>
                            <option value="faq">Preguntas Frecuentes</option>
                            <option value="onboarding">Onboarding</option>
                        </select>
                        <button 
                            onClick={() => knowledge.refresh()}
                            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 text-white/40 hover:text-white transition-all ml-auto"
                        >
                            Actualizar
                        </button>
                    </div>

                    {/* Datagrid */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden">
                        <div className="grid grid-cols-12 gap-4 p-6 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-white/40">
                            <div className="col-span-1 text-center">STS</div>
                            <div className="col-span-5 px-4">Fragmento / Título</div>
                            <div className="col-span-2 text-center">Categoría</div>
                            <div className="col-span-2 text-center">Tipo Fuente</div>
                            <div className="col-span-2 text-center">Actualizado</div>
                        </div>

                        <div className="divide-y divide-white/5">
                            {knowledge.isLoading && knowledge.nodes.length === 0 ? (
                                <div className="p-20 text-center text-white/20 text-xs font-black uppercase tracking-widest">Cargando base documental...</div>
                            ) : knowledge.nodes.length === 0 ? (
                                <div className="p-20 text-center text-white/20 text-xs font-black uppercase tracking-widest">No se encontraron fragmentos vectoriales.</div>
                            ) : (
                                knowledge.nodes.map((node) => (
                                    <div 
                                        key={node.id} 
                                        onClick={() => openDrawer(node.id)}
                                        className={cn(
                                            "grid grid-cols-12 gap-4 p-6 items-center hover:bg-white/[0.05] transition-all cursor-pointer group",
                                            knowledge.selectedNode?.id === node.id && "bg-white/[0.05]"
                                        )}
                                    >
                                        <div className="col-span-1 flex justify-center">
                                            <div className={cn(
                                                "h-3 w-3 rounded-full border-2",
                                                node.has_embedding ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-500/20 border-red-500 animate-pulse"
                                            )} title={node.has_embedding ? "Vector Sincronizado" : "Vector Pendiente / Fallido"} />
                                        </div>
                                        <div className="col-span-5 px-4 space-y-1">
                                            <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">{node.title}</div>
                                            <div className="text-[10px] text-white/40 truncate font-medium">{node.content}</div>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="px-3 py-1 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest text-white/60">
                                                {node.category.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="col-span-2 text-center text-[10px] font-bold text-white/40 uppercase">
                                            {node.source_type}
                                        </div>
                                        <div className="col-span-2 text-center text-[10px] font-medium text-white/40">
                                            {new Date(node.updated_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Drawer for Details */}
            <AnimatePresence>
                {knowledge.selectedNode && viewMode === 'vectors' && (
                    <motion.div 
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#0a0a0f] border-l border-white/5 shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="p-8 space-y-8">
                            <div className="flex items-center justify-between pb-6 border-b border-white/5">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Inspección de Nodo</h3>
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            knowledge.selectedNode.has_embedding ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {knowledge.selectedNode.has_embedding ? 'Vector Sincronizado' : 'Vector Fallido'}
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono text-white/20">{knowledge.selectedNode.id}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!isEditMode ? (
                                        <button 
                                            onClick={() => setIsEditMode(true)}
                                            className="p-3 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 rounded-2xl transition-all"
                                            title="Safe Edit Mode"
                                        >
                                            <Edit3 className="h-5 w-5" />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setIsEditMode(false)}
                                            className="p-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-2xl transition-all"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={closeDrawer}
                                        className="p-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-2xl transition-all"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Provenance Metadata */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-4">
                                    <Fingerprint className="h-5 w-5 text-indigo-400" />
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">Origen (Source ID)</div>
                                        <div className="text-xs font-bold text-white">{knowledge.selectedNode.source_id || 'Manual Ingestion'}</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-4">
                                    <Clock className="h-5 w-5 text-amber-400" />
                                    <div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">Última Modificación</div>
                                        <div className="text-xs font-bold text-white">{new Date(knowledge.selectedNode.updated_at).toLocaleString('es-MX')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Editor/Viewer */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Título del Fragmento</label>
                                    {isEditMode ? (
                                        <input 
                                            value={editPayload.title}
                                            onChange={e => setEditPayload({...editPayload, title: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm font-bold focus:border-indigo-500/50 outline-none transition-all"
                                        />
                                    ) : (
                                        <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-white text-sm font-bold">{knowledge.selectedNode.title}</div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Categoría</label>
                                        {isEditMode ? (
                                            <select 
                                                value={editPayload.category}
                                                onChange={e => setEditPayload({...editPayload, category: e.target.value as KnowledgeCategory})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-indigo-500/50 outline-none transition-all"
                                            >
                                                <option value="shipping">shipping</option>
                                                <option value="payments">payments</option>
                                                <option value="vape_basics">vape_basics</option>
                                                <option value="420_basics">420_basics</option>
                                                <option value="policies">policies</option>
                                                <option value="faq">faq</option>
                                                <option value="onboarding">onboarding</option>
                                            </select>
                                        ) : (
                                            <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-white text-sm font-medium">{knowledge.selectedNode.category}</div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Tipo de Fuente</label>
                                        {isEditMode ? (
                                            <select 
                                                value={editPayload.source_type}
                                                onChange={e => setEditPayload({...editPayload, source_type: e.target.value})}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-indigo-500/50 outline-none transition-all"
                                            >
                                                <option value="manual">manual</option>
                                                <option value="policy_doc">policy_doc</option>
                                                <option value="ai_rules_migrated">ai_rules_migrated</option>
                                            </select>
                                        ) : (
                                            <div className="w-full bg-white/[0.02] border border-white/5 rounded-xl p-4 text-white text-sm font-medium">{knowledge.selectedNode.source_type}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 flex justify-between">
                                        <span>Contenido Fuente (RAG Chunk)</span>
                                        <span className={cn(editPayload.content.length < 20 && isEditMode ? "text-red-400" : "")}>{editPayload.content.length} / chars</span>
                                    </label>
                                    {isEditMode ? (
                                        <textarea 
                                            value={editPayload.content}
                                            onChange={e => setEditPayload({...editPayload, content: e.target.value})}
                                            className="w-full min-h-[300px] bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-6 text-white text-sm font-medium focus:border-indigo-500 outline-none transition-all leading-relaxed resize-y"
                                            placeholder="Escribe el conocimiento aquí..."
                                        />
                                    ) : (
                                        <div className="w-full min-h-[300px] bg-white/[0.02] border border-white/5 rounded-xl p-6 text-white text-sm font-medium leading-relaxed whitespace-pre-wrap">
                                            {knowledge.selectedNode.content}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Safe Edit Action */}
                            {isEditMode && (
                                <div className="pt-6 border-t border-white/5">
                                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-4 mb-6">
                                        <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                                        <div className="text-xs text-amber-400/80 font-medium">
                                            <strong>Guardrail de Seguridad:</strong> Guardar este nodo reemplazará su contenido y <strong className="text-amber-400">regenerará el vector de embedding automáticamente</strong>. Este proceso no puede deshacerse. Asegurate de que la redacción sea semánticamente clara para el motor IA.
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-4">
                                        <button 
                                            onClick={() => setIsEditMode(false)}
                                            className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 font-bold transition-all text-xs"
                                        >
                                            Cancelar Edición
                                        </button>
                                        <button 
                                            onClick={handleSaveVector}
                                            disabled={knowledge.isSaving}
                                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black uppercase tracking-widest text-xs transition-all disabled:opacity-50"
                                        >
                                            {knowledge.isSaving ? 'Sincronizando Vector...' : (
                                                <>
                                                    <Save className="h-4 w-4" /> Ejecutar Actualización (Sync)
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop for Drawer */}
            <AnimatePresence>
                {knowledge.selectedNode && viewMode === 'vectors' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeDrawer}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>


            {/* PRODUCTS VIEW (Legacy functionality preserved) */}
            {viewMode === 'products' && (
                <div className="space-y-6">
                    <div className="relative min-w-[300px] max-w-md">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                        <input 
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            placeholder="Buscar productos para notas..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-vape-500/50 transition-all font-medium"
                        />
                    </div>

                    <motion.div layout className="grid grid-cols-1 gap-4">
                        {products.map((product) => (
                            <motion.div layout key={product.id} className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-white/[0.06] hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className={`h-2 w-2 rounded-full ${product.ai_exclude ? 'bg-red-500' : 'bg-emerald-500'}`} />
                                        <h4 className="text-lg font-bold text-white group-hover:text-vape-400 transition-colors uppercase tracking-tight">{product.name}</h4>
                                    </div>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-0 top-3 h-4 w-4 text-vape-500/30" />
                                        <textarea 
                                            className="w-full bg-transparent border-none text-sm text-white/60 focus:ring-0 pl-7 resize-none min-h-[60px] font-medium leading-relaxed italic"
                                            placeholder="Sin notas de venta inteligentes..."
                                            defaultValue={product.ai_sales_note || ''}
                                            onBlur={(e) => onUpdateProduct(product.id, 'ai_sales_note', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-black/20 p-2 rounded-3xl border border-white/5">
                                    {[
                                        { field: 'ai_is_featured', label: 'Destacar', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                                        { field: 'ai_exclude', label: 'Ocultar', icon: EyeOff, color: 'text-red-400', bg: 'bg-red-400/10' }
                                    ].map((action) => (
                                        <button
                                            key={action.field}
                                            onClick={() => onUpdateProduct(product.id, action.field, !(product as any)[action.field])}
                                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest ${
                                                (product as any)[action.field] 
                                                ? `${action.bg} ${action.color} border border-${action.color}/20` 
                                                : 'text-white/20 hover:text-white/40'
                                            }`}
                                        >
                                            <action.icon className="h-4 w-4" />
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
