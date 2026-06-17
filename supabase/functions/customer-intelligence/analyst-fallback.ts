export interface NeutralAnalystFallbackReport {
  intent: 'UNKNOWN';
  primary_intent: 'UNKNOWN';
  secondary_intents: [];
  turn_priority: 'UNCLEAR_FIRST';
  turn_decision: 'ASK_CLARIFYING_QUESTION';
  doubts: string[];
  tool_calls: [];
  customer_dna: {
    interests: string[];
    preference_signals: [];
  };
  conversational_prefix: '';
  fallback_reason: 'ANALYST_DEGRADED';
}

export function buildNeutralAnalystFallbackReport(): NeutralAnalystFallbackReport {
  return {
    intent: 'UNKNOWN',
    primary_intent: 'UNKNOWN',
    secondary_intents: [],
    turn_priority: 'UNCLEAR_FIRST',
    turn_decision: 'ASK_CLARIFYING_QUESTION',
    doubts: ['analyst_degraded'],
    tool_calls: [],
    customer_dna: {
      interests: [],
      preference_signals: [],
    },
    conversational_prefix: '',
    fallback_reason: 'ANALYST_DEGRADED',
  };
}
