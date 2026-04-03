export type AITelemetryOwner = 'edge' | 'client';

export interface AITelemetryContract {
  owner: AITelemetryOwner;
  edge_logged: boolean;
  client_should_log_fallback: boolean;
  reason:
    | 'capsule_handoff'
    | 'edge_logged'
    | 'edge_insert_failed'
    | 'legacy_client_capsule'
    | 'legacy_edge_logged'
    | 'legacy_edge_failed';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

export function resolveAITelemetryContract(input: {
  telemetry_contract?: unknown;
  server_telemetry_logged?: unknown;
  requires_client_capsule?: unknown;
}): AITelemetryContract {
  const explicit = isRecord(input.telemetry_contract) ? input.telemetry_contract : null;
  if (explicit) {
    const owner = explicit.owner === 'edge' ? 'edge' : explicit.owner === 'client' ? 'client' : null;
    const edgeLogged = explicit.edge_logged === true;
    const clientShouldLogFallback = explicit.client_should_log_fallback === true;
    const reason = typeof explicit.reason === 'string' ? explicit.reason : null;

    if (owner && reason) {
      return {
        owner,
        edge_logged: edgeLogged,
        client_should_log_fallback: clientShouldLogFallback,
        reason: reason as AITelemetryContract['reason'],
      };
    }
  }

  if (input.requires_client_capsule === true) {
    return {
      owner: 'client',
      edge_logged: false,
      client_should_log_fallback: true,
      reason: 'legacy_client_capsule',
    };
  }

  if (input.server_telemetry_logged === true) {
    return {
      owner: 'edge',
      edge_logged: true,
      client_should_log_fallback: false,
      reason: 'legacy_edge_logged',
    };
  }

  return {
    owner: 'edge',
    edge_logged: false,
    client_should_log_fallback: true,
    reason: 'legacy_edge_failed',
  };
}

export function shouldClientLogAITelemetry(contract: AITelemetryContract): boolean {
  return contract.owner === 'client' || contract.client_should_log_fallback;
}
