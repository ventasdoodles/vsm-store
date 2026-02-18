import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorBoundaryProps {
    children: React.ReactNode;
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

        // TODO: Log to Sentry when implemented
        // Sentry.captureException(error, { contexts: { react: { componentStack: errorInfo.componentStack } } });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-primary-950 p-4">
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
                            <h1 className="text-2xl font-bold text-primary-100 mb-3">
                                Algo salió mal
                            </h1>

                            {/* Description */}
                            <p className="text-primary-400 mb-6">
                                Ocurrió un error inesperado. No te preocupes, tus datos están seguros.
                                Intenta recargar la página o volver al inicio.
                            </p>

                            {/* Error Details (Solo en dev) */}
                            {import.meta.env.DEV && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-sm text-primary-500 hover:text-primary-400 mb-2">
                                        Detalles técnicos (desarrollo)
                                    </summary>
                                    <div className="rounded-lg bg-primary-900/50 p-4 border border-primary-800">
                                        <p className="text-xs font-mono text-red-400 mb-2">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo && (
                                            <pre className="text-xs text-primary-500 overflow-x-auto whitespace-pre-wrap">
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

                                <Link
                                    to="/"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary-800 bg-primary-900/50 px-6 py-3 text-base font-bold text-primary-200 transition-all hover:bg-primary-800 hover:text-primary-100"
                                >
                                    <Home className="h-5 w-5" />
                                    Volver al Inicio
                                </Link>
                            </div>

                            {/* Support */}
                            <p className="mt-6 text-sm text-primary-500">
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
