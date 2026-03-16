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
    rules_applied?: string[];
    context_keys?: string[];
    should_close_session?: boolean;
    frustration?: boolean;
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

export interface NavTab {
    id: 'persona' | 'knowledge' | 'rules' | 'analytics' | 'simulator' | 'learning';
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
