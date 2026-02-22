// UserMenuDropdown — Menú de usuario (desktop)
// Independiente: lee auth internamente via useAuth()
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, ShoppingBag, MapPin, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export function UserMenuDropdown() {
    const { user, profile, signOut } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const timeout = useRef<ReturnType<typeof setTimeout>>();

    const handleEnter = () => { clearTimeout(timeout.current); setOpen(true); };
    const handleLeave = () => { timeout.current = setTimeout(() => setOpen(false), 150); };

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, []);

    const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Cuenta';

    return (
        <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-all"
            >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-vape-500/10 border border-vape-500/20">
                    <User className="h-3.5 w-3.5 text-vape-400" />
                </div>
                <span className="hidden lg:inline max-w-[100px] truncate">{displayName}</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-theme/60 bg-theme-primary/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-scale-in">
                    <div className="px-4 py-3 border-b border-theme/50">
                        <p className="text-sm font-medium text-theme-primary truncate">{profile?.full_name ?? 'Mi cuenta'}</p>
                        <p className="text-xs text-theme-secondary truncate">{user?.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors">
                        <User className="h-4 w-4 text-theme-secondary" /> Mi perfil
                    </Link>
                    <Link to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors">
                        <ShoppingBag className="h-4 w-4 text-theme-secondary" /> Mis pedidos
                    </Link>
                    <Link to="/addresses" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-theme-primary transition-colors">
                        <MapPin className="h-4 w-4 text-theme-secondary" /> Mis direcciones
                    </Link>
                    <hr className="border-theme/50" />
                    <button
                        onClick={() => { signOut(); setOpen(false); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut className="h-4 w-4" /> Cerrar sesión
                    </button>
                </div>
            )}
        </div>
    );
}
