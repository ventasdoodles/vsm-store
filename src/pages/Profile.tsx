// Página de Perfil - VSM Store
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Star, LogOut, Crown, BarChart3 } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const TIER_CONFIG = {
    bronze: { label: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-600/10', border: 'border-amber-600/30' },
    silver: { label: 'Silver', color: 'text-gray-300', bg: 'bg-gray-300/10', border: 'border-gray-300/30' },
    gold: { label: 'Gold', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/30' },
    platinum: { label: 'Platinum', color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/30' },
};

export function Profile() {
    const { user, profile, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Mi perfil | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const tier = profile?.customer_tier ?? 'bronze';
    const tierConfig = TIER_CONFIG[tier];

    return (
        <div className="container-vsm py-8 space-y-6">
            {/* Header del perfil */}
            <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-vape-500/10">
                    <User className="h-8 w-8 text-vape-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="text-xl font-bold text-theme-primary truncate">
                        {profile?.full_name ?? user?.email ?? '...'}
                    </h1>
                    <p className="text-sm text-theme-secondary truncate">{user?.email}</p>
                    {/* Tier badge */}
                    <div className={cn(
                        'mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
                        tierConfig.color, tierConfig.bg, tierConfig.border
                    )}>
                        <Crown className="h-3 w-3" />
                        {tierConfig.label}
                    </div>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-theme bg-theme-secondary/20 p-4 text-center">
                    <p className="text-2xl font-bold text-theme-primary">{profile?.total_orders ?? 0}</p>
                    <p className="text-xs text-theme-secondary mt-1">Pedidos</p>
                </div>
                <div className="rounded-xl border border-theme bg-theme-secondary/20 p-4 text-center">
                    <p className="text-2xl font-bold text-vape-400">
                        {formatPrice(profile?.total_spent ?? 0)}
                    </p>
                    <p className="text-xs text-theme-secondary mt-1">Total gastado</p>
                </div>
            </div>

            {/* Links de navegación */}
            <div className="space-y-2">
                <Link
                    to="/orders"
                    className="flex items-center gap-3 rounded-xl border border-theme bg-theme-secondary/20 px-4 py-3.5 transition-all hover:bg-theme-secondary/50 hover:border-theme"
                >
                    <ShoppingBag className="h-5 w-5 text-vape-400" />
                    <span className="text-sm font-medium text-theme-primary">Mis pedidos</span>
                    <span className="ml-auto text-xs text-theme-secondary">→</span>
                </Link>

                <Link
                    to="/addresses"
                    className="flex items-center gap-3 rounded-xl border border-theme bg-theme-secondary/20 px-4 py-3.5 transition-all hover:bg-theme-secondary/50 hover:border-theme"
                >
                    <MapPin className="h-5 w-5 text-herbal-400" />
                    <span className="text-sm font-medium text-theme-primary">Mis direcciones</span>
                    <span className="ml-auto text-xs text-theme-secondary">→</span>
                </Link>

                <Link
                    to="/loyalty"
                    className="flex items-center gap-3 rounded-xl border border-theme bg-theme-secondary/20 px-4 py-3.5 transition-all hover:bg-theme-secondary/50 hover:border-theme"
                >
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span className="text-sm font-medium text-theme-primary">Programa de lealtad</span>
                    <span className="ml-auto text-xs text-theme-secondary">→</span>
                </Link>

                <Link
                    to="/stats"
                    className="flex items-center gap-3 rounded-xl border border-theme bg-theme-secondary/20 px-4 py-3.5 transition-all hover:bg-theme-secondary/50 hover:border-theme"
                >
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    <span className="text-sm font-medium text-theme-primary">Mis estadísticas</span>
                    <span className="ml-auto text-xs text-theme-secondary">→</span>
                </Link>
            </div>

            {/* Info del perfil */}
            {profile && (
                <div className="rounded-xl border border-theme bg-theme-secondary/20 p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-theme-secondary">Información</h3>
                    <div className="space-y-2 text-sm">
                        {profile.phone && (
                            <div className="flex justify-between">
                                <span className="text-theme-secondary">Teléfono</span>
                                <span className="text-theme-primary">{profile.phone}</span>
                            </div>
                        )}
                        {profile.whatsapp && (
                            <div className="flex justify-between">
                                <span className="text-theme-secondary">WhatsApp</span>
                                <span className="text-theme-primary">{profile.whatsapp}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-theme-secondary">Miembro desde</span>
                            <span className="text-theme-primary">
                                {new Date(profile.created_at).toLocaleDateString('es-MX', {
                                    year: 'numeric', month: 'long',
                                })}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Cerrar sesión */}
            <button
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-3.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/30"
            >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
            </button>
        </div>
    );
}
