import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TabPilot } from '../TabPilot';
import type { SignalState } from '@/hooks/useCesarinSignalStates';
import type { PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';

interface PilotTelemetryMockProps {
    onReview: (row: Partial<PilotQueryRow>) => void;
    signalStates: Record<string, SignalState>;
}

vi.mock('../PilotTelemetry', () => ({
    PilotTelemetry: ({ onReview, signalStates }: PilotTelemetryMockProps) => (
        <button type="button" onClick={() => onReview({ id: 'pilot-row-1' })}>
            PilotTelemetry core {Object.keys(signalStates).length}
        </button>
    ),
}));

describe('TabPilot', () => {
    it('keeps PilotTelemetry as the operator core without pending-order, probe, or readiness clutter', () => {
        const onReview = vi.fn();

        render(
            <TabPilot
                onReview={onReview}
                signalStates={{
                    'pilot-row-1': {
                        status: 'revisada',
                        handled_at: new Date().toISOString(),
                    },
                }}
            />,
        );

        expect(screen.getByText(/PilotTelemetry core 1/i)).toBeInTheDocument();
        expect(screen.queryByText(/Pedidos pendientes/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Sonda del runtime real/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Verificacion de comportamiento/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Listo para produccion amplia/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Guardar checklist del piloto/i)).not.toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /PilotTelemetry core/i }));
        expect(onReview).toHaveBeenCalledWith({ id: 'pilot-row-1' });
    });
});
