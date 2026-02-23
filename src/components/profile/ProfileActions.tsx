/**
 * ProfileActions — Botón de cerrar sesión y acciones futuras.
 *
 * @module ProfileActions
 * @independent Componente 100% independiente. Lee auth + navigate internamente.
 * @removable Quitar de Profile.tsx sin consecuencias para el resto de la página.
 */
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function ProfileActions() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <section>
            <button
                onClick={handleSignOut}
                className="group flex w-full items-center justify-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 backdrop-blur-sm py-4 text-sm font-semibold text-red-400 transition-all duration-300 hover:bg-red-500/15 hover:border-red-500/40 hover:shadow-lg hover:shadow-red-500/10 active:scale-[0.98]"
            >
                <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Cerrar sesión
            </button>
        </section>
    );
}
