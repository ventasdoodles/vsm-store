import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Scan, Zap, AlertTriangle, CheckCircle2, Plus } from 'lucide-react';
import { useVisualScanner } from '@/hooks/useVisualScanner';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { Link } from 'react-router-dom';

interface VisualScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function VisualScannerModal({ isOpen, onClose }: VisualScannerModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { isScanning, error, result, scanImage, resetScanner } = useVisualScanner();
    const { addItem } = useCartStore();

    // Reset when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetScanner();
        }
    }, [isOpen, resetScanner]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            scanImage(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            scanImage(file);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-2xl"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Background FX */}
                        <div className="absolute inset-0 bg-gradient-to-br from-vape-500/10 via-transparent to-transparent opacity-50" />
                        
                        {/* Header */}
                        <div className="relative flex items-center justify-between p-6 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-vape-500/20 text-vape-400">
                                    <Scan className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white">Scanner de Compatibilidad</h2>
                                    <p className="text-xs text-theme-tertiary">Gemini Vision AI</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 transition-colors rounded-full text-white/50 hover:text-white hover:bg-white/5"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="relative p-6">
                            {!isScanning && !result && !error && (
                                <div 
                                    className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-3xl border-white/10 hover:border-vape-500/50 bg-white/5 transition-colors cursor-pointer group"
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={handleDrop}
                                >
                                    <div className="p-4 mb-4 rounded-full bg-black/50 text-white/50 group-hover:text-vape-400 group-hover:bg-vape-500/20 transition-all">
                                        <Camera className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-bold text-white mb-1">Toma una foto o sube una imagen</p>
                                    <p className="text-xs text-theme-tertiary text-center max-w-[250px]">
                                        Escanea tu equipo, resistencia o pod para encontrar repuestos compatibles exactos.
                                    </p>
                                </div>
                            )}

                            {isScanning && (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <div className="relative w-24 h-24 mb-6">
                                        <div className="absolute inset-0 border-4 border-vape-500/30 rounded-full animate-ping" />
                                        <div className="absolute inset-2 bg-vape-500/20 rounded-full flex items-center justify-center">
                                            <Zap className="w-8 h-8 text-vape-400 animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Analizando Imagen...</h3>
                                    <p className="text-xs text-theme-tertiary">Buscando en el catálogo de VSM Store</p>
                                </div>
                            )}

                            {error && !isScanning && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="p-4 mb-4 rounded-full bg-red-500/20 text-red-400">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-bold text-white mb-2">No pudimos identificar el equipo</p>
                                    <p className="text-xs text-red-400/80 mb-6 max-w-[280px]">{error}</p>
                                    <button 
                                        onClick={resetScanner}
                                        className="px-6 py-2 text-xs font-bold text-white rounded-full bg-white/10 hover:bg-white/20"
                                    >
                                        Intentar de nuevo
                                    </button>
                                </div>
                            )}

                            {result && result.success && !isScanning && (
                                <div className="space-y-6">
                                    <div className="p-4 rounded-2xl bg-vape-500/10 border border-vape-500/20">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-vape-400 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-bold text-white">
                                                    Equipo identificado: {result.analysis?.brand} {result.analysis?.model}
                                                </h3>
                                                <p className="text-xs text-theme-tertiary mt-1 leading-relaxed">
                                                    {result.analysis?.reasoning}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {result.suggestedProducts && result.suggestedProducts.length > 0 ? (
                                        <div>
                                            <h4 className="text-xs font-black text-white/50 uppercase tracking-widest mb-4">
                                                Repuestos Compatibles
                                            </h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                {result.suggestedProducts.map(product => (
                                                    <div key={product.id} className="p-3 bg-black/40 rounded-xl border border-white/5 flex flex-col">
                                                        <div className="aspect-square w-full rounded-lg bg-black/50 overflow-hidden mb-3">
                                                            <OptimizedImage 
                                                                src={product.cover_image || ''} 
                                                                alt={product.name || ''}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <Link to={`/product/${product.slug}`} className="text-xs font-bold text-white mb-1 line-clamp-2 hover:text-vape-400" onClick={onClose}>
                                                            {product.name}
                                                        </Link>
                                                        <div className="mt-auto pt-2 flex items-center justify-between">
                                                            <span className="text-sm font-black text-white">{formatPrice(product.price || 0)}</span>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    addItem(product as any);
                                                                    onClose();
                                                                }}
                                                                className="w-6 h-6 rounded-full bg-vape-500 text-white flex items-center justify-center hover:bg-vape-400 transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center rounded-xl border border-white/5 bg-white/5">
                                            <p className="text-xs text-theme-tertiary">Encontramos el equipo pero actualmente no tenemos repuestos exactos en stock.</p>
                                        </div>
                                    )}

                                    <div className="flex justify-center pt-2">
                                        <button 
                                            onClick={resetScanner}
                                            className="text-xs font-bold text-theme-tertiary hover:text-white"
                                        >
                                            Escanear otra imagen
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Hidden File Input */}
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
