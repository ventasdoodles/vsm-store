// Formulario de Registro - VSM Store
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface SignUpFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

export function SignUpForm({ onSuccess, onSwitchToLogin }: SignUpFormProps) {
    const { signUp } = useAuth();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validate = (): string | null => {
        if (!fullName.trim()) return 'Ingresa tu nombre completo';
        if (!email.trim()) return 'Ingresa tu email';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Email no válido';
        if (password.length < 6) return 'La contraseña debe tener mínimo 6 caracteres';
        if (password !== confirmPassword) return 'Las contraseñas no coinciden';
        if (!acceptTerms) return 'Debes aceptar los términos y condiciones';
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            await signUp(email, password, fullName, phone || undefined);
            setSuccess(true);
            onSuccess?.();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Error al crear cuenta';
            if (message.includes('already registered')) {
                setError('Este email ya está registrado');
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center space-y-4 py-8">
                <span className="text-5xl">📧</span>
                <h2 className="text-xl font-bold text-primary-100">¡Cuenta creada!</h2>
                <p className="text-sm text-primary-400 max-w-xs mx-auto">
                    Revisa tu email para confirmar tu cuenta. Puedes cerrar esta ventana.
                </p>
            </div>
        );
    }

    const inputClasses = (hasError: boolean) => cn(
        'w-full rounded-xl border bg-primary-900/50 px-4 py-3 text-sm text-primary-100 placeholder-primary-600',
        'outline-none transition-all focus:ring-2',
        hasError ? 'border-red-500/50 focus:ring-red-500/30' : 'border-primary-800 focus:border-vape-500 focus:ring-vape-500/20'
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-primary-100">Crear cuenta</h2>
                <p className="mt-1 text-sm text-primary-500">Únete a VSM Store</p>
            </div>

            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* Nombre completo */}
            <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-primary-400 mb-1.5">
                    Nombre completo *
                </label>
                <input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Juan Pérez"
                    className={inputClasses(!!error && !fullName.trim())}
                />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-primary-400 mb-1.5">
                    Email *
                </label>
                <input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className={inputClasses(!!error && !email.trim())}
                />
            </div>

            {/* Teléfono / WhatsApp */}
            <div>
                <label htmlFor="signup-phone" className="block text-sm font-medium text-primary-400 mb-1.5">
                    Teléfono / WhatsApp
                </label>
                <input
                    id="signup-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="228 123 4567"
                    className={inputClasses(false)}
                />
            </div>

            {/* Password */}
            <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-primary-400 mb-1.5">
                    Contraseña * <span className="text-primary-600 font-normal">(mín. 6 caracteres)</span>
                </label>
                <div className="relative">
                    <input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(inputClasses(!!error && password.length < 6), 'pr-11')}
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

            {/* Confirm password */}
            <div>
                <label htmlFor="signup-confirm" className="block text-sm font-medium text-primary-400 mb-1.5">
                    Confirmar contraseña *
                </label>
                <input
                    id="signup-confirm"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={inputClasses(!!error && password !== confirmPassword && confirmPassword.length > 0)}
                />
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-primary-700 bg-primary-900 text-vape-500 focus:ring-vape-500/30"
                />
                <span className="text-xs text-primary-500 leading-relaxed">
                    Acepto los{' '}
                    <span className="text-vape-400 hover:text-vape-300 cursor-pointer">términos y condiciones</span>
                    {' '}y la{' '}
                    <span className="text-vape-400 hover:text-vape-300 cursor-pointer">política de privacidad</span>
                </span>
            </label>

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
                    <UserPlus className="h-4 w-4" />
                )}
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
            </button>

            {/* Switch to login */}
            <p className="text-center text-sm text-primary-500">
                ¿Ya tienes cuenta?{' '}
                {onSwitchToLogin ? (
                    <button
                        type="button"
                        onClick={onSwitchToLogin}
                        className="font-medium text-vape-400 hover:text-vape-300 transition-colors"
                    >
                        Iniciar sesión
                    </button>
                ) : (
                    <Link to="/login" className="font-medium text-vape-400 hover:text-vape-300 transition-colors">
                        Iniciar sesión
                    </Link>
                )}
            </p>
        </form>
    );
}
