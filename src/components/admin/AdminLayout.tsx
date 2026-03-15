// Layout principal del Admin Panel - VSM Store
// Sidebar + Header + Content area
import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Activity,
    Package,
    ClipboardList,
    FolderTree,
    Users,
    Ticket,
    Tag,
    Award,
    LogOut,
    Menu,
    X,
    Store,
    Grid,
    Home as HomeIcon,
    Layers,
    Dices,
    Edit3,
    ChevronRight,
    Search,
    Presentation,
    Zap,
    Gift,
    MessageSquareQuote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAdminPulse } from '@/hooks/admin/useAdminPulse';
import { AdminCommandPalette } from './ui/AdminCommandPalette';
import { AdminPulse } from './layout/AdminPulse';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TacticalProvider } from '@/contexts/TacticalContext';
import { AnimatedAtmosphere } from './layout/AnimatedAtmosphere';
const BREADCRUMB_LABELS: Record<string, string> = {
    admin: 'Inicio',
    orders: 'Pedidos',
    customers: 'Clientes',
    products: 'Productos',
    categories: 'Categorías',
    brands: 'Marcas',
    tags: 'Etiquetas',
    'home-editor': 'Editor Home',
    sliders: 'Sliders',
    'flash-deals': 'Ofertas Flash',
    testimonials: 'Testimonios',
    loyalty: 'V-Coins',
    coupons: 'Cupones',
    settings: 'Configuración',
    monitoring: 'Monitoreo',
    attributes: 'Atributos de Producto',
    'wheel-game': 'Ruleta de Premios',
};

interface AdminLayoutProps {
    children: React.ReactNode;
}

type LucideIcon = typeof LayoutDashboard;

interface MenuItem {
    path: string;
    label: string;
    icon: LucideIcon;
    /** Muestra badge "Pro" en el sidebar */
    isNew?: boolean;
    /** Muestra un ping animado para llamar la atención */
    isPendingOrders?: boolean;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const getMenuSections = (hasPendingOrders: boolean): MenuSection[] => [
    {
        title: 'Operaciones',
        items: [
            { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/admin/orders', label: 'Pedidos', icon: ClipboardList, isPendingOrders: hasPendingOrders },
            { path: '/admin/customers', label: 'Clientes', icon: Users },
        ]
    },
    {
        title: 'Inventario',
        items: [
            { path: '/admin/products', label: 'Productos', icon: Package },
            { path: '/admin/categories', label: 'Categorías', icon: FolderTree },
            { path: '/admin/brands', label: 'Marcas', icon: Award },
            { path: '/admin/tags', label: 'Etiquetas', icon: Tag },
            { path: '/admin/attributes', label: 'Atributos', icon: Layers },
            { path: '/admin/batch-manager', label: 'Batch Manager', icon: Edit3, isNew: true },
        ]
    },
    {
        title: 'Vitrina',
        items: [
            { path: '/admin/home-editor', label: 'Editor Home', icon: Grid },
            { path: '/admin/sliders', label: 'MegaHero Sliders', icon: Presentation },
            { path: '/admin/flash-deals', label: 'Ofertas Flash', icon: Zap, isNew: true },
            { path: '/admin/testimonials', label: 'Testimonios', icon: MessageSquareQuote },
        ]
    },
    {
        title: 'Retención',
        items: [
            { path: '/admin/loyalty', label: 'V-Coins (Lealtad)', icon: Gift, isNew: true },
            { path: '/admin/coupons', label: 'Cupones', icon: Ticket },
            { path: '/admin/wheel-game', label: 'Ruleta de Premios', icon: Dices, isNew: true },
        ]
    },
    {
        title: 'Sistema',
        items: [
            { path: '/admin/settings', label: 'Configuración', icon: Store },
            { path: '/admin/monitoring', label: 'Monitoreo', icon: Activity },
        ]
    }
];

const Breadcrumbs = React.memo(() => {
    const location = useLocation();
    const paths = location.pathname.split('/').filter(p => p && p !== 'admin');

    return (
        <nav className="flex items-center gap-2 mb-6 text-xs font-bold animate-in fade-in slide-in-from-left-2 duration-500">
            <Link to="/admin" className="flex items-center gap-1.5 text-theme-secondary hover:text-vape-400 transition-colors">
                <HomeIcon className="h-3 w-3" />
                <span>Admin</span>
            </Link>
            {paths.map((path, idx) => {
                const label = BREADCRUMB_LABELS[path] || path;
                const isLast = idx === paths.length - 1;
                const route = `/admin/${paths.slice(0, idx + 1).join('/')}`;
                const displayLabel = path.length > 20 ? `Detalles` : label;

                return (
                    <div key={path} className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3 text-theme-secondary/30" />
                        {isLast ? (
                            <span className="text-white bg-vape-500/10 px-2 py-0.5 rounded-lg border border-vape-500/20">{displayLabel}</span>
                        ) : (
                            <Link to={route} className="text-theme-secondary hover:text-vape-400 transition-colors capitalize">
                                {displayLabel}
                            </Link>
                        )}
                    </div>
                );
            })}
        </nav>
    );
});
Breadcrumbs.displayName = 'Breadcrumbs';

interface SidebarItemProps {
    item: MenuItem;
    active: boolean;
    onClick: () => void;
    isSystemCritical: boolean;
    isSystemBusy: boolean;
}

const SidebarItem = React.memo(({ item, active, onClick, isSystemCritical, isSystemBusy }: SidebarItemProps) => {
    return (
        <Link
            to={item.path}
            onClick={onClick}
            className={cn(
                'group relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300',
                active
                    ? 'bg-vape-500/10 text-vape-400 shadow-[inset_0_1px_10px_rgba(168,85,247,0.05)] border border-vape-500/10'
                    : 'text-theme-secondary hover:bg-white/[0.03] hover:text-white'
            )}
        >
            {active && (
                <motion.div
                    layoutId="active-pill"
                    className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-vape-500 shadow-[0_0_15px_rgba(168,85,247,0.8)]"
                />
            )}

            <div className={cn(
                "relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 shrink-0",
                active ? "bg-vape-500/20 text-vape-300 shadow-inner border border-vape-500/20" : "bg-white/[0.02] group-hover:bg-white/[0.05] border border-transparent group-hover:border-white/5"
            )}>
                <item.icon
                    className={cn(
                        'h-[18px] w-[18px] transition-all duration-500',
                        active ? 'scale-110 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'group-hover:scale-110'
                    )}
                />
            </div>

            <span className="relative z-10 truncate tracking-wide">{item.label}</span>

            {item.isNew ? (
                <span className="ml-auto inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]">
                    Pro
                </span>
            ) : item.isPendingOrders ? (
                <span className="ml-auto relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vape-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-vape-500 shadow-[0_0_10px_rgba(168,85,247,1)]"></span>
                </span>
            ) : item.path === '/admin/monitoring' ? (
                <div className="ml-auto relative flex h-2 w-2">
                    <span className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        isSystemCritical ? "bg-red-500" : isSystemBusy ? "bg-amber-500" : "bg-emerald-500"
                    )}></span>
                    <span className={cn(
                        "relative inline-flex rounded-full h-2 w-2 shadow-[0_0_8px_rgba(0,0,0,0.5)]",
                        isSystemCritical ? "bg-red-500" : isSystemBusy ? "bg-amber-500" : "bg-emerald-500"
                    )}></span>
                </div>
            ) : active ? (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-vape-500 shadow-[0_0_10px_rgba(168,85,247,1)] shrink-0" />
            ) : null}
        </Link>
    );
});
SidebarItem.displayName = 'SidebarItem';

export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleOmniSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        const q = searchQuery.trim();
        if (q.length > 5 && (q.includes('-') || !isNaN(Number(q)))) {
            navigate(`/admin/orders?search=${q}`);
        } else {
            navigate(`/admin/customers?search=${q}`);
        }
        setSearchQuery('');
    };

    // Consolidate Pulse and Monitoring into a single high-efficiency flow
    const { metrics } = useAdminPulse();

    const isSystemCritical = metrics.status === 'alert';
    const isSystemBusy = metrics.status === 'busy';
    const menuSections = useMemo(() => 
        getMenuSections(metrics.activeOrders > 0),
        [metrics.activeOrders]
    );

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <TacticalProvider>
            <div className="relative flex h-screen overflow-hidden bg-[#07070a] text-theme-primary selection:bg-vape-500/30">
                {/* 🌌 Admin Liquid Mesh Background */}
                <AnimatedAtmosphere />

                <AdminCommandPalette />
                <ConfirmDialog />

                {/* Mobile overlay */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <aside
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/5 bg-[#0a0a0f]/80 backdrop-blur-2xl transition-transform lg:static lg:translate-x-0 lg:w-64',
                        !sidebarOpen && '-translate-x-full lg:translate-x-0'
                    )}
                    style={{
                        transitionDuration: sidebarOpen ? '500ms' : '300ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    <div className="flex items-center justify-between border-b border-white/5 px-6 py-6">
                        <Link to="/admin" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-vape-500 to-vape-600 shadow-[0_0_20px_rgba(168,85,247,0.3)] border border-white/10">
                                <Store className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <span className="text-sm font-black tracking-tight text-white uppercase italic">VSM Admin</span>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-vape-400 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-vape-400/80">
                                        Control
                                    </span>
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="rounded-xl p-2 text-theme-secondary hover:bg-white/5 transition-colors lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <nav className="flex-1 space-y-8 overflow-y-auto px-5 py-8 custom-scrollbar">
                        {menuSections.map((section, idx) => (
                            <div key={idx} className="space-y-3 flex flex-col items-stretch">
                                <h3 className="px-4 text-[9px] font-black uppercase tracking-[0.3em] text-theme-secondary/30 select-none">
                                    {section.title}
                                </h3>
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <SidebarItem
                                            key={item.path}
                                            item={item}
                                            active={isActive(item.path)}
                                            onClick={() => setSidebarOpen(false)}
                                            isSystemCritical={isSystemCritical}
                                            isSystemBusy={isSystemBusy}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto border-t border-white/5 p-5 space-y-3">
                        <Link
                            to="/"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-theme-secondary hover:bg-white/5 hover:text-white transition-all border border-transparent hover:border-white/5"
                        >
                            <Store className="h-4 w-4" />
                            Ver sitio público
                        </Link>
                        <button
                            onClick={handleSignOut}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                        >
                            <LogOut className="h-4 w-4" />
                            Cerrar sesión
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <header className="relative z-20 flex h-16 items-center gap-4 border-b border-white/5 bg-[#0a0a0f]/40 backdrop-blur-xl px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-xl p-2 text-theme-secondary hover:bg-theme-secondary/50 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <div className="flex-1" />

                        {/* Omnisearch */}
                        <form onSubmit={handleOmniSearch} className="hidden md:flex relative max-w-xs w-full group mx-4">
                            <Search className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20 group-focus-within:text-vape-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Buscar pedido o cliente..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-xl border border-white/5 bg-white/5 py-2 pl-10 pr-4 text-[11px] text-white placeholder-white/20 focus:border-vape-500/30 focus:bg-white/[0.07] focus:outline-none transition-all"
                            />
                        </form>

                        <div className="flex-1" />

                        <AdminPulse />

                        <div className="flex-1" />

                        <div className="flex items-center gap-3 rounded-2xl bg-theme-primary/30 p-1.5 pr-4 border border-theme">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-vape-400 to-vape-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                                {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                            </div>
                            <div className="hidden flex-col sm:flex">
                                <span className="text-[11px] font-bold text-white leading-tight">Admin</span>
                                <span className="text-xs text-theme-secondary leading-tight">
                                    {user?.email ?? 'admin@vsm.store'}
                                </span>
                            </div>
                        </div>
                    </header>

                    <main className="relative z-10 flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                        <div className="mx-auto max-w-7xl">
                            <Breadcrumbs />
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </TacticalProvider>
    );
}
