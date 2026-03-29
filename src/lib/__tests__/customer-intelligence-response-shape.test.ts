import { describe, expect, it } from 'vitest';

import { compactCesarinResponseText } from '../../../supabase/functions/customer-intelligence/persona.ts';

describe('compactCesarinResponseText', () => {
  it('collapses repeated recommendations and strips a soft closing tail', () => {
    const result = compactCesarinResponseText(
      'Te paso dos opciones. Te paso dos opciones. Si quieres, te paso otra mas.'
    );

    expect(result).toBe('Te paso dos opciones');
  });

  it('keeps one concise clarification question and removes duplicates', () => {
    const result = compactCesarinResponseText(
      'Me falta el modelo exacto. Me dices el modelo? Me dices el modelo?'
    );

    expect(result).toBe('Me falta el modelo exacto. Me dices el modelo?');
  });
});
