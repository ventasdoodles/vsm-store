/**
 * // ─── COMPONENTE: ProductsHeader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Cabecera premium del modulo de productos con orbes violeta/indigo,
 *    stats en vivo (total, activos, bajo stock), boton CSV glassmorphism y boton crear con glow.
 * // Regla / Notas: Props tipadas. Sin `any`. Glassmorphism puro.
 */
import { Plus, Download, Package, ShoppingBag, AlertTriangle } from 'lucide-react';
import type { Product } from '@/types/product';

interface ProductsHeaderProps {
    products: Product[];
    onExportCSV: () => void;
    onAddProduct: () => void;
}

export function ProductsHeader({ products, onExportCSV, onAddProduct }: ProductsHeaderProps) {
    const total   = products.length;
    const active  = products.filter(p => p.is_active).length;
    const lowStock = products.filter(p => p.is_active && p.stock < 5).length;

    return (
        <div className="relative overflow-hidden rounded-[2rem] border border-white/5 bg-theme-primary/10 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            {/* Ambient Glows */}
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-violet-500/10 blur-[100px]" />
            <div className="pointer-events-none absolute right-1/4 top-0 h-56 w-56 rounded-full bg-indigo-500/8 blur-[100px]" />
            <div className="pointer-events-none absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-fuchsia-500/5 blur-[80px]" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Left: Title + Icon */}
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-gradient-to-br from-violet-500/20 to-indigo-500/10 rounded-[1rem] border border-violet-500/20 shadow-inner">
                            <Package className="h-7 w-7 text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                        </div>
                        <span className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-500/20 to-indigo-500/20 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-violet-400 ring-1 ring-inset ring-violet-500/30">
                            Catalogo
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white drop-shadow-sm">Productos</h1>
                    <p className="mt-1 text-sm font-medium text-theme-secondary/80">
                        Gestiona tu inventario completo desde aqui.
                    </p>
                </div>

                {/* Right: Stats + Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    {/* Mini Stats Pills */}
                    <div className="flex flex-wrap items-center gap-2">
                        <StatPill icon={<ShoppingBag className="h-3.5 w-3.5" />} label="Total" value={total} color="text-violet-400 bg-violet-500/10 ring-violet-500/20" />
                        <StatPill icon={<Package className="h-3.5 w-3.5" />} label="Activos" value={active} color="text-emerald-400 bg-emerald-500/10 ring-emerald-500/20" />
                        {lowStock > 0 && (
                            <StatPill icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Bajo stock" value={lowStock} color="text-amber-400 bg-amber-500/10 ring-amber-500/20" />
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onExportCSV}
                            className="inline-flex items-center gap-2 rounded-[1rem] border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/70 backdrop-blur-sm transition-all hover:bg-white/10 hover:text-white"
                            title="Exportar lista filtrada a CSV"
                        >
                            <Download className="h-4 w-4" />
                            CSV
                        </button>
                        <button
                            onClick={onAddProduct}
                            className="
                                group relative inline-flex items-center gap-2 rounded-[1rem] px-5 py-2.5
                                font-bold text-white text-sm
                                bg-gradient-to-r from-violet-600 to-indigo-600
                                shadow-lg shadow-violet-500/20
                                transition-all duration-300
                                hover:shadow-violet-500/30 hover:-translate-y-0.5 hover:scale-[1.02]
                                active:scale-[0.98]
                            "
                        >
                            <div className="pointer-events-none absolute inset-0 rounded-[1rem] bg-gradient-to-r from-violet-500 to-indigo-500 opacity-0 blur-xl transition-opacity group-hover:opacity-30" />
                            <Plus className="relative z-10 h-4 w-4" />
                            <span className="relative z-10">Nuevo</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Pill de estadistica individual */
function StatPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
    return (
        <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset backdrop-blur-sm ${color}`}>
            {icon}
            <span className="opacity-60">{label}</span>
            <span className="font-black">{value}</span>
        </div>
    );
}
