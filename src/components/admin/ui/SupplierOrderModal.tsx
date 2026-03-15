import { useCallback, useState, useEffect } from 'react';
import { 
    X, ShoppingCart, MessageSquare, 
    Truck, Loader2, Copy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminNLPService } from '@/services/admin/admin-nlp.service';
import { useTacticalUI } from '@/contexts/TacticalContext';
import { useNotification } from '@/hooks/useNotification';

interface SupplierOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: {
        id: string;
        name: string;
        stock: number;
        sku: string;
    } | null;
}

export function SupplierOrderModal({ isOpen, onClose, product }: SupplierOrderModalProps) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState(''); // Default supplier phone could be added to settings
    const { playSuccess, playClick } = useTacticalUI();
    const { success: notifySuccess } = useNotification();

    const generateMessage = useCallback(async () => {
        if (!product) return;
        setLoading(true);
        try {
            const aiMessage = await adminNLPService.generateSupplierOrderCopy(
                product.name,
                product.stock,
                product.sku
            );
            setMessage(aiMessage);
        } finally {
            setLoading(false);
        }
    }, [product]);

    useEffect(() => {
        if (isOpen && product) {
            generateMessage();
        }
    }, [isOpen, product, generateMessage]);

    const handleCopy = () => {
        navigator.clipboard.writeText(message);
        notifySuccess('Copiado', 'Mensaje copiado al portapapeles');
        playSuccess();
    };

    const handleWhatsApp = () => {
        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = phone.replace(/\D/g, '');
        const url = `https://wa.me/${cleanPhone || '521'}?text=${encodedMessage}`;
        window.open(url, '_blank');
        playClick();
    };

    if (!isOpen || !product) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-md"
                />

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0A0A0A] shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-8 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                <Truck className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white italic uppercase tracking-tight">Reordenar Stock</h2>
                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none mt-1">Smart Supplier Connect</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-3 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Info Card */}
                        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-white">{product.name}</span>
                                <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg">STOCK: {product.stock}</span>
                            </div>
                            <p className="text-[10px] font-medium text-white/20 uppercase tracking-tighter">SKU: {product.sku}</p>
                        </div>

                        {/* Phone Input */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Teléfono del Proveedor</label>
                            <input 
                                type="text"
                                placeholder="Ej: 5212281234567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-amber-500/50 outline-none transition-all"
                            />
                        </div>

                        {/* AI Message Area */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                                    <MessageSquare className="h-3 w-3" /> Propuesta de la IA
                                </label>
                                {loading && <Loader2 className="h-3 w-3 text-amber-500 animate-spin" />}
                            </div>
                            <div className="relative group">
                                <textarea 
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-sm text-white/80 leading-relaxed focus:border-vape-500/50 outline-none transition-all resize-none"
                                />
                                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                                    <button 
                                        onClick={handleCopy}
                                        className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all border border-white/10"
                                        title="Copiar"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Action Bar */}
                        <div className="flex items-center gap-4 pt-4">
                            <button 
                                onClick={onClose}
                                className="flex-1 px-6 py-4 rounded-2xl bg-white/5 text-white text-xs font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleWhatsApp}
                                disabled={!message || loading}
                                className="flex-[2] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-400 transition-all disabled:opacity-50"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Enviar Pedido vía WA
                            </button>
                        </div>
                    </div>

                    {/* Footer Warning */}
                    <div className="p-4 bg-amber-500/5 border-t border-amber-500/10 flex items-center gap-2">
                        <Loader2 className="h-3 w-3 text-amber-500/50" />
                        <span className="text-[8px] font-bold text-amber-500/40 uppercase tracking-tighter">
                            Este mensaje ha sido optimizado por Gemini para maxima tasa de respuesta
                        </span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
