import { MessageSquare, Sparkles } from 'lucide-react';
import type { CustomerIntelligence } from '@/services/admin';

interface IntelligenceMessageBubbleProps {
    intelligence: CustomerIntelligence | null;
    generatedWhatsApp: string;
    setGeneratedWhatsApp: (msg: string | null) => void;
}

export function IntelligenceMessageBubble({
    intelligence,
    generatedWhatsApp,
    setGeneratedWhatsApp
}: IntelligenceMessageBubbleProps) {
    return (
        <div className="mt-8 p-6 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 animate-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                        <h6 className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Mensaje de WhatsApp Generado</h6>
                        <p className="text-xs text-white/40">Personalizado según el contexto del cliente</p>
                    </div>
                </div>
                <button 
                    onClick={() => setGeneratedWhatsApp(null)}
                    className="text-[10px] font-bold text-white/20 hover:text-white/40 uppercase tracking-widest"
                >
                    Cerrar
                </button>
            </div>
            <div className="relative p-6 rounded-3xl bg-black/40 border border-white/5 group">
                <textarea 
                    value={generatedWhatsApp}
                    onChange={(e) => setGeneratedWhatsApp(e.target.value)}
                    className="w-full bg-transparent border-none text-sm text-white/80 leading-relaxed italic resize-none focus:ring-0 p-0"
                    rows={4}
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Sparkles className="h-3 w-3 text-emerald-500/30" />
                </div>
            </div>
            <div className="flex items-center gap-4 mt-6">
                <button 
                    onClick={() => {
                        const phone = intelligence?.customer_phone || '';
                        const text = encodeURIComponent(generatedWhatsApp);
                        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
                    }}
                    className="flex-1 px-6 py-4 rounded-2xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                    <MessageSquare className="h-4 w-4" />
                    Enviar por WhatsApp
                </button>
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(generatedWhatsApp);
                        alert('Mensaje copiado al portapapeles');
                    }}
                    className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                >
                    Copiar
                </button>
            </div>
        </div>
    );
}
