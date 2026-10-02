# AUDITORÍA DESPIADADA DE SEGURIDAD, RLS, CONCURRENCIA Y PAGOS
## VSM Store — Supabase PostgreSQL & Migraciones SQL

**Fecha de Generación:** 2026-10-02T01:38:30.910Z  
**Modelo Auditor:** OpenAI GPT-6 Sol Pro Batch (`openai/gpt-6-sol-pro:batch`)  
**Tokens Auditados:** 387618  
**Costo:** $0.4440211  
**Estado:** 100% Completado  

---

# VSM Store database audit

**Verdict: do not deploy this schema as a payment or checkout authority.** The dump permits an API client to change `admin_users`, submit arbitrary order totals, invoke privileged loyalty and coupon functions, and—in several cases—read or forge operational records. The September fulfillment migration improves serialization **within that one RPC**, but it does not secure the surrounding write paths.

## Scope and location convention

The supplied `db_dump.sql` and migrations have **no line-numbered source representation**. I will not invent “exact” line numbers: blank lines, CRLF, and the rendered dump make guessed numbers unreliable. Each finding below identifies the exact file and SQL object, plus a unique statement to locate with `grep -n` or `rg -n`. Run, for example:

```sh
rg -n 'ALTER TABLE "public"."admin_users"|Allow authenticated to read admin_users' db_dump.sql
rg -n 'CREATE OR REPLACE FUNCTION|SECURITY DEFINER|GRANT EXECUTE' supabase/migrations/20260926130000_atomic_order_fulfillment.sql
```

Also, the dump and migrations are **not the same snapshot**: functions and columns in later migrations—including `decrement_stock_for_order`, `fulfill_order_payment`, and `coupons.customer_id`—are absent from the dump. Findings about those objects apply **if the respective migration ran**. Inspect `supabase_migrations.schema_migrations` and the live catalog before remediation.

## Critical and high-severity findings

| Severity | Exact location / search anchor | Exploit or failure |
|---|---|---|
| **CRITICAL** | `db_dump.sql`, `public.admin_users`: `GRANT ALL ON TABLE "public"."admin_users" TO "authenticated"`; policy `Allow authenticated to read admin_users`; **no** `ALTER TABLE "public"."admin_users" ENABLE ROW LEVEL SECURITY` | Policies on a table with RLS disabled do nothing. An authenticated API client with the table grant can insert their own `(id, 'super_admin')`, update roles, or delete administrators. Nearly every “admin” policy and `cancel_admin_unpaid_order_with_audit` then trusts that row. This is direct administrator takeover. |
| **CRITICAL** | `db_dump.sql`, `public.orders`: `Users can insert own orders`; `public.order_items`: `Users can insert own order items`; corresponding `GRANT ALL` statements | A customer can create an order for themselves with `total = 0.01`, arbitrary `items`, `payment_status = 'paid'`, `status = 'delivered'`, or attacker-chosen MP identifiers; they can supply inconsistent or free order items. RLS checks **ownership, not financial correctness**. The stats trigger may credit fabricated spend. |
| **CRITICAL** | `db_dump.sql` and `20260310000200_loyalty_rpc_fix.sql`, `public.process_loyalty_points`: `SECURITY DEFINER`, unrestricted parameters, grants to `anon`/`authenticated` | `SELECT public.process_loyalty_points(my_uuid,1000000,'earned','bonus',NULL)` creates arbitrary points. An attacker may also choose another customer, negative amounts, or duplicate order rewards. |
| **CRITICAL** | `20260616060000_auto_tier_upgrade.sql`, `public.apply_wheel_prize_points`: grant to `authenticated`, no prize/attempt verification | Any signed-in customer can call it repeatedly with arbitrary `p_customer_id` and `p_points`; it delegates to the vulnerable privileged points writer. |
| **CRITICAL** | `db_dump.sql` and `20260310000100_fix_coupon_rpc.sql`, `public.increment_coupon_uses(text)`; `db_dump.sql`, `public.customer_coupons`, `Users can insert own coupon usage` | Publicly callable privileged counter updates can exhaust coupons. Conversely, a customer can insert a usage record without atomically checking availability, eligibility, time, or their order. `used_count = used_count + 1` alone does not enforce `max_uses`. |
| **HIGH** | `db_dump.sql`, `public.customer_profiles`, `Users can update own profile` | A user can overwrite `total_spent`, `total_orders`, `customer_tier`, `account_status`, and `suspension_end` on their own row. Those fields are business-controlled, not profile-edit fields. |
| **HIGH** | `db_dump.sql`, `public.store_settings`, `Public settings are visible to everyone` | `SELECT *` exposes `bank_account_info` and operational configuration to `anon`. RLS cannot hide columns within a visible row. |
| **HIGH** | `db_dump.sql`, `public.admin_users`, `Allow authenticated to read admin_users` | Even after enabling RLS, this policy exposes the complete administrator roster to every authenticated user. |
| **HIGH** | `db_dump.sql`, `public.get_admin_loyalty_stats()`; `GRANT ALL ... TO "anon"` | This `SECURITY DEFINER` function contains no admin check and returns customer names and loyalty activity to anonymous callers. |
| **HIGH** | `db_dump.sql`, `public.rename_product_tag(...)`; grants to `anon`/`authenticated` | A public caller can modify tags on every matching product and delete/recreate catalog tag definitions through owner privileges. |
| **HIGH** | `20260902190000_atomic_stock_decrement.sql`, `public.decrement_stock_for_order(jsonb)`: only `GRANT EXECUTE ... TO service_role`, without revoking `PUBLIC` | PostgreSQL functions ordinarily grant `EXECUTE` to `PUBLIC` on creation. An explicit grant to `service_role` **does not revoke** that default. An API caller may decrement arbitrary inventory. The function also accepts zero/negative quantities: subtracting a negative quantity **increases** stock. |
| **HIGH** | `20260926130000_atomic_order_fulfillment.sql`, `public.fulfill_order_payment(...)` | The order-row lock correctly serializes calls to **this function** for one order. It does not stop direct admin/service updates or other procedures. The function accepts caller-supplied payment status and MP data as proof, accepts an empty `order_items` set while marking an order paid, and can change a cancelled order to a fulfilled status. Possession or leakage of a service key is sufficient to forge payment; the database never verifies a provider event. |
| **HIGH** | `db_dump.sql`, `public.orders`, `Admins have full access on orders`; `public.admin_users.role = 'viewer'` | Policies commonly test only membership in `admin_users`. A `viewer` can modify orders, coupons, catalog, profiles, and audit records where a matching write policy exists. The cancellation RPC also accepts `viewer`. |
| **HIGH** | `db_dump.sql`, `public.order_admin_events`, `order_admin_events_insert_admin` | A table “append-only” comment is not an authenticity guarantee. Any qualifying admin—including a `viewer`—can insert fabricated event types, provider outcomes, timestamps, amounts, and idempotency keys. `GRANT ALL` additionally makes security depend entirely on RLS remaining enabled. |
| **HIGH** | `db_dump.sql`, `public.cesarin_operator_actions`: `operator_actions_insert_auth`, `operator_actions_select_auth`; `public.cesarin_signal_states`: `signal_states_*_auth` | **Every** authenticated user can read and forge operator activity, and alter shared signal triage. `actor` and `handled_by` are freely supplied text. |
| **HIGH** | `db_dump.sql`, `public.cesarin_pilot_feedback`: `Admins can insert pilot feedback WITH CHECK (true)` and `Admins can view all pilot feedback USING (true)` | Policy names are misleading: anonymous callers can insert and read the feedback, including operator notes and metadata, subject to the granted table privileges—which the dump grants. |
| **HIGH** | `db_dump.sql`, `public.ai_simulation_reports`: `Enable insert for service role WITH CHECK (true)`; `Enable read access for authenticated users` | Anonymous users can forge reports; every signed-in user can read internal QA results. The policy name does not restrict its role. |
| **HIGH** | `db_dump.sql`, `public.app_logs`: `Anyone can insert app logs WITH CHECK (true)`; `public.ai_analytics`: anonymous/authenticated inserts `WITH CHECK (true)` | Untrusted clients can impersonate `user_id`/`customer_id`, poison analytics, inject arbitrary JSON/text, and consume storage. Client-provided log identity is not evidence of identity. |
| **HIGH** | `db_dump.sql`, `public.smart_loyalty_propositions`, `Users can update (claim) their own propositions` | RLS constrains the **row owner**, not which columns change. Customers can alter discount, generated code, expiry, coupon link, or claim state if these columns remain update-granted. |
| **HIGH** | `db_dump.sql`, `public.user_notifications`, `Users can update own notifications` | Customers can rewrite notification content, type, and owner-preserving audit history rather than only marking their notifications read. |
| **HIGH** | `db_dump.sql`, `public.customer_rfm_metrics` and `public.customer_intelligence_360`: `security_invoker='off'`; broad view grants | Owner-rights views bypass underlying table RLS. The explicit `WHERE` in `customer_rfm_metrics` currently limits returned customer rows, but this is a fragile, duplicated security boundary. It joins `auth.users` and exposes email and profile intelligence. The dependent view inherits that boundary; an accidental edit can leak everyone. `view_ai_evaluation_stats` is likewise an owner-rights, broadly granted view of internal evaluations. |
| **HIGH** | `db_dump.sql`, `public.generate_order_number()` and `public.trg_set_order_number()` | `MAX(...) + 1` races: concurrent inserts pick the same value and one fails on the unique constraint. Large numeric suffixes can overflow the `INTEGER` cast. Direct callers also receive a number without reserving it. |
| **HIGH** | `20260512000001_reverse_lifecycle_integrity.sql`, `public.process_referral_reversal` | “Check for any reversal, then insert” is a TOCTOU race, and one existing reversal suppresses reversal of **all other earned entries** for an order. Subsequent earned entries are never reversed. The function is a public-default-executable `SECURITY DEFINER` unless separately revoked. |
| **HIGH** | `db_dump.sql`, `public.trg_update_customer_stats()`; `20260512000001_reverse_lifecycle_integrity.sql`, same function | The dump contains the **older** implementation: it does not recalculate when an order leaves `delivered`, is deleted, changes customer, or has its delivered `total` edited. Concurrent per-customer order transitions can overwrite aggregate figures from inconsistent snapshots. The later migration fixes only the first case. |
| **HIGH** | `20260616044950_admin_coupons_rpc.sql`, `public.admin_generate_dedicated_coupon`: `WHERE user_id = auth.uid()` | `admin_users` has `id`, not `user_id`. Calls fail with an undefined-column error. Once corrected, missing bounds permit nonsensical discount values and validity periods; default function execution also needs revocation. |
| **HIGH** | `db_dump.sql`, `public.can_user_spin(uuid)` and `public.wheel_attempts`, `Users can insert their own attempts` | Checking the last spin and inserting an attempt are separate operations. Concurrent requests can both pass. `can_user_spin` also answers questions about arbitrary supplied users under definer privileges; an attempt can nominate an arbitrary `prize_id` and `result_data`. |
| **HIGH** | `db_dump.sql`, `public.match_knowledge`, `SECURITY DEFINER`, public execute | The function bypasses knowledge-table RLS and returns `content`; future private/inactive-category handling could leak through it. Unbounded `match_count` and untrusted vectors are also a resource-exhaustion surface. |
| **MEDIUM** | `20260926130000_atomic_order_fulfillment.sql`, conversion-event `DELETE` then unique-index creation | Within a normal transactional migration, the deletion and index creation are atomic, but concurrent external writers may block or make creation fail. The index deduplicates only non-NULL text `metadata->>'order_id'`; arbitrary clients can preinsert `payment_completed` with a victim order ID, causing the genuine event’s `ON CONFLICT DO NOTHING` to suppress it. |
| **MEDIUM** | `db_dump.sql`, `public.products` / `public.product_variants`; `20260902190000_atomic_stock_decrement.sql` | Stock checks permit `NULL` (`CHECK (stock >= 0)` passes UNKNOWN), while prices, discounts, `sold_count`, and numerous counts lack nonnegative checks. Variant-to-product consistency is not checked in the stock function. Locking individual inventory rows prevents some oversells, but unsorted multi-item locks can deadlock. |
| **MEDIUM** | `db_dump.sql`, `public.orders` address FKs and `public.order_items` | A shipping/billing address FK proves that the address exists, **not that it belongs to the order customer**. `order_items.variant_id` does not prove that the variant belongs to `product_id`. Order JSON and relational items can diverge. |
| **MEDIUM** | `db_dump.sql`, `public.coupons`, `public.flash_deals` | There is no complete database-enforced coupon redemption or flash-deal sale transaction. `max_uses`, dates, dedicated ownership, `max_qty`, and `sold_count` are not sufficient constraints without a single locked/conditional reservation operation. |
| **MEDIUM** | `20260609000000_jwt_custom_claims_rbac.sql`, `public.sync_admin_role_to_jwt`, `public.is_admin` | JWT claims may remain stale until refresh. The trigger writes claims from `admin_users`, so the unrestricted admin-table write above becomes JWT elevation. The `app_metadata` claim—not `raw_user_meta_data`—is the appropriate class of claim, but do not use a stale token alone to authorize irreversible actions. |
| **MEDIUM** | `db_dump.sql`, default privileges: `ALTER DEFAULT PRIVILEGES ... GRANT ALL ON TABLES/FUNCTIONS TO "anon", "authenticated"` | Each new migration-created object becomes API-accessible by default. RLS may reduce table access; it does not rescue an unguarded `SECURITY DEFINER` function. |
| **LOW–MEDIUM** | `db_dump.sql`, duplicate indexes including `idx_orders_order_number` beside `orders_order_number_key`, and `idx_loyalty_points_customer` beside the left prefix of `idx_loyalty_points_created` | Extra indexes increase write amplification and lock/maintenance cost. Measure workload before removal. |
| **LOW** | `db_dump.sql`, `public.customer_rfm_metrics`: `COALESCE(recency_days,365)` followed by a dependent-view test `recency_days IS NULL` | The “Prospecto” branch in `customer_intelligence_360` is unreachable. The RFM view also includes non-cancelled but potentially unpaid orders in monetary totals. |

### Important concurrency distinction

`SELECT ... FOR UPDATE` in `fulfill_order_payment` is **not a broken lock**. At `READ COMMITTED`, competing calls for the *same order through that RPC* serialize; a successfully committed first `paid` transition prevents the second RPC from decrementing stock again. Its limitations are competing write paths, untrusted inputs, incomplete items, and business-state validation. Do not describe this implementation as intrinsically “double-decrementing on duplicate webhooks.”

## Immediate containment migration

Apply **before** exposing another API request. Run as the schema owner, in a controlled maintenance window. This deliberately disables unsafe customer checkout writes: deploy a server-authoritative checkout endpoint before restoring checkout.

```sql
BEGIN;

-- A policy on a table with RLS disabled is not protection.
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow authenticated to read admin_users"
    ON public.admin_users;
DROP POLICY IF EXISTS "Admins can read admin_users"
    ON public.admin_users;
CREATE POLICY admin_users_read_self ON public.admin_users
    FOR SELECT TO authenticated
    USING (id = auth.uid());

REVOKE ALL ON public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, role) ON public.admin_users TO authenticated;

-- Do not permit clients to author payment/order/loyalty facts.
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own coupon usage"
    ON public.customer_coupons;
DROP POLICY IF EXISTS "Users can insert their own attempts"
    ON public.wheel_attempts;
DROP POLICY IF EXISTS "Users can update (claim) their own propositions"
    ON public.smart_loyalty_propositions;

REVOKE INSERT, UPDATE, DELETE ON public.orders, public.order_items,
    public.customer_coupons, public.wheel_attempts,
    public.smart_loyalty_propositions
    FROM anon, authenticated;

-- Customer-editable fields must be an explicit allowlist.
REVOKE INSERT, UPDATE, DELETE ON public.customer_profiles
    FROM anon, authenticated;
GRANT UPDATE (full_name, phone, whatsapp, birthdate,
              favorite_category_id, avatar_url, ai_preferences)
    ON public.customer_profiles TO authenticated;
DROP POLICY IF EXISTS "Users can insert own profile"
    ON public.customer_profiles;
-- Auth registration's owner-run handle_new_auth_user() remains responsible
-- for creating profiles.

REVOKE UPDATE ON public.user_notifications FROM anon, authenticated;
GRANT UPDATE (is_read) ON public.user_notifications TO authenticated;

-- Eliminate public definer-function execution, including PostgreSQL's
-- implicit PUBLIC EXECUTE privilege.
REVOKE ALL ON FUNCTION public.process_loyalty_points
    (uuid, integer, character varying, text, uuid)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_coupon_uses(text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rename_product_tag(text, text, text)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_admin_loyalty_stats()
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.can_user_spin(uuid)
    FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_order_number()
    FROM PUBLIC, anon, authenticated;

-- Apply conditionally because these functions are in migrations after
-- the supplied dump, not in that dump itself.
DO $$
BEGIN
  IF to_regprocedure('public.decrement_stock_for_order(jsonb)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.decrement_stock_for_order(jsonb)
             FROM PUBLIC, anon, authenticated';
  END IF;
  IF to_regprocedure('public.apply_wheel_prize_points(uuid,integer,text)')
     IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION
             public.apply_wheel_prize_points(uuid,integer,text)
             FROM PUBLIC, anon, authenticated';
  END IF;
  IF to_regprocedure('public.process_referral_reversal(uuid,uuid)')
     IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION
             public.process_referral_reversal(uuid,uuid)
             FROM PUBLIC, anon, authenticated';
  END IF;
  IF to_regprocedure(
       'public.admin_generate_dedicated_coupon(uuid,numeric,text,numeric,integer)'
     ) IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION
             public.admin_generate_dedicated_coupon
             (uuid,numeric,text,numeric,integer)
             FROM PUBLIC, anon, authenticated';
  END IF;
END $$;

-- Stop public reads of operational/private rows.
DROP POLICY IF EXISTS "Public settings are visible to everyone"
    ON public.store_settings;
REVOKE SELECT ON public.store_settings FROM anon, authenticated;
DROP POLICY IF EXISTS "Admins can view all pilot feedback"
    ON public.cesarin_pilot_feedback;
DROP POLICY IF EXISTS "Admins can insert pilot feedback"
    ON public.cesarin_pilot_feedback;
DROP POLICY IF EXISTS "Enable insert for service role"
    ON public.ai_simulation_reports;
DROP POLICY IF EXISTS "Enable read access for authenticated users"
    ON public.ai_simulation_reports;
DROP POLICY IF EXISTS "operator_actions_insert_auth"
    ON public.cesarin_operator_actions;
DROP POLICY IF EXISTS "operator_actions_select_auth"
    ON public.cesarin_operator_actions;
DROP POLICY IF EXISTS "signal_states_insert_auth"
    ON public.cesarin_signal_states;
DROP POLICY IF EXISTS "signal_states_select_auth"
    ON public.cesarin_signal_states;
DROP POLICY IF EXISTS "signal_states_update_auth"
    ON public.cesarin_signal_states;

REVOKE ALL ON public.cesarin_pilot_feedback,
    public.ai_simulation_reports, public.cesarin_operator_actions,
    public.cesarin_signal_states
    FROM anon, authenticated;

-- Prevent public event poisoning; conversion events must be server-written.
DROP POLICY IF EXISTS "conversation_conversion_events_insert_anon"
    ON public.conversation_conversion_events;
DROP POLICY IF EXISTS "conversation_conversion_events_insert_authenticated"
    ON public.conversation_conversion_events;
REVOKE INSERT ON public.conversation_conversion_events
    FROM anon, authenticated;

-- Do not auto-publish newly created API objects.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    REVOKE ALL ON SEQUENCES FROM anon, authenticated;

COMMIT;
```

**Qualification:** `REVOKE UPDATE` on a table with pre-existing column grants must be verified against the live ACL; likewise, schema owners and `service_role` can bypass these API controls. Do not put a service key in browsers. Existing `GRANT ALL` statements in the dump must not be replayed after this migration.

## Required replacement for stock decrement

Replace the September stock routine with this version. It validates the input, aggregates repeated SKUs, uses a deterministic lock order, checks variant/product correspondence, and rejects shortages. Keep execution restricted to the trusted fulfillment role.

```sql
BEGIN;

CREATE OR REPLACE FUNCTION public.decrement_stock_for_order(p_items jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    r record;
    v_changed integer;
BEGIN
    IF p_items IS NULL
       OR jsonb_typeof(p_items) <> 'array'
       OR jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION 'Nonempty item array required'
            USING ERRCODE = '22023';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM jsonb_array_elements(p_items) AS e(value)
        WHERE jsonb_typeof(e.value) <> 'object'
           OR jsonb_typeof(e.value->'product_id') <> 'string'
           OR jsonb_typeof(e.value->'quantity') <> 'number'
           OR (e.value->>'quantity') !~ '^[1-9][0-9]*$'
           OR ((e.value->>'quantity')::numeric > 2147483647)
           OR (e.value ? 'variant_id'
               AND e.value->'variant_id' <> 'null'::jsonb
               AND jsonb_typeof(e.value->'variant_id') <> 'string')
    ) THEN
        RAISE EXCEPTION 'Invalid stock item'
            USING ERRCODE = '22023';
    END IF;

    -- Validate casts, aggregate duplicate targets, then lock/update in
    -- one stable global order. Invalid UUIDs fail the transaction.
    FOR r IN
        SELECT x.product_id, x.variant_id, sum(x.quantity)::bigint AS qty
        FROM jsonb_to_recordset(p_items)
             AS x(product_id uuid, variant_id uuid, quantity integer)
        GROUP BY x.product_id, x.variant_id
        ORDER BY x.product_id, x.variant_id NULLS FIRST
    LOOP
        IF r.product_id IS NULL OR r.qty < 1 OR r.qty > 2147483647 THEN
            RAISE EXCEPTION 'Invalid item quantity or product'
                USING ERRCODE = '22023';
        END IF;

        IF r.variant_id IS NULL THEN
            UPDATE public.products AS p
               SET stock = p.stock - r.qty::integer
             WHERE p.id = r.product_id
               AND p.stock IS NOT NULL
               AND p.stock >= r.qty;
        ELSE
            UPDATE public.product_variants AS v
               SET stock = v.stock - r.qty::integer
             WHERE v.id = r.variant_id
               AND v.product_id = r.product_id
               AND v.stock IS NOT NULL
               AND v.stock >= r.qty;
        END IF;

        GET DIAGNOSTICS v_changed = ROW_COUNT;
        IF v_changed <> 1 THEN
            RAISE EXCEPTION
                'Missing SKU, mismatched variant, or insufficient stock'
                USING ERRCODE = '23514';
        END IF;
    END LOOP;

    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_stock_for_order(jsonb)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock_for_order(jsonb)
    TO service_role;

COMMIT;
```

The order here is deterministic *for calls to this function*. Any other inventory writer must use compatible ordering or tolerate and retry PostgreSQL deadlock error `40P01`. **Never** “fix” a stock failure by committing `payment_status = 'paid'` and decrementing later.

## Required payment and checkout redesign

The following are inseparable production requirements; SQL grants alone cannot prove a Mercado Pago payment:

1. A trusted backend must retrieve the payment directly from Mercado Pago, verify its status, amount, currency, merchant/collector, order reference, and payment ID, and authenticate webhook delivery. Do not treat `p_payment_status` or `p_mp_payment_data` supplied to an exposed RPC as provider evidence.
2. A trusted checkout transaction must load current product/variant prices and eligibility, calculate subtotal/shipping/discount/total in exact decimal units, validate address ownership and coupon eligibility, persist the canonical immutable order lines, and reserve inventory or use an explicitly designed pay-time allocation policy.
3. The webhook transaction must require a complete canonical item set, reject cancelled/refunded orders and mismatched payment IDs, use a valid transition matrix, decrement stock exactly once, and create an idempotent provider/payment event. A successful provider payment with insufficient stock needs an explicit **refund/manual-exception workflow**, not a false assumption that retrying will create stock.
4. Prevent *all other* API paths—including “admin full access” policies—from directly changing protected payment, stock, and fulfillment columns. Route controlled administrative transitions through audited procedures.

At minimum, add constraints **after identifying and cleaning violating legacy data**:

```sql
ALTER TABLE public.orders
    ADD CONSTRAINT orders_money_valid CHECK (
        subtotal >= 0
        AND shipping_cost IS NOT NULL AND shipping_cost >= 0
        AND discount IS NOT NULL AND discount >= 0
        AND total >= 0
        AND total = subtotal + shipping_cost - discount
    ),
    ADD CONSTRAINT orders_items_array CHECK (
        jsonb_typeof(items) = 'array'
        AND jsonb_array_length(items) > 0
    );

ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_price_nonnegative CHECK (price >= 0);

ALTER TABLE public.loyalty_points
    ADD CONSTRAINT loyalty_points_positive CHECK (points > 0);

ALTER TABLE public.products
    ADD CONSTRAINT products_price_nonnegative CHECK (price >= 0),
    ADD CONSTRAINT products_stock_required CHECK (stock IS NOT NULL AND stock >= 0);

ALTER TABLE public.product_variants
    ADD CONSTRAINT variants_values_valid CHECK (
        stock IS NOT NULL AND stock >= 0
        AND (price IS NULL OR price >= 0)
    );

ALTER TABLE public.coupons
    ADD CONSTRAINT coupons_values_valid CHECK (
        discount_value > 0
        AND (discount_type <> 'percentage' OR discount_value <= 100)
        AND min_purchase IS NOT NULL AND min_purchase >= 0
        AND used_count IS NOT NULL AND used_count >= 0
        AND (max_uses IS NULL OR
             (max_uses > 0 AND used_count <= max_uses))
        AND (valid_until IS NULL OR valid_from < valid_until)
    );

ALTER TABLE public.flash_deals
    ADD CONSTRAINT flash_deals_sold_count_valid CHECK (
        sold_count >= 0 AND sold_count <= max_qty
    );
```

These checks reject many invalid values; they **do not** establish that a customer paid the right amount. `NUMERIC(10,2)` is suitable for exact stored currency amounts if each operation has an explicit rounding rule. Integer centavos is another valid design. Neither representation fixes client-authoritative prices.

## Coupon redemption must be one transaction

The current `increment_coupon_uses` function should stay inaccessible. Replace the split client “check / increment / insert usage” flow with a single trusted transaction using a conditional `UPDATE ... RETURNING`, followed by insertion of a uniquely identified redemption. If `20260616044950_admin_coupons_rpc.sql` ran, `coupons.customer_id` exists; confirm that column before deploying this SQL.

```sql
BEGIN;

-- First reconcile historical duplicate redemptions for the same order/code.
CREATE UNIQUE INDEX IF NOT EXISTS customer_coupons_one_per_order_code
    ON public.customer_coupons (order_id, coupon_code)
    WHERE order_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.redeem_coupon_for_order(
    p_order_id uuid,
    p_code text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    v_order public.orders%ROWTYPE;
BEGIN
    SELECT * INTO v_order
      FROM public.orders
     WHERE id = p_order_id
     FOR UPDATE;

    IF NOT FOUND OR v_order.customer_id IS NULL
       OR v_order.status <> 'pending'
       OR v_order.payment_status <> 'pending' THEN
        RAISE EXCEPTION 'Order is not eligible for coupon redemption'
            USING ERRCODE = '23514';
    END IF;

    IF EXISTS (
        SELECT 1 FROM public.customer_coupons
         WHERE order_id = p_order_id AND coupon_code = p_code
    ) THEN
        RAISE EXCEPTION 'Coupon already redeemed for this order'
            USING ERRCODE = '23505';
    END IF;

    UPDATE public.coupons AS c
       SET used_count = c.used_count + 1
     WHERE c.code = p_code
       AND c.is_active IS TRUE
       AND c.valid_from <= now()
       AND (c.valid_until IS NULL OR c.valid_until > now())
       AND (c.max_uses IS NULL OR c.used_count < c.max_uses)
       AND (c.customer_id IS NULL OR
            c.customer_id = v_order.customer_id)
       AND c.min_purchase <= v_order.subtotal;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Coupon invalid or exhausted'
            USING ERRCODE = '23514';
    END IF;

    INSERT INTO public.customer_coupons
        (customer_id, coupon_code, order_id)
    VALUES (v_order.customer_id, p_code, p_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_coupon_for_order(uuid,text)
    FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_coupon_for_order(uuid,text)
    TO service_role;

COMMIT;
```

**Do not use this function by itself as the final checkout:** it records redemption but does not apply or authoritatively calculate the order discount. Call it within the same server-controlled order-pricing transaction; cancellation/refund rules must specify whether usage is released.

## Further remediation, in dependency order

1. **Inspect actual ACLs and RLS immediately.** The unrestricted `admin_users` exposure warrants incident response: review role changes, orders, discounts, loyalty entries, audit events, and service-key access; rotate compromised credentials. PostgreSQL logs may be needed because mutable tables cannot prove their own history.
2. **Remove `viewer` write authority.** Replace membership-only write-policy checks with a database-current check requiring `role IN ('admin','super_admin')`. Do not apply a search-and-replace to SELECT policies: viewers may legitimately need read access. The cancellation RPC must likewise reject `viewer`.
3. **Fix `admin_generate_dedicated_coupon`.** Change its `admin_users.user_id` predicate to `admin_users.id`, require a non-viewer admin, validate percentage/fixed bounds and `p_valid_days`, set a safe search path, and explicitly restrict execution.
4. **Rebuild loyalty as an idempotent ledger.** Rewards need a unique source identifier per earn, spend, reversal, and wheel attempt. Lock a per-customer balance or use conditional balance updates to prevent concurrent overspend. A reversal must target each original earn once; the existing description-prefix check is not a key. Only verified payment/order transitions or trusted, audited administration may create entries.
5. **Replace wheel “check then insert.”** Make eligibility check, prize selection, attempt insertion, and points issuance one trusted transaction under a per-customer lock or enforce a suitable uniqueness/reservation model. Never accept a client-nominated prize as proof.
6. **Replace `MAX(order_number)` with a sequence.** Backfill its starting value from validated existing numbers, reserve numbers with `nextval` in the insert trigger, and retain the unique constraint. Sequences can have gaps; they provide uniqueness, not gapless legal invoice numbering.
7. **Repair customer stats.** Recalculate on insert, delete, customer reassignment, delivered-status changes, and delivered-total changes; serialize recalculation per customer or use a carefully designed incremental aggregate. Derive tier consistently from one documented rule—the dump’s `calculate_tier` and migration’s configurable tier logic currently compete.
8. **Narrow data exposure.** Publish a safe settings view containing only storefront fields; restrict the base settings table. Replace owner-rights customer-intelligence views with carefully tested `security_invoker` views or admin-only server access. Restrict `get_admin_loyalty_stats`, evaluation stats, knowledge retrieval, logs, analytics, and pilot reports to their actual audience.
9. **Add relational integrity.** Validate that address IDs belong to the order customer; that each variant belongs to its order-line product; that active products’ categories/variants are appropriate; and that JSON order snapshots agree with canonical lines. A plain FK to `addresses(id)` cannot establish ownership.
10. **Add indexes driven by real paths.** In particular, verify a live `orders(mp_payment_id)` / `orders(mp_preference_id)` lookup index and `order_items(order_id)`; inspect the live schema because the earlier migration’s preference index is absent from the supplied dump. Benchmark before removing duplicate indexes.
11. **Regression-test permissions as actual `anon`, `authenticated`, `viewer`, admin, and service sessions**, including two simultaneous transactions for coupon redemption, stock depletion, the same webhook, different-item lock order, loyalty spending, and wheel attempts. Verify that no client can update payment, tier, stock, discount, provider IDs, or audit outcomes directly.

**Bottom line:** the immediate RLS/ACL and privileged-function defects are exploitable independently of webhook concurrency. Fix administrator takeover and arbitrary financial writes first; then build one server-authoritative, idempotent checkout-to-payment-to-fulfillment path.

---
*Auditoría generada por Sol Pro Batch vía Antigravity Orchestrator.*
