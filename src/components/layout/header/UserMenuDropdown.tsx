// UserMenuDropdown — Menú de usuario (desktop)
// Independiente: lee auth internamente via useAuth()
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, ShoppingBag, MapPin, ChevronDown, Heart, Truck } from 'lucide-react';
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
                className="flex items-center gap-2 rounded-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-all shadow-inner bg-[#1e2538] border border-white/10"
            >
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-accent-primary/20 border border-accent-primary/50 text-accent-primary shadow-[0_0_10px_rgba(59,130,246,0.2)] overflow-hidden">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={displayName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-4 w-4 sm:h-4 sm:w-4" />
                    )}
                </div>
                <span className="hidden lg:inline max-w-[120px] truncate">{displayName}</span>
                <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-200 opacity-70', open && 'rotate-180')} />
            </button>

            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[220px] overflow-hidden rounded-xl border border-theme-strong bg-theme-primary/95 shadow-2xl shadow-black/50 backdrop-blur-xl animate-scale-in">
                    <div className="px-4 py-3 border-b border-theme">
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
                    <Link to="/rastreo" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-yellow-400 transition-colors">
                        <Truck className="h-4 w-4 text-theme-secondary group-hover:text-yellow-400" /> Rastrear pedido
                    </Link>
                    <Link to="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-secondary/50 hover:text-red-400 transition-colors">
                        <Heart className="h-4 w-4 text-theme-secondary group-hover:text-red-400" /> Mis favoritos
                    </Link>
                    <hr className="border-theme" />
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
