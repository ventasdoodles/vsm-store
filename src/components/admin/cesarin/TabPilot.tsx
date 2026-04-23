import { PilotTelemetry } from './PilotTelemetry';
import type { PilotQueryRow } from '@/services/admin/admin-pilot-ops.service';
import type { SignalState } from '@/hooks/useCesarinSignalStates';

interface TabPilotProps {
    onReview: (row: PilotQueryRow) => void;
    signalStates: Record<string, SignalState>;
}

export function TabPilot({ onReview, signalStates }: TabPilotProps) {
    return (
        <div className="space-y-6 p-1">
            <PilotTelemetry onReview={onReview} signalStates={signalStates} />
        </div>
    );
}
