import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logError } from '@/services';

interface ErrorBoundaryProps {
    children: React.ReactNode;
    /** UI a mostrar si el componente falla. Si es null o no se provee, muestra el error full-screen. */
    fallback?: React.ReactNode;
    /** Si es true, el boundary no renderizará nada en caso de error (se vuelve invisible). */
    silent?: boolean;
    /** Identificador del componente para logging detallado. */
    componentName?: string;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error details
        console.error('❌ ErrorBoundary caught an error:', error);
        console.error('Component stack:', errorInfo.componentStack);

        this.setState({
            error,
            errorInfo,
        });

        // Log to Sentry & Supabase
        logError(this.props.componentName || 'AppBoundary', error, { 
            react: { componentStack: errorInfo.componentStack },
            isModular: !!this.props.fallback || this.props.silent
        });

        // DEV OVERRIDE TO CATCH ERROR
        localStorage.setItem('VSM_LAST_CRASH', error.stack || error.message);
        if (errorInfo?.componentStack) {
            localStorage.setItem('VSM_LAST_CRASH_STACK', errorInfo.componentStack);
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Modo Silencioso: El componente desaparece totalmente
            if (this.props.silent) {
                return null;
            }

            // Modo Modular: Se muestra una UI de reemplazo específica
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Modo Global: Layout de error completo
            return (
                <div className="min-h-screen flex items-center justify-center bg-theme-primary p-4">
                    <div className="max-w-lg w-full">
                        {/* Error Card */}
                        <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-8 backdrop-blur-sm text-center">
                            {/* Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="rounded-full bg-red-500/10 p-4 border border-red-500/30">
                                    <AlertTriangle className="h-12 w-12 text-red-500" />
                                </div>
                            </div>

                            {/* Title */}
                            <h1 className="text-2xl font-bold text-theme-primary mb-3">
                                Algo salió mal
                            </h1>

                            {/* Description */}
                            <p className="text-theme-secondary mb-6">
                                Ocurrió un error inesperado. No te preocupes, tus datos están seguros.
                                Intenta recargar la página o volver al inicio.
                            </p>

                            {/* Error Details (Solo en dev) */}
                            {import.meta.env.DEV && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-sm text-theme-secondary hover:text-theme-secondary mb-2">
                                        Detalles técnicos (desarrollo)
                                    </summary>
                                    <div className="rounded-lg bg-theme-primary/50 p-4 border border-theme">
                                        <p className="text-xs font-mono text-red-400 mb-2">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <pre className="text-xs text-theme-secondary overflow-x-auto whitespace-pre-wrap">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={this.handleReload}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-vape-600 px-6 py-3 text-base font-bold text-white shadow-lg shadow-vape-900/20 transition-all hover:bg-vape-500 hover:shadow-vape-500/20"
                                >
                                    <RefreshCw className="h-5 w-5" />
                                    Recargar Página
                                </button>

                                <a
                                    href="/"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-theme bg-theme-primary/50 px-6 py-3 text-base font-bold text-theme-primary transition-all hover:bg-theme-secondary hover:text-theme-primary"
                                >
                                    <Home className="h-5 w-5" />
                                    Volver al Inicio
                                </a>
                            </div>

                            {/* Support */}
                            <p className="mt-6 text-sm text-theme-secondary">
                                Si el problema persiste, contáctanos por{' '}
                                <a
                                    href="https://wa.me/5212281234567"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-vape-400 hover:text-vape-300 underline"
                                >
                                    WhatsApp
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
