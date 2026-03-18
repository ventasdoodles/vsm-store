import { LucideIcon } from 'lucide-react';

export type BehaviorMode = 'vendedor' | 'informativo' | 'soporte';

export interface AIConfig {
    id: string;
    name: string;
    voice_tone: string;
    behavior_mode: BehaviorMode;
    welcome_message: string;
    temperature: number;
    top_p: number;
    updated_at?: string;
}

export interface AIRule {
    id: string;
    category: 'personalidad' | 'logistica' | 'ventas' | 'integralidad' | string;
    content: string;
    is_enabled: boolean;
    config_id?: string;
    priority?: number;
}

export interface LearningItem {
    id?: string;
    query: string;
    detected_intent: string | null;
    frustration_detected: boolean;
    created_at: string;
}

export interface SimulationMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface SimulationDebug {
    intent?: string;
    confidence?: number;
    should_close_session?: boolean;
    frustration?: boolean;
    analyst_report?: {
        intent: string;
        doubts: string[];
        customer_dna: {
            loyalty: string;
            interests: string[];
            avg_ticket: string;
            is_new: boolean;
        };
        relevant_stock: string[];
    };
    sommelier_report?: {
        rules_applied: string[];
        tone_correction: boolean;
        creative_layer: string;
    };
}

export interface SimulationSession {
    id: string;
    history: SimulationMessage[];
    metadata: {
        last_intent?: string;
        frustration_detected?: boolean;
        debug?: SimulationDebug;
    };
    is_active: boolean;
    created_at: string;
    expires_at: string;
}

export interface MemoryTrace {
    read_attempted: boolean;
    row_found: boolean;
    context_injected: boolean;
    interests_count: number;
    skipped_reason: 'no_id' | 'no_row' | 'empty_interests' | 'not_useful_for_turn' | 'read_error' | null;
}

export interface SimulationResult {
    scenario_id: string;
    scenario_type?: string;
    score: number;
    passed: boolean;
    status: string;
    detected_intent: string;
    response: string;
    latency_ms: number;
    knowledge_chunks: number;
    tools_called: string[];
    reasons: string[];
    validation_hints?: string[];
    dimension_scores?: Record<string, number>;
    memory_trace?: MemoryTrace;
    judge_eval?: {
        tone_score: number;
        grounding_score: number;
        hallucination_detected: boolean;
        comment: string;
        judged_at: string;
        judge_model: string;
    };
}

export interface SimulationReport {
    id: string;
    timestamp: string;
    total: number;
    passed: number;
    failed: number;
    results: SimulationResult[];
}

export interface NavTab {
    id: 'persona' | 'knowledge' | 'rules' | 'analytics' | 'simulator' | 'learning' | 'quality' | 'pilot';
    label: string;
    icon: LucideIcon;
}

export interface ProductAIInfo {
    id: string;
    name: string;
    ai_is_featured: boolean;
    ai_sales_note: string | null;
    ai_exclude: boolean;
    cover_image?: string;
}
