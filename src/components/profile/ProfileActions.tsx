/**
 * // ─── COMPONENTE: PROFILE ACTIONS ───
 * // Propósito: Acciones de gestión de sesión y seguridad.
 * // Arquitectura: Pure logic bridge with domain hooks.
 * // Estilo: High-Contrast Danger State (§2.1).
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
        <section className="pt-4 border-t border-white/5">
            <button
                onClick={handleSignOut}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl border border-red-500/10 bg-red-500/[0.03] backdrop-blur-xl py-5 text-xs font-black uppercase tracking-[0.2em] text-red-400/80 transition-all duration-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 hover:shadow-2xl hover:shadow-red-500/10 active:scale-[0.98]"
            >
                <LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Finalizar Sesión
            </button>
        </section>
    );
}
