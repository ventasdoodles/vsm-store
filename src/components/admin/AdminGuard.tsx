// Guard para rutas de admin - VSM Store
// Verifica auth + rol admin antes de renderizar
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { checkIsAdmin } from '@/services/admin.service';
import { ShieldX, Loader2 } from 'lucide-react';

interface AdminGuardProps {
    children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
    const { user, loading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setChecking(false);
            setIsAdmin(false);
            return;
        }

        checkIsAdmin(user.id)
            .then(setIsAdmin)
            .finally(() => setChecking(false));
    }, [user, authLoading]);

    // Loading
    if (authLoading || checking) {
        return (
            <div className="flex h-screen items-center justify-center bg-primary-950">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-vape-400" />
                    <p className="text-sm text-primary-400">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Not admin
    if (!isAdmin) {
        return (
            <div className="flex h-screen items-center justify-center bg-primary-950">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                    <ShieldX className="h-12 w-12 text-red-400" />
                    <h1 className="text-xl font-bold text-primary-100">Acceso denegado</h1>
                    <p className="text-sm text-primary-400 max-w-xs">
                        No tienes permisos de administrador. Contacta al propietario si necesitas acceso.
                    </p>
                    <a
                        href="/"
                        className="mt-2 rounded-lg bg-primary-800 px-4 py-2 text-sm text-primary-300 hover:bg-primary-700 transition-colors"
                    >
                        Volver a la tienda
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
