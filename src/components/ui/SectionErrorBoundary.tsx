/**
 * SectionErrorBoundary — Envoltura de error boundary por sección.
 *
 * Permite que cada sección de la página falle de forma aislada
 * sin afectar al resto de la página. Si un componente hijo lanza un error,
 * esta sección simplemente no se renderiza (o muestra un fallback opcional).
 *
 * @module SectionErrorBoundary
 * @independent No depende de ningún otro módulo.
 * @usage Envolver cualquier sección con <SectionErrorBoundary><Component /></SectionErrorBoundary>
 */
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface SectionErrorBoundaryProps {
    children: ReactNode;
    /** Nombre de la sección para logs */
    name?: string;
    /** Componente alternativo en caso de error (por defecto: null = invisible) */
    fallback?: ReactNode;
}

interface SectionErrorBoundaryState {
    hasError: boolean;
}

export class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
    constructor(props: SectionErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): SectionErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(`[SectionErrorBoundary] Error in "${this.props.name ?? 'unknown'}":`, error, info);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback ?? null;
        }
        return this.props.children;
    }
}
