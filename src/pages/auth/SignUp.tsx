// Página de Registro - VSM Store
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuth } from '@/hooks/useAuth';

export function SignUp() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = 'Crear cuenta | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    // Si ya está loggeado, redirigir al perfil
    useEffect(() => {
        if (isAuthenticated) navigate('/profile', { replace: true });
    }, [isAuthenticated, navigate]);

    return (
        <div className="container-vsm flex min-h-[70vh] items-center justify-center py-12">
            <div className="w-full max-w-md rounded-2xl border border-primary-800 bg-primary-900/30 p-8">
                <SignUpForm onSuccess={() => navigate('/')} />
            </div>
        </div>
    );
}
