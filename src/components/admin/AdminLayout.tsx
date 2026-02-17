// Layout principal del Admin Panel - VSM Store
// Sidebar + Header + Content area
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Activity,
    Package,
    ClipboardList,
    FolderTree,
    Users,
    Ticket,
    LogOut,
    Menu,
    X,
    Store,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/monitoring', label: 'Monitoreo', icon: Activity },
    { path: '/admin/products', label: 'Productos', icon: Package },
    { path: '/admin/orders', label: 'Pedidos', icon: ClipboardList },
    { path: '/admin/categories', label: 'Categorías', icon: FolderTree },
    { path: '/admin/customers', label: 'Clientes', icon: Users },
    { path: '/admin/coupons', label: 'Cupones', icon: Ticket },
    { path: '/admin/settings', label: 'Configuración', icon: Store },
];

export function AdminLayout({ children }: AdminLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const isActive = (path: string) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex h-screen bg-primary-950 text-primary-100">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-primary-800/30 bg-primary-900/80 backdrop-blur-xl transition-all duration-300 ease-in-out lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between border-b border-primary-800/20 px-5 py-5">
                    <Link to="/admin" className="flex items-center gap-3 transition-transform hover:scale-[1.02]">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-vape-500 to-vape-600 shadow-lg shadow-vape-500/30">
                            <Store className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold tracking-tight text-white">VSM Admin</span>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1 w-1 rounded-full bg-vape-400" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-vape-400/80">
                                    Control
                                </span>
                            </div>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1.5 text-primary-400 hover:bg-primary-800/50 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1.5 px-3 py-6">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                    active
                                        ? 'bg-vape-500/10 text-vape-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]'
                                        : 'text-primary-400 hover:bg-primary-800/40 hover:text-primary-100'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'h-[18px] w-[18px] transition-all duration-200',
                                        active ? 'scale-110 text-vape-400' : 'text-primary-500 group-hover:scale-110 group-hover:text-primary-300'
                                    )}
                                />
                                {item.label}
                                {active && (
                                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-vape-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="mt-auto border-t border-primary-800/20 p-4 space-y-3">
                    <Link
                        to="/"
                        className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-medium text-primary-400 hover:bg-primary-800/40 hover:text-primary-100 transition-all"
                    >
                        <Store className="h-4 w-4" />
                        Ver sitio público
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-medium text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="flex h-16 items-center gap-4 border-b border-primary-800/20 bg-primary-900/50 backdrop-blur-md px-6 lg:px-8">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-xl p-2 text-primary-400 hover:bg-primary-800/50 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3 rounded-2xl bg-primary-950/30 p-1.5 pr-4 border border-primary-800/10">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-vape-400 to-vape-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                            {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <div className="hidden flex-col sm:flex">
                            <span className="text-[11px] font-bold text-white leading-tight">Admin</span>
                            <span className="text-[10px] text-primary-500 leading-tight">
                                {user?.email ?? 'admin@vsm.store'}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.03),transparent_40%)] p-6 lg:p-10">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
