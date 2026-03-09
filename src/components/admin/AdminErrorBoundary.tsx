// AdminErrorBoundary — Captura errores en páginas admin sin romper el layout
import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { logError } from '@/services/monitoring.service';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[AdminErrorBoundary]', error, info.componentStack);
        logError('AdminBoundary', error, { react: { componentStack: info.componentStack } });
    }

    handleRetry = () => this.setState({ hasError: false, error: null });

    render() {
        if (!this.state.hasError) return this.props.children;

        return (
            <div className="flex items-center justify-center p-12">
                <div className="max-w-md w-full rounded-2xl border border-red-500/20 bg-red-950/10 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
                        <AlertTriangle className="h-7 w-7 text-red-400" />
                    </div>
                    <h2 className="text-lg font-bold text-theme-primary mb-2">Error en este módulo</h2>
                    <p className="text-sm text-theme-secondary mb-6">
                        Ocurrió un error inesperado. El resto del panel sigue funcionando.
                    </p>

                    {import.meta.env.DEV && this.state.error && (
                        <details className="mb-4 text-left rounded-lg bg-black/20 p-3">
                            <summary className="cursor-pointer text-xs text-theme-secondary">Detalles (dev)</summary>
                            <pre className="mt-2 whitespace-pre-wrap text-xs text-red-300/80 font-mono">
                                {this.state.error.message}
                            </pre>
                        </details>
                    )}

                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => window.history.back()}
                            className="inline-flex items-center gap-2 rounded-xl border border-theme px-4 py-2 text-sm text-theme-primary hover:bg-theme-secondary/30 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" /> Atrás
                        </button>
                        <button
                            onClick={this.handleRetry}
                            className="inline-flex items-center gap-2 rounded-xl bg-vape-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-vape-500 transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" /> Reintentar
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
