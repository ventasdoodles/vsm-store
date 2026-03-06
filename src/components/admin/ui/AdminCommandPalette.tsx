import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Package, Users, ClipboardList, FolderTree, Ticket, Store, Grid, Presentation, Zap, Award, Tag, Gift, MessageSquareQuote, Activity, type LucideIcon } from 'lucide-react';

interface CommandItem {
    id: string;
    title: string;
    description: string;
    path: string;
    icon: LucideIcon;
    section: string;
}

const COMMANDS: CommandItem[] = [
    { id: '1', title: 'Dashboard', description: 'Métricas generales', path: '/admin', icon: Store, section: 'General' },
    { id: '2', title: 'Pedidos', description: 'Gestión logística', path: '/admin/orders', icon: ClipboardList, section: 'Operaciones' },
    { id: '3', title: 'Clientes', description: 'Directorio de usuarios', path: '/admin/customers', icon: Users, section: 'Operaciones' },
    { id: '4', title: 'Productos', description: 'Catálogo principal', path: '/admin/products', icon: Package, section: 'Inventario' },
    { id: '5', title: 'Categorías', description: 'Árbol y estructura', path: '/admin/categories', icon: FolderTree, section: 'Inventario' },
    { id: '6', title: 'Marcas', description: 'Partners comerciales', path: '/admin/brands', icon: Award, section: 'Inventario' },
    { id: '7', title: 'Etiquetas', description: 'Tags para SEO y UI', path: '/admin/tags', icon: Tag, section: 'Inventario' },
    { id: '8', title: 'Editor Home', description: 'Layout del storefront', path: '/admin/home-editor', icon: Grid, section: 'Vitrina' },
    { id: '9', title: 'MegaHero Sliders', description: 'Banners principales', path: '/admin/sliders', icon: Presentation, section: 'Vitrina' },
    { id: '10', title: 'Ofertas Flash', description: 'Descuentos por tiempo', path: '/admin/flash-deals', icon: Zap, section: 'Vitrina' },
    { id: '11', title: 'Testimonios', description: 'Social proof', path: '/admin/testimonials', icon: MessageSquareQuote, section: 'Vitrina' },
    { id: '12', title: 'V-Coins (Lealtad)', description: 'Puntos y recompensas', path: '/admin/loyalty', icon: Gift, section: 'Retención' },
    { id: '13', title: 'Cupones', description: 'Códigos promocionales', path: '/admin/coupons', icon: Ticket, section: 'Retención' },
    { id: '14', title: 'Configuración', description: 'Ajustes globales', path: '/admin/settings', icon: Store, section: 'Sistema' },
    { id: '15', title: 'Monitoreo', description: 'Logs y rendimiento', path: '/admin/monitoring', icon: Activity, section: 'Sistema' },
];

/**
 * // ─── COMPONENTE: AdminCommandPalette ───
 * // Arquitectura: Orquestador Flotante
 * // Propósito principal: Navegación superrápida presionando Cmd+K / Ctrl+K
 */
export function AdminCommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    // Registrar atajo de teclado global
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Bloquear scroll del body al abrir
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setSearch('');
        }
    }, [open]);

    if (!open) return null;

    const filtered = search
        ? COMMANDS.filter((cmd) => cmd.title.toLowerCase().includes(search.toLowerCase()) || cmd.description.toLowerCase().includes(search.toLowerCase()))
        : COMMANDS;

    const handleSelect = (path: string) => {
        setOpen(false);
        navigate(path);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-32">
            {/* Overlay desenfocado */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
                onClick={() => setOpen(false)}
            />

            {/* Contenedor principal Glassmorphism */}
            <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-theme-primary/80 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
                {/* Glow ambiental interno */}
                <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-vape-500/20 blur-[60px]" />

                {/* Barra de Búsqueda */}
                <div className="relative flex items-center border-b border-white/5 px-6 py-4">
                    <Search className="h-5 w-5 text-theme-secondary/50" />
                    <input
                        autoFocus
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Saltar a... (ej. Clientes)"
                        className="ml-4 flex-1 bg-transparent text-lg font-medium text-white placeholder-theme-secondary/40 outline-none"
                    />
                    <div className="flex items-center gap-1 ml-4 select-none">
                        <kbd className="inline-flex h-6 items-center justify-center rounded border border-white/10 bg-white/5 px-2 text-xs font-medium text-theme-secondary">ESC</kbd>
                    </div>
                </div>

                {/* Lista de Resultados */}
                <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                    {filtered.length === 0 ? (
                        <div className="py-14 text-center text-sm text-theme-secondary">
                            No se encontraron módulos.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item.path)}
                                    className="group flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-white/5"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30 border border-white/5 text-theme-secondary group-hover:bg-vape-500/20 group-hover:text-vape-400 group-hover:border-vape-500/30 transition-all">
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-theme-primary group-hover:text-vape-300">
                                            {item.title}
                                        </div>
                                        <div className="text-xs text-theme-secondary/60">
                                            {item.description}
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium text-theme-secondary/40 uppercase tracking-widest hidden sm:block">
                                        {item.section}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
