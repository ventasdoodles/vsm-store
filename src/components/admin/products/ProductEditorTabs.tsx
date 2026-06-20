import { Package2, FolderTree, Layers, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

export type EditorTab = 'comercial' | 'clasificacion' | 'configuracion' | 'inteligencia';

interface ProductEditorTabsProps {
    activeTab: EditorTab;
    setActiveTab: (tab: EditorTab) => void;
}

export function ProductEditorTabs({ activeTab, setActiveTab }: ProductEditorTabsProps) {
    return (
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/5 rounded-2xl mb-8 mx-auto">
            {[
                { id: 'comercial', icon: Package2, label: 'Comercial' },
                { id: 'clasificacion', icon: FolderTree, label: 'Clasificación' },
                { id: 'configuracion', icon: Layers, label: 'Configuración' },
                { id: 'inteligencia', icon: BrainCircuit, label: 'Inteligencia' }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as EditorTab)}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                        activeTab === tab.id 
                            ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20" 
                            : "text-white/30 hover:bg-white/5 hover:text-white/60"
                    )}
                >
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
