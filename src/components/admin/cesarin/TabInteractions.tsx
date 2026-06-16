import { motion } from 'framer-motion';
import { MessageSquare, ThumbsUp, ThumbsDown, Save } from 'lucide-react';
import { PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';
import { useState } from 'react';

interface TabInteractionsProps {
    interactions?: PilotQueryRow[];
    onAddNote?: (interactionId: string, note: string) => void;
}

export function TabInteractions({ interactions = [], onAddNote }: TabInteractionsProps) {
    const [note, setNote] = useState('');
    const [activeInteractionId, setActiveInteractionId] = useState<string | null>(null);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-indigo-400" />
                    Chats de Clientes
                </h2>
                <p className="text-white/50 text-sm">
                    Revisa las conversaciones reales de tus clientes con Cesarin. Califica su desempeño o déjale una nota para que aprenda.
                </p>
            </div>

            <div className="space-y-4">
                {interactions.length === 0 ? (
                    <div className="p-12 text-center rounded-[2rem] border border-white/5 bg-white/[0.02] text-white/40">
                        Aún no hay interacciones recientes.
                    </div>
                ) : (
                    interactions.map((interaction) => (
                        <div key={interaction.id} className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                            <div className="space-y-4">
                                <div className="bg-vape-500/10 text-vape-300 p-4 rounded-2xl w-3/4 ml-auto rounded-tr-sm">
                                    <span className="text-[10px] font-black uppercase opacity-50 block mb-1">Cliente</span>
                                    {interaction.query}
                                </div>
                                <div className="bg-indigo-500/10 text-indigo-300 p-4 rounded-2xl w-3/4 rounded-tl-sm">
                                    <span className="text-[10px] font-black uppercase opacity-50 block mb-1">Cesarin</span>
                                    {interaction.response_text}
                                </div>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                <div className="flex gap-2">
                                    <button className="p-3 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-white/50 transition-colors">
                                        <ThumbsUp className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/50 transition-colors">
                                        <ThumbsDown className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-3 w-1/2">
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Recuerda ofrecer color azul..."
                                        className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none"
                                        value={activeInteractionId === interaction.id ? note : ''}
                                        onChange={(e) => {
                                            setActiveInteractionId(interaction.id);
                                            setNote(e.target.value);
                                        }}
                                    />
                                    <button 
                                        onClick={() => {
                                            if (onAddNote && note) onAddNote(interaction.id, note);
                                            setNote('');
                                        }}
                                        className="p-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 transition-colors disabled:opacity-50"
                                        disabled={activeInteractionId !== interaction.id || !note}
                                    >
                                        <Save className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
}
