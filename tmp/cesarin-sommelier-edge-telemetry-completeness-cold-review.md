# COLD REVIEW — SOMMELIER EDGE TELEMETRY COMPLETENESS

## 1. Files inspected

- [supabase/functions/customer-intelligence/index.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/index.ts)
- [supabase/functions/customer-intelligence/tools.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/tools.ts)
- [supabase/functions/customer-intelligence/persona.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/persona.ts)
- [src/services/concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts)
- [src/services/ai-capsule-orchestrator.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/ai-capsule-orchestrator.service.ts)
- [src/hooks/useAIConcierge.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/hooks/useAIConcierge.ts)

## 2. Exact telemetry path classification

- Client-logged paths:
  - `product_search_integrity`
  - `knowledge_rag_foundation`
  - `cart_operator`
- Edge-logged paths:
  - `OUT_OF_DOMAIN` fast-path
  - non-capsule Sommelier responses after tool execution or direct reply:
    - `CHIT_CHAT` / greetings
    - compatibility replies
    - inventory outlook replies
    - order-tracking replies
    - WhatsApp / escalation-style replies
    - generic non-capsule Sommelier responses
- Critical split:
  - if `requires_client_capsule === true`, the client logs
  - if `server_telemetry_logged === true`, the client skips generic-path logging

## 3. Where edge logging occurs

- In [customer-intelligence/index.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/supabase/functions/customer-intelligence/index.ts), `OUT_OF_DOMAIN` does:
  - `supabase.from('ai_analytics').insert({...})`
  - no `await`
  - returns `server_telemetry_logged: true`
- In the general Sommelier path, after `aiData.debug` is assembled, edge does:
  - `supabase.from('ai_analytics').insert(analyticsPayload).then(...)`
  - also no `await`
  - then sets `aiData.server_telemetry_logged = true`
- No inspected edge telemetry insert in this lane is awaited.

## 4. What client logging skips because of it

- In [concierge.service.ts](/c:/Users/dgcar/OneDrive/Desktop/VSM%20pwa/vsm-store/src/services/concierge.service.ts), generic-path telemetry only runs when `!data.server_telemetry_logged`.
- So when edge returns `server_telemetry_logged: true`, the client skips persisting:
  - `response_text`
  - `detected_intent`
  - routed capsule metadata
  - fallback / semantic flags
  - product card count
  - offered products
  - generic error typing for that branch
- Result: edge claims canonical ownership of telemetry for those turns.

## 5. Whether the completeness gap is real

- Yes, the gap is real.
- Strongest confirmed cases:
  - `OUT_OF_DOMAIN` edge logging persists `response_text: null` even though the returned reply has real prose. Client logging is skipped, so operator-visible response prose can be lost for that class.
  - General Sommelier path only inserts when `aiData.text` exists. But the later “text guarantee” runs after that insert block. If Sommelier produced `message` only, or required fallback injection later, edge can still set `server_telemetry_logged = true` while no insert happened.
  - Both edge insert paths are fire-and-forget. If the insert drops or races after response return, the client will still skip logging.
- So there are real classes where:
  - edge claims telemetry was logged
  - client logging is suppressed
  - insert can be missing or incomplete

## 6. Risk classification (A/B/C/D)

- `A) real current gap`
- It is not just low-probability debt, because at least one class is deterministically incomplete today: `OUT_OF_DOMAIN` stores null `response_text`.
- It also affects operator-relevant fields, not only minor metadata.

## 7. Smallest safe next move

- Smallest safe move is a narrow telemetry-ownership hardening pass only for edge-logged turns:
  - make edge telemetry insert blocking or positively acknowledged before setting `server_telemetry_logged: true`
  - ensure the persisted payload uses the final guaranteed response text, not pre-guarantee `aiData.text`
  - keep scope limited to Sommelier / non-capsule edge paths and `OUT_OF_DOMAIN`
- No broader routing or admin-surface work is justified from this scoping review.

## 8. Whether Antigravity implementation is needed immediately

- Yes.
- This lane now has enough evidence to justify an immediate Antigravity hardening pass, because the gap can remove or degrade canonical operator evidence on edge-owned turns.
