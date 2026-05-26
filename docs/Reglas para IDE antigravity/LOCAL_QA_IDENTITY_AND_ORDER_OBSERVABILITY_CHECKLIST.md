# Local QA Identity + Order Observability Checklist

> Procedural checklist for local/pre-prod admin and order proof.
> This is not canon. It is a repeatable operator protocol for avoiding blind QA loops.

## Purpose

Use this checklist when a lane needs to prove customer/admin/order truth without turning
`order_number` alone into evidence.

## Core Rules

1. Start from `order_id`, not `order_number`.
2. Cross-check customer identity with email, `customer_id`, and timestamps.
3. Treat `order_number` as a label that may collide with historical rows.
4. Never inspect cookies, localStorage, sessionStorage, auth headers, tokens, passwords, or env values.
5. If safe identity resolution is not available, stop and require owner-provided admin QA credential/provisioning.

## Safe Identity Resolution Flow

Use the smallest read path that can answer the question:

1. Confirm the dummy customer email used in the flow.
2. Resolve the user UUID by bounded, read-only means only when explicitly authorized.
3. Cross-check the UUID against `customer_profiles` when available.
4. Use that UUID to validate `orders.customer_id` and the order timestamps.
5. If a dummy admin is required, resolve the admin UUID first and then provision `public.admin_users` only when explicitly authorized.

### Safe read-only lookup targets

- `auth.users` by email, only when the prompt explicitly authorizes the lookup and the output stays bounded.
- `customer_profiles` by id or by the resolved customer identity.
- `public.admin_users` by id after the admin identity is resolved.
- `orders` by `id` first, then cross-check `customer_id`, `order_number`, status, payment, total, item data, and timestamps.

## Order Observability Flow

1. Use `order_id` first.
2. Cross-check `customer_id`, customer email, `order_number`, `status`, `payment_method`, `payment_status`, `total`, item count, and timestamps.
3. If a historical row appears with the same `order_number`, reject `order_number`-only proof.
4. Record which source was used for each observation: browser UI, read-only DB, or both.
5. Preserve visible lifecycle controls that exist, but do not exercise them unless the prompt explicitly authorizes status mutation.

## Admin Path Rules

- Reuse an already authorized normal UI admin session only if one is already available and the prompt allows it.
- If no admin session exists, create a fresh dummy admin only through normal UI and only if the prompt authorizes that path.
- Perform exactly one scoped `public.admin_users` provisioning row only when explicitly authorized.
- Do not expand into broader admin provisioning, policy changes, or extra rows.

## Duplicate Order Number Warning

- `order_number` is not a unique proof key for QA.
- A historical row can exist with the same `order_number` as a fresh order.
- When that happens, treat the lane as blocked until the proof can be anchored on `order_id`.
- Do not canonize or accept any claim that relies on `order_number` alone.

## Leftover Dummy Data Policy

- Leave dummy customers, dummy orders, and scoped admin rows in place if doing so preserves evidence.
- Document any leftover dummy data explicitly in the lane report.
- Cleanup is optional and should only happen when it does not reduce evidence.

## Fallbacks

Use this fallback order when a lane is blocked:

1. Try read-only order/customer proof by `order_id`.
2. Try read-only identity resolution by bounded email lookup if explicitly authorized.
3. Try normal UI admin session reuse if an authorized session already exists.
4. Try scoped dummy admin provisioning only if explicitly authorized.
5. Stop and require owner-provided admin QA credential/provisioning if none of the above is safe.

## Stop Conditions

Stop immediately if:

- the lane would require secret/session inspection;
- the lane would require production/live/provider work;
- the lane would require a second order just to disambiguate a broken proof path;
- the lane would require `order_number`-only evidence;
- the lane would require unbounded DB probing.
