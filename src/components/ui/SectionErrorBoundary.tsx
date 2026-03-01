/**
 * SectionErrorBoundary — Envoltura de error boundary por sección.
 *
 * Permite que cada sección de la página falle de forma aislada
 * sin afectar al resto de la página. Si un componente hijo lanza un error,
 * esta sección simplemente no se renderiza (o muestra un fallback opcional).
 *
 * Supports auto-reset via `resetKey`: when the value changes (e.g.,
 * location.pathname), the error state is cleared so the section re-renders.
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
    /** When this value changes the error state is cleared (e.g. pass location.pathname) */
    resetKey?: string;
}

interface SectionErrorBoundaryState {
    hasError: boolean;
    prevResetKey?: string;
}

export class SectionErrorBoundary extends Component<SectionErrorBoundaryProps, SectionErrorBoundaryState> {
    constructor(props: SectionErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, prevResetKey: props.resetKey };
    }

    static getDerivedStateFromError(): Partial<SectionErrorBoundaryState> {
        return { hasError: true };
    }

    static getDerivedStateFromProps(
        props: SectionErrorBoundaryProps,
        state: SectionErrorBoundaryState,
    ): Partial<SectionErrorBoundaryState> | null {
        if (props.resetKey !== undefined && props.resetKey !== state.prevResetKey) {
            return { hasError: false, prevResetKey: props.resetKey };
        }
        return null;
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
