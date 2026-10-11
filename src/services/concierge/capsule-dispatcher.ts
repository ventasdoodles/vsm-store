import { isCustomerIntelligenceNoWriteSmokeActive } from '@/lib/customer-intelligence-no-write-smoke';
import { capsuleHandlers, isCapsuleName } from './handlers';
import type {
    DispatchClientCapsuleParams,
    ClientCapsuleDispatchResult,
} from './dispatch.types';

export type {
    DispatchClientCapsuleParams,
    ClientCapsuleDispatchResult,
    CapsuleName,
} from './dispatch.types';

export async function dispatchClientCapsule(
    params: DispatchClientCapsuleParams
): Promise<ClientCapsuleDispatchResult | null> {
    try {
        const capsuleName = params.data?.capsule_name;

        if (!isCapsuleName(capsuleName)) {
            return null;
        }

        const noWriteSmokeActive = isCustomerIntelligenceNoWriteSmokeActive(params.data?.no_write_smoke);
        const handler = capsuleHandlers[capsuleName];

        return await handler(params, noWriteSmokeActive);
    } catch (error) {
        console.error('[CapsuleDispatcher] Handler or dispatch failure:', error);
        return {
            message: 'No pude completar esa consulta en este momento. Podemos intentarlo de nuevo o, si me dices el modelo que tienes, te ayudo a ubicar la refacción.',
            intent: 'info',
            turn_analysis: params.turnAnalysis,
            catalog_gate: params.catalogGate,
            source_context: params.sourceContext,
        };
    }
}
