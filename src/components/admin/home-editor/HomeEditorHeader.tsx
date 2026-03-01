import { Grid, Save, Loader2, Undo2 } from 'lucide-react';

interface HomeEditorHeaderProps {
    isDirty: boolean;
    isPending: boolean;
    onSave: () => void;
    onDiscard: () => void;
    slotsCount: number;
}

export function HomeEditorHeader({
    isDirty,
    isPending,
    onSave,
    onDiscard,
    slotsCount,
}: HomeEditorHeaderProps) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                    <Grid className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-theme-primary">Categorías Destacadas (Home)</h1>
                    <p className="text-sm text-theme-secondary mt-1">
                        Configura las {slotsCount} categorías principales que aparecen en la página de inicio.
                    </p>
                </div>
            </div>

            <div className="flex gap-3">
                {isDirty && (
                    <button
                        type="button"
                        onClick={onDiscard}
                        className="flex items-center gap-2 rounded-xl border border-theme px-4 py-2.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/20 transition-colors"
                    >
                        <Undo2 className="h-4 w-4" />
                        Descartar
                    </button>
                )}
                <button
                    type="button"
                    onClick={onSave}
                    disabled={isPending || !isDirty}
                    className="flex items-center gap-2 rounded-xl bg-vape-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-vape-500/20 transition-all hover:bg-vape-600 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    Guardar Categorías
                </button>
            </div>
        </div>
    );
}
