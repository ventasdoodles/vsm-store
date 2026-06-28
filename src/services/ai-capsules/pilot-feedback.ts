import { PilotFeedbackInput } from '@/services/ai-capsule-orchestrator.service';
import { supabase } from '@/lib/supabase';































export async function savePilotFeedback(input: PilotFeedbackInput): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
        .from('pilot_feedback')
        .insert({
            prompt:           input.prompt,
            response:         input.response,
            capsule_slug:     input.capsule_slug ?? null,
            rating_accuracy:  input.rating_accuracy,
            rating_tone:      input.rating_tone,
            rating_utility:   input.rating_utility,
            submitted_by:     user?.id ?? null,
        });
    if (error) throw error;
}
