// Layout principal del Admin Panel - VSM Store
// Sidebar + Header + Content area
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    FolderTree,
    Users,
    Ticket,
    LogOut,
    Menu,
    X,
    Store,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const NAV_ITEMS = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
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
                    'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-primary-800/50 bg-primary-900 transition-transform lg:static lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="flex items-center justify-between border-b border-primary-800/50 px-5 py-4">
                    <Link to="/admin" className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-vape-500 to-vape-600 shadow-lg shadow-vape-500/20">
                            <Store className="h-4 w-4 text-white" />
                        </div>
                        <div>
                            <span className="text-sm font-bold text-primary-100">VSM Admin</span>
                            <span className="ml-1.5 rounded bg-vape-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-vape-400">
                                Panel
                            </span>
                        </div>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-1 text-primary-400 hover:bg-primary-800 lg:hidden"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {NAV_ITEMS.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={cn(
                                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                                    active
                                        ? 'bg-vape-500/10 text-vape-400 shadow-sm'
                                        : 'text-primary-400 hover:bg-primary-800/60 hover:text-primary-200'
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        'h-[18px] w-[18px] transition-colors',
                                        active ? 'text-vape-400' : 'text-primary-500 group-hover:text-primary-300'
                                    )}
                                />
                                {item.label}
                                {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-vape-500/50" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="border-t border-primary-800/50 p-3 space-y-2">
                    <Link
                        to="/"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-primary-500 hover:bg-primary-800/40 hover:text-primary-300 transition-colors"
                    >
                        <Store className="h-3.5 w-3.5" />
                        Ver tienda
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="flex items-center gap-4 border-b border-primary-800/50 bg-primary-900/50 px-4 py-3 lg:px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="rounded-lg p-1.5 text-primary-400 hover:bg-primary-800 lg:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-gradient-to-br from-vape-400 to-vape-600 flex items-center justify-center text-xs font-bold text-white">
                            {user?.email?.charAt(0).toUpperCase() ?? 'A'}
                        </div>
                        <span className="hidden text-xs text-primary-400 sm:block">
                            {user?.email ?? 'Admin'}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
