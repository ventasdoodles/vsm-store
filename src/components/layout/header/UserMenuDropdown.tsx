// UserMenuDropdown — Menú de usuario (desktop)
// Independiente: lee auth internamente via useAuth()
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, ShoppingBag, MapPin, ChevronDown, Heart, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { usePointsBalance } from '@/hooks/useLoyalty';

export function UserMenuDropdown() {
    const { user, profile, signOut } = useAuth();
    const { data: points = 0 } = usePointsBalance(user?.id);
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

    const firstName = profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Cuenta';
 
    return (
        <div ref={ref} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 sm:px-3 sm:py-2 text-sm font-bold text-white/80 hover:bg-white/10 hover:text-white transition-all shadow-inner bg-[#1e2538]/50 border border-white/10 backdrop-blur-sm"
            >
                <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-vape-500/10 border border-vape-500/30 text-vape-400 overflow-hidden">
                    {profile?.avatar_url ? (
                        <img
                            src={profile.avatar_url}
                            alt={firstName}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    )}
                </div>

                <span className="hidden sm:inline max-w-[100px] truncate">{firstName}</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform duration-200 opacity-70', open && 'rotate-180')} />
            </button>


            {open && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-[240px] overflow-hidden rounded-xl border border-white/10 bg-[#0f172a]/95 shadow-2xl shadow-black/80 backdrop-blur-2xl animate-scale-in">
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-bold text-white truncate">{profile?.full_name ?? 'Mi cuenta'}</p>
                            <p className="text-[11px] text-white/50 truncate font-medium">{user?.email}</p>
                        </div>
                        <div className="flex flex-col items-end justify-center pl-3 border-l border-white/10 shrink-0">
                            <span className="text-[9px] font-black uppercase tracking-widest text-vape-400">V-Coins</span>
                            <span className="text-[13px] font-black text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">{points.toLocaleString()}</span>
                        </div>
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
