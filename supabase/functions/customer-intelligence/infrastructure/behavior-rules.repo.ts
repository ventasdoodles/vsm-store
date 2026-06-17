import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export interface AIBehaviorRule {
    rule_text: string;
    type: 'MUST_DO' | 'NEVER_DO';
}

export class BehaviorRulesRepo {
    constructor(private supabase: SupabaseClient) {}

    async getActiveRules(): Promise<AIBehaviorRule[]> {
        try {
            const { data, error } = await this.supabase
                .from('ai_behavior_rules')
                .select('rule_text, type')
                .eq('is_active', true);

            if (error) {
                console.error('[BehaviorRulesRepo] Error fetching rules:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('[BehaviorRulesRepo] Exception fetching rules:', err);
            return [];
        }
    }
}
