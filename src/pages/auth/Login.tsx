// Página de Login - VSM Store
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { useAuth } from '@/hooks/useAuth';

export function Login() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Iniciar sesión | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    // Si ya está loggeado, redirigir al perfil
    useEffect(() => {
        if (isAuthenticated) navigate('/profile', { replace: true });
    }, [isAuthenticated, navigate]);

    return (
        <div className="container-vsm flex min-h-[70vh] items-center justify-center py-12">
            <div className="w-full max-w-md rounded-2xl border border-theme bg-theme-secondary/20 p-8">
                <LoginForm onSuccess={() => navigate('/')} />
            </div>
        </div>
    );
}
