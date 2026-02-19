// Guard para rutas de admin - VSM Store
// Verifica auth + rol admin antes de renderizar
/* eslint-disable no-console */
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
    const [timedOut, setTimedOut] = useState(false);
    const [debugInfo, setDebugInfo] = useState('');

    // Timeout safety - 8 seconds max
    useEffect(() => {
        const timer = setTimeout(() => {
            setTimedOut(true);
            setChecking(false);
        }, 8000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        console.log('[AdminGuard] authLoading:', authLoading, 'user:', user?.id ?? 'null');

        if (authLoading) {
            // eslint-disable-next-line
            setDebugInfo('Esperando autenticación...');
            return;
        }

        if (!user) {
            console.log('[AdminGuard] No user found, redirecting to login');
            setChecking(false);
            setIsAdmin(false);
            return;
        }

        setDebugInfo(`Verificando admin para: ${user.id.slice(0, 8)}...`);
        console.log('[AdminGuard] Checking admin for user:', user.id);

        checkIsAdmin(user.id)
            .then((result) => {
                console.log('[AdminGuard] checkIsAdmin result:', result);
                setIsAdmin(result);
                setDebugInfo(result ? 'Admin confirmado ✓' : 'No es admin ✗');
            })
            .catch((err) => {
                console.error('[AdminGuard] checkIsAdmin error:', err);
                setIsAdmin(false);
                setDebugInfo(`Error: ${err?.message ?? 'desconocido'}`);
            })
            .finally(() => setChecking(false));
    }, [user, authLoading]);

    // Loading
    if ((authLoading || checking) && !timedOut) {
        return (
            <div className="flex h-screen items-center justify-center bg-theme-primary">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-vape-400" />
                    <p className="text-sm text-theme-secondary">Verificando acceso...</p>
                    <p className="text-[10px] text-primary-600 font-mono">{debugInfo}</p>
                </div>
            </div>
        );
    }

    // Timed out - show debug info
    if (timedOut && isAdmin === null) {
        return (
            <div className="flex h-screen items-center justify-center bg-theme-primary">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 text-center max-w-md">
                    <ShieldX className="h-12 w-12 text-amber-400" />
                    <h1 className="text-xl font-bold text-theme-primary">Tiempo de espera agotado</h1>
                    <p className="text-sm text-theme-secondary">
                        No se pudo verificar tu acceso de administrador. Esto puede ser un problema temporal.
                    </p>
                    <div className="w-full rounded-lg bg-theme-primary p-3 text-left">
                        <p className="text-[11px] font-mono text-theme-primary0">
                            Auth: {authLoading ? 'cargando' : user ? `OK (${user.id.slice(0, 8)}...)` : 'sin sesión'}<br />
                            Admin check: {isAdmin === null ? 'sin respuesta' : isAdmin ? 'sí' : 'no'}<br />
                            Debug: {debugInfo}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-lg bg-vape-500 px-4 py-2 text-sm font-medium text-primary-950 hover:bg-vape-400 transition-colors"
                        >
                            Reintentar
                        </button>
                        <a
                            href="/"
                            className="rounded-lg bg-theme-secondary px-4 py-2 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors"
                        >
                            Ir a la tienda
                        </a>
                    </div>
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
            <div className="flex h-screen items-center justify-center bg-theme-primary">
                <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
                    <ShieldX className="h-12 w-12 text-red-400" />
                    <h1 className="text-xl font-bold text-theme-primary">Acceso denegado</h1>
                    <p className="text-sm text-theme-secondary max-w-xs">
                        No tienes permisos de administrador. Contacta al propietario si necesitas acceso.
                    </p>
                    <a
                        href="/"
                        className="mt-2 rounded-lg bg-theme-secondary px-4 py-2 text-sm text-theme-secondary hover:bg-theme-secondary transition-colors"
                    >
                        Volver a la tienda
                    </a>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
