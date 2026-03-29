import type { CatalogGateDecision, TurnFirstIntentProfile } from './intent-guardrails.ts';
import {
  UI_AFFORDANCES,
  getCapabilityDefinition,
  getCapabilityIdsForIntent,
  isCatalogCapabilityId,
  isClientCapsuleCapabilityId,
  isEdgeFunctionCapabilityId,
  listCapabilityDefinitions,
  type CapabilityId,
  type NativePublicCapabilityId,
  type OwnFunctionCapabilityId,
  type ToolCapabilityDefinition,
} from './tool-index.ts';
import type { ToolCall } from './tools.ts';

export interface RuntimePrimaryCapability {
  kind: 'client_capsule' | 'own_function' | 'model_knowledge' | 'none';
  name: CapabilityId | null;
  call: ToolCall | null;
  source: 'analyst' | 'edge_truth' | 'model_only' | 'none';
  capabilityClass: ToolCapabilityDefinition['class'] | null;
  execution: ToolCapabilityDefinition['execution'] | null;
}

export interface RuntimeCapabilityPlan {
  toolCalls: ToolCall[];
  serverToolCalls: ToolCall[];
  turnProfile: TurnFirstIntentProfile;
  catalogGate: CatalogGateDecision;
  primaryCapability: RuntimePrimaryCapability;
  capabilityBox: {
    modelKnowledge: ToolCapabilityDefinition[];
    nativePublic: ToolCapabilityDefinition[];
    ownFunctions: ToolCapabilityDefinition[];
    uiAffordances: readonly string[];
  };
  forcedCapability: OwnFunctionCapabilityId | null;
}

function dedupeToolCalls(toolCalls: ToolCall[]): ToolCall[] {
  const seen = new Set<string>();
  const deduped: ToolCall[] = [];

  for (const toolCall of toolCalls) {
    const key = `${toolCall.name}:${JSON.stringify(toolCall.args ?? {})}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(toolCall);
  }

  return deduped;
}

function findFirstToolCall(toolCalls: ToolCall[], names: string[]): ToolCall | null {
  return toolCalls.find((toolCall) => names.includes(toolCall.name)) ?? null;
}

function matchesCapabilityFamily(toolName: string, capabilityId: OwnFunctionCapabilityId): boolean {
  if (capabilityId === 'knowledge_rag_foundation') {
    return toolName === 'knowledge_rag_foundation' || toolName === 'get_store_policy';
  }

  if (capabilityId === 'product_search_integrity') {
    return toolName === 'product_search_integrity' || toolName === 'search_products';
  }

  return toolName === capabilityId;
}

function buildBorderCapabilityFallback(intent: string, query: string): { id: OwnFunctionCapabilityId; args: Record<string, unknown> } | null {
  if (intent === 'POLICY_INQUIRY') {
    return {
      id: 'knowledge_rag_foundation',
      args: { query, is_ambiguous: true },
    };
  }

  if (intent === 'ORDER_TRACKING') {
    return {
      id: 'track_order',
      args: { order_number: query },
    };
  }

  if (intent === 'INVENTORY_OUTLOOK') {
    return {
      id: 'get_inventory_outlook',
      args: { query },
    };
  }

  if (intent === 'COMPATIBILITY_CHECK') {
    return {
      id: 'check_compatibility',
      args: { query },
    };
  }

  if (intent === 'CART_OPERATION') {
    return {
      id: 'cart_operator',
      args: { action: 'ADD', product_ref: query, quantity: 1 },
    };
  }

  return null;
}

function buildPrimaryCapability(toolCalls: ToolCall[], intent: string, forcedCapability: OwnFunctionCapabilityId | null): RuntimePrimaryCapability {
  const intentCapabilityIds = getCapabilityIdsForIntent(intent);
  const primaryToolCall = findFirstToolCall(toolCalls, intentCapabilityIds)
    ?? toolCalls.find((toolCall) => getCapabilityDefinition(toolCall.name)?.class === 'OWN_FUNCTION')
    ?? null;

  if (!primaryToolCall) {
    const modelCapability = getCapabilityDefinition('model_turn_reasoning');
    return {
      kind: modelCapability ? 'model_knowledge' : 'none',
      name: modelCapability?.id ?? null,
      call: null,
      source: modelCapability ? 'model_only' : 'none',
      capabilityClass: modelCapability?.class ?? null,
      execution: modelCapability?.execution ?? null,
    };
  }

  const definition = getCapabilityDefinition(primaryToolCall.name);
  if (!definition) {
    return {
      kind: 'none',
      name: null,
      call: primaryToolCall,
      source: 'none',
      capabilityClass: null,
      execution: null,
    };
  }

  return {
    kind: isClientCapsuleCapabilityId(definition.id)
      ? 'client_capsule'
      : definition.class === 'OWN_FUNCTION'
        ? 'own_function'
        : 'none',
    name: definition.id,
    call: primaryToolCall,
    source: forcedCapability === definition.id ? 'edge_truth' : 'analyst',
    capabilityClass: definition.class,
    execution: definition.execution,
  };
}

export function buildRuntimeCapabilityPlan(input: {
  intent: string;
  query: string;
  toolCalls: ToolCall[];
  hasAudio: boolean;
  hasMemorySummary?: boolean;
  turnProfile: TurnFirstIntentProfile;
  catalogGate: CatalogGateDecision;
}): RuntimeCapabilityPlan {
  const toolCalls = dedupeToolCalls(
    input.catalogGate.is_open
      ? input.toolCalls
      : input.toolCalls.filter((toolCall) => !isCatalogCapabilityId(toolCall.name)),
  );
  let forcedCapability: OwnFunctionCapabilityId | null = null;

  const borderFallback = buildBorderCapabilityFallback(input.intent, input.query);
  if (borderFallback && !toolCalls.some((toolCall) => matchesCapabilityFamily(toolCall.name, borderFallback.id))) {
    forcedCapability = borderFallback.id;
    toolCalls.push({
      name: borderFallback.id,
      args: borderFallback.args,
    });
  }

  const ownFunctionIds = toolCalls
    .map((toolCall) => toolCall.name)
    .filter((toolName): toolName is OwnFunctionCapabilityId => Boolean(getCapabilityDefinition(toolName)?.class === 'OWN_FUNCTION'));
  const nativePublicIds: NativePublicCapabilityId[] = input.hasAudio
    ? ['audio_input', 'public_web_search', 'public_url_context']
    : ['public_web_search', 'public_url_context'];
  const modelKnowledgeIds = input.hasMemorySummary
    ? ['model_turn_reasoning', 'lightweight_memory_read', 'response_synthesis']
    : ['model_turn_reasoning', 'response_synthesis'];

  return {
    toolCalls,
    serverToolCalls: toolCalls.filter((toolCall) => isEdgeFunctionCapabilityId(toolCall.name)),
    turnProfile: input.turnProfile,
    catalogGate: input.catalogGate,
    primaryCapability: buildPrimaryCapability(toolCalls, input.intent, forcedCapability),
    capabilityBox: {
      modelKnowledge: listCapabilityDefinitions(modelKnowledgeIds),
      nativePublic: listCapabilityDefinitions(nativePublicIds),
      ownFunctions: listCapabilityDefinitions(ownFunctionIds),
      uiAffordances: UI_AFFORDANCES,
    },
    forcedCapability,
  };
}
