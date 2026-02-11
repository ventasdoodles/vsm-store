// Formulario de Login - VSM Store
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToSignUp?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignUp }: LoginFormProps) {
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Completa todos los campos');
            return;
        }

        try {
            setLoading(true);
            await signIn(email, password);
            onSuccess?.();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
            if (message.includes('Invalid login credentials')) {
                setError('Email o contraseña incorrectos');
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-primary-100">Iniciar sesión</h2>
                <p className="mt-1 text-sm text-primary-500">Bienvenido de vuelta a VSM Store</p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Email */}
            <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-primary-400 mb-1.5">
                    Email
                </label>
                <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={cn(
                        'w-full rounded-xl border bg-primary-900/50 px-4 py-3 text-sm text-primary-100 placeholder-primary-600',
                        'outline-none transition-all focus:ring-2',
                        error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-primary-800 focus:border-vape-500 focus:ring-vape-500/20'
                    )}
                />
            </div>

            {/* Password */}
            <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-primary-400 mb-1.5">
                    Contraseña
                </label>
                <div className="relative">
                    <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                            'w-full rounded-xl border bg-primary-900/50 px-4 py-3 pr-11 text-sm text-primary-100 placeholder-primary-600',
                            'outline-none transition-all focus:ring-2',
                            error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-primary-800 focus:border-vape-500 focus:ring-vape-500/20'
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-600 hover:text-primary-400 transition-colors"
                    >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Forgot password */}
            <div className="text-right">
                <Link
                    to="/login"
                    className="text-xs text-vape-400 hover:text-vape-300 transition-colors"
                >
                    ¿Olvidaste tu contraseña?
                </Link>
            </div>

            {/* Submit */}
            <button
                type="submit"
                disabled={loading}
                className={cn(
                    'flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white shadow-lg transition-all',
                    'bg-vape-500 hover:bg-vape-600 shadow-vape-500/25 hover:shadow-vape-500/40',
                    'hover:-translate-y-0.5 active:translate-y-0',
                    'disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0'
                )}
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <LogIn className="h-4 w-4" />
                )}
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>

            {/* Switch to signup */}
            <p className="text-center text-sm text-primary-500">
                ¿No tienes cuenta?{' '}
                {onSwitchToSignUp ? (
                    <button
                        type="button"
                        onClick={onSwitchToSignUp}
                        className="font-medium text-vape-400 hover:text-vape-300 transition-colors"
                    >
                        Crear cuenta
                    </button>
                ) : (
                    <Link to="/signup" className="font-medium text-vape-400 hover:text-vape-300 transition-colors">
                        Crear cuenta
                    </Link>
                )}
            </p>
        </form>
    );
}
