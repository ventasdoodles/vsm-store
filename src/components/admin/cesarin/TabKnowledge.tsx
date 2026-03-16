import { motion } from 'framer-motion';
import { Search, Star, MessageSquare, EyeOff } from 'lucide-react';
import { ProductAIInfo } from '@/types/cesarin';

interface TabKnowledgeProps {
    products: ProductAIInfo[];
    productSearch: string;
    setProductSearch: (search: string) => void;
    onUpdateProduct: (id: string, field: string, value: any) => void;
}

export function TabKnowledge({ products, productSearch, setProductSearch, onUpdateProduct }: TabKnowledgeProps) {
    return (
        <motion.div 
            key="knowledge"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight">Base de Conocimiento</h2>
                    <p className="text-sm text-theme-secondary">Entrena a Cesarin con notas de venta específicas y prioridades de producto.</p>
                </div>
                <div className="relative min-w-[300px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input 
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Buscar productos para entrenar..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-vape-500/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="p-6 rounded-[2.5rem] bg-white/[0.02] border border-white/5 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-white/[0.04] transition-all">
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
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
