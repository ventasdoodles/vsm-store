


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "public";






CREATE TYPE "public"."product_status" AS ENUM (
    'active',
    'legacy',
    'discontinued',
    'coming_soon'
);


ALTER TYPE "public"."product_status" OWNER TO "postgres";


CREATE TYPE "public"."section_type" AS ENUM (
    'vape',
    '420'
);


ALTER TYPE "public"."section_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_tier"("spent" numeric) RETURNS "text"
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
BEGIN
    RETURN CASE
        WHEN spent >= 50000 THEN 'platinum'
        WHEN spent >= 20000 THEN 'gold'
        WHEN spent >= 5000  THEN 'silver'
        ELSE 'bronze'
    END;
END;
$$;


ALTER FUNCTION "public"."calculate_tier"("spent" numeric) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_user_spin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    last_spin TIMESTAMPTZ;
BEGIN
    SELECT created_at INTO last_spin
    FROM public.wheel_attempts
    WHERE customer_id = user_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF last_spin IS NULL OR last_spin < (now() - interval '24 hours') THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;


ALTER FUNCTION "public"."can_user_spin"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cancel_admin_unpaid_order_with_audit"("p_order_id" "uuid", "p_reason" "text") RETURNS TABLE("id" "uuid")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
DECLARE
    v_actor_user_id UUID;
    v_actor_role TEXT;
    v_actor_label TEXT;
    v_reason TEXT;
    v_stamp TIMESTAMPTZ;
    v_stamp_label TEXT;
    v_internal_note TEXT;
    v_new_tracking_notes TEXT;
    v_order RECORD;
    v_updated_order_id UUID;
BEGIN
    v_actor_user_id := auth.uid();
    IF v_actor_user_id IS NULL THEN
        RAISE EXCEPTION 'Authentication required.'
            USING ERRCODE = '28000';
    END IF;

    SELECT au.role
    INTO v_actor_role
    FROM public.admin_users au
    WHERE au.id = v_actor_user_id;

    IF v_actor_role IS NULL THEN
        RAISE EXCEPTION 'Admin privileges required.'
            USING ERRCODE = '42501';
    END IF;

    v_reason := btrim(COALESCE(p_reason, ''));
    IF char_length(v_reason) < 5 THEN
        RAISE EXCEPTION 'Cancellation reason must have at least 5 characters.'
            USING ERRCODE = '22023';
    END IF;

    SELECT
        o.id,
        o.status,
        o.payment_status,
        o.payment_method,
        o.tracking_notes
    INTO v_order
    FROM public.orders o
    WHERE o.id = p_order_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order % not found.', p_order_id
            USING ERRCODE = 'P0002';
    END IF;

    IF v_order.status NOT IN ('pending', 'confirmed', 'processing') THEN
        RAISE EXCEPTION 'Order is no longer eligible for unpaid cancellation.'
            USING ERRCODE = 'P0001';
    END IF;

    IF v_order.payment_status = 'paid' THEN
        RAISE EXCEPTION 'Paid orders cannot be cancelled by this RPC.'
            USING ERRCODE = 'P0001';
    END IF;

    v_stamp := now();
    v_stamp_label := to_char(
        v_stamp AT TIME ZONE 'UTC',
        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
    );
    v_internal_note := '[Cancelado ' || v_stamp_label || ']: ' || v_reason;

    v_new_tracking_notes := CASE
        WHEN NULLIF(btrim(COALESCE(v_order.tracking_notes, '')), '') IS NULL
            THEN v_internal_note
        ELSE v_order.tracking_notes || E'\n\n' || v_internal_note
    END;

    UPDATE public.orders
    SET
        status = 'cancelled',
        tracking_notes = v_new_tracking_notes,
        updated_at = v_stamp
    WHERE orders.id = p_order_id
    RETURNING orders.id INTO v_updated_order_id;

    v_actor_label := NULLIF(auth.jwt() ->> 'email', '');

    INSERT INTO public.order_admin_events (
        order_id,
        actor_user_id,
        actor_role,
        actor_label,
        event_type,
        source,
        visibility,
        status_before,
        status_after,
        payment_status_before,
        payment_status_after,
        payment_method,
        reason,
        internal_note,
        customer_note,
        provider_name,
        provider_action,
        provider_execution_status,
        provider_payment_id,
        provider_refund_id,
        provider_event_id,
        refund_amount,
        refund_currency,
        idempotency_key,
        metadata,
        created_at
    )
    VALUES (
        p_order_id,
        v_actor_user_id,
        v_actor_role,
        v_actor_label,
        'admin_unpaid_order_cancelled',
        'admin_rpc',
        'internal',
        v_order.status,
        'cancelled',
        v_order.payment_status,
        v_order.payment_status,
        v_order.payment_method,
        v_reason,
        v_internal_note,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        'admin_unpaid_order_cancelled:' || p_order_id::TEXT,
        jsonb_build_object(
            'rpc_version', 'cancel_admin_unpaid_order_with_audit:v1',
            'tracking_notes_source', 'latest_db_value',
            'had_tracking_notes_before', NULLIF(btrim(COALESCE(v_order.tracking_notes, '')), '') IS NOT NULL
        ),
        v_stamp
    );

    RETURN QUERY SELECT v_updated_order_id;
END;
$$;


ALTER FUNCTION "public"."cancel_admin_unpaid_order_with_audit"("p_order_id" "uuid", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cancel_admin_unpaid_order_with_audit"("p_order_id" "uuid", "p_reason" "text") IS 'Atomically cancels an eligible unpaid order, preserves tracking_notes behavior, and appends one internal order_admin_events audit row. Does not execute refunds or provider calls.';



CREATE OR REPLACE FUNCTION "public"."generate_order_number"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $_$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(
        CASE 
            WHEN substring(order_number FROM 5) ~ '^[0-9]+$' 
            THEN CAST(substring(order_number FROM 5) AS INTEGER)
            ELSE 0 
        END
    ), 0) + 1
    INTO next_num
    FROM orders;

    RETURN 'VSM-' || LPAD(next_num::TEXT, 4, '0');
END;
$_$;


ALTER FUNCTION "public"."generate_order_number"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."generate_order_number"() IS 'Genera números de orden secuenciales ignorando registros con sufijos alfanuméricos (Rescue/Manual)';



CREATE OR REPLACE FUNCTION "public"."get_admin_loyalty_stats"() RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    today_start TIMESTAMPTZ := date_trunc('day', timezone('America/Mexico_City', now()));
    puntos_hoy INTEGER;
    ultimo_canje JSON;
    top_usuarios JSON;
BEGIN
    -- 1. Puntos emitidos hoy
    SELECT COALESCE(SUM(points), 0) INTO puntos_hoy
    FROM loyalty_points
    WHERE transaction_type = 'earned' 
      AND created_at >= today_start;

    -- 2. Última vez canjeado
    SELECT row_to_json(t) INTO ultimo_canje
    FROM (
        SELECT lp.created_at, cp.full_name, lp.points
        FROM loyalty_points lp
        JOIN customer_profiles cp ON lp.customer_id = cp.id
        WHERE lp.transaction_type = 'spent'
        ORDER BY lp.created_at DESC
        LIMIT 1
    ) t;

    -- 3. Top 3 Usuarios con más puntos (balance real)
    -- Calculamos agrupadamente desde loyalty_points para mayor velocidad
    SELECT json_agg(row_to_json(tops)) INTO top_usuarios
    FROM (
        SELECT 
            cp.id,
            cp.full_name,
            SUM(
                CASE 
                    WHEN lp.transaction_type = 'earned' THEN lp.points
                    WHEN lp.transaction_type IN ('spent', 'expired') THEN -lp.points
                    ELSE 0
                END
            ) as balance
        FROM customer_profiles cp
        JOIN loyalty_points lp ON cp.id = lp.customer_id
        GROUP BY cp.id, cp.full_name
        HAVING SUM(
            CASE 
                WHEN lp.transaction_type = 'earned' THEN lp.points
                WHEN lp.transaction_type IN ('spent', 'expired') THEN -lp.points
                ELSE 0
            END
        ) > 0
        ORDER BY balance DESC
        LIMIT 3
    ) tops;

    RETURN json_build_object(
        'puntos_hoy', puntos_hoy,
        'ultimo_canje', COALESCE(ultimo_canje, '{}'::json),
        'top_usuarios', COALESCE(top_usuarios, '[]'::json)
    );
END;
$$;


ALTER FUNCTION "public"."get_admin_loyalty_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_customer_points_balance"("p_customer_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" STABLE
    AS $$
DECLARE
    balance INTEGER;
BEGIN
    SELECT COALESCE(SUM(
        CASE
            WHEN transaction_type = 'earned' THEN points
            WHEN transaction_type = 'spent' THEN -points
            WHEN transaction_type = 'expired' THEN -points
            ELSE 0
        END
    ), 0)
    INTO balance
    FROM loyalty_points
    WHERE customer_id = p_customer_id;

    RETURN balance;
END;
$$;


ALTER FUNCTION "public"."get_customer_points_balance"("p_customer_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_cesarin_signal_states_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."handle_cesarin_signal_states_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_improvement_item_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."handle_improvement_item_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.customer_profiles (
    id,
    full_name,
    phone,
    whatsapp,
    customer_tier,
    total_orders,
    total_spent
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'phone',
    'bronze',
    0,
    0
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_auth_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_operator_case_drafts_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."handle_operator_case_drafts_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_store_knowledge_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
    new.updated_at = now();
    return new;
end;
$$;


ALTER FUNCTION "public"."handle_store_knowledge_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_coupon_uses"("target_coupon_code" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE coupons
    SET used_count = used_count + 1
    WHERE code = target_coupon_code;
END;
$$;


ALTER FUNCTION "public"."increment_coupon_uses"("target_coupon_code" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."increment_coupon_uses"("target_coupon_code" "text") IS 'Incrementa atómicamente el contador de usos de un cupón usando su código.';



CREATE OR REPLACE FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "match_threshold" double precision DEFAULT 0.70, "match_count" integer DEFAULT 3, "filter_category" "text" DEFAULT NULL::"text") RETURNS TABLE("id" "uuid", "title" "text", "content" "text", "category" "text", "source_id" "text", "similarity" double precision)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
    return query
    select
        k.id,
        k.title,
        k.content,
        k.category,
        k.source_id,
        1 - (k.embedding <=> query_embedding) as similarity
    from public.store_knowledge k
    where k.is_active = true
      and k.embedding is not null
      and 1 - (k.embedding <=> query_embedding) > match_threshold
      and (filter_category is null or k.category = filter_category)
    order by k.embedding <=> query_embedding
    limit match_count;
end;
$$;


ALTER FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "filter_category" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_products"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "min_stock" integer DEFAULT 0) RETURNS TABLE("id" "uuid", "name" "text", "slug" "text", "description" "text", "price" numeric, "cover_image" "text", "section" "text", "similarity" double precision, "ai_sales_note" "text", "specs" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
begin
  return query
  select
    p.id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.cover_image,
    p.section::text as section,
    1 - (p.embedding <=> query_embedding) as similarity,
    p.ai_sales_note,
    p.specs
  from public.products p
  where p.embedding is not null
    and 1 - (p.embedding <=> query_embedding) > match_threshold
    and p.stock >= min_stock
    and p.status = 'active'
  order by p.embedding <=> query_embedding
  limit match_count;
end;
$$;


ALTER FUNCTION "public"."match_products"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "min_stock" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_loyalty_points"("p_user_id" "uuid", "p_amount" integer, "p_type" character varying, "p_description" "text", "p_order_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- 1. Insertar el historial (bypasseando RLS porque la funciona corre con SECURITY DEFINER)
    INSERT INTO loyalty_points (customer_id, points, transaction_type, description, order_id, created_at)
    VALUES (p_user_id, p_amount, p_type, p_description, p_order_id, NOW());

    -- Termina exitosamente
END;
$$;


ALTER FUNCTION "public"."process_loyalty_points"("p_user_id" "uuid", "p_amount" integer, "p_type" character varying, "p_description" "text", "p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rename_product_tag"("old_name" "text", "new_name" "text", "new_label" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Actualizar todos los productos que tienen el tag viejo
  UPDATE public.products
  SET tags = array_replace(tags, old_name, new_name)
  WHERE old_name = ANY(tags);

  -- Renombrar en la tabla de referencia (borrar viejo + insertar nuevo)
  DELETE FROM public.product_tags WHERE name = old_name;
  INSERT INTO public.product_tags (name, label)
  VALUES (new_name, new_label)
  ON CONFLICT (name) DO UPDATE SET label = EXCLUDED.label;
END;
$$;


ALTER FUNCTION "public"."rename_product_tag"("old_name" "text", "new_name" "text", "new_label" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_set_order_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_set_order_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."trg_update_customer_stats"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_total_orders INTEGER;
    new_total_spent DECIMAL(10,2);
    new_tier TEXT;
BEGIN
    -- Solo recalcular si la orden se acaba de entregar, o es insert
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.status = 'delivered' AND OLD.status <> 'delivered') THEN
        IF NEW.customer_id IS NOT NULL THEN
            SELECT
                COUNT(*),
                COALESCE(SUM(total), 0)
            INTO new_total_orders, new_total_spent
            FROM orders
            WHERE customer_id = NEW.customer_id
              AND status = 'delivered';

            new_tier := calculate_tier(new_total_spent);

            UPDATE customer_profiles SET
                total_orders = new_total_orders,
                total_spent = new_total_spent,
                customer_tier = new_tier
            WHERE id = NEW.customer_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_update_customer_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_flash_deals_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_flash_deals_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_testimonials_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_testimonials_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."addresses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "type" "text",
    "label" "text",
    "full_name" "text",
    "street" "text" NOT NULL,
    "number" "text" NOT NULL,
    "colony" "text" NOT NULL,
    "city" "text" DEFAULT 'Xalapa'::"text" NOT NULL,
    "state" "text" DEFAULT 'Veracruz'::"text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "phone" "text",
    "notes" "text",
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "references" "text",
    CONSTRAINT "addresses_type_check" CHECK (("type" = ANY (ARRAY['shipping'::"text", 'billing'::"text"])))
);


ALTER TABLE "public"."addresses" OWNER TO "postgres";


COMMENT ON TABLE "public"."addresses" IS 'Direcciones de envío/facturación por cliente';



COMMENT ON COLUMN "public"."addresses"."references" IS 'Referencias adicionales para la ubicación (entre calles, color de casa, etc)';



CREATE TABLE IF NOT EXISTS "public"."admin_customer_notes" (
    "customer_id" "uuid" NOT NULL,
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "custom_fields" "jsonb" DEFAULT '{}'::"jsonb",
    "notes" "text",
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."admin_customer_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'admin'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_users_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'super_admin'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_analytics" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "session_id" "text",
    "query" "text",
    "detected_intent" "text",
    "recommended_product_ids" "uuid"[],
    "to_whatsapp" boolean DEFAULT false,
    "sentiment" "text" DEFAULT 'neutral'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "frustration_detected" boolean DEFAULT false,
    "ai_logic_debug" "jsonb",
    "response_text" "text",
    "primary_intent" "text",
    "current_turn_decision" "text",
    "turn_focus" "text",
    "catalog_gate_open" boolean,
    "catalog_gate_reason" "text",
    "next_step_family" "text",
    "assist_action_present" boolean,
    "source_context_present" boolean,
    "retrieval_source" "text"
);


ALTER TABLE "public"."ai_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_configs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "key" "text" NOT NULL,
    "name" "text" DEFAULT 'Cesarin'::"text",
    "voice_tone" "text" DEFAULT 'Asesor experto, vibrante y profesional'::"text",
    "behavior_mode" "text" DEFAULT 'vendedor'::"text",
    "welcome_message" "text" DEFAULT '¡Hola! Soy Cesarin, tu asistente de VSM. ¿En qué puedo ayudarte hoy?'::"text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "temperature" numeric DEFAULT 0.7,
    "top_p" numeric DEFAULT 0.9
);


ALTER TABLE "public"."ai_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_customer_memory" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid",
    "detected_interests" "text"[],
    "last_recommendation" "text",
    "frustration_level" integer DEFAULT 0,
    "ticket_average" numeric(10,2) DEFAULT 0,
    "session_count" integer DEFAULT 0,
    "last_interaction_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "interests_metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."ai_customer_memory" OWNER TO "postgres";


COMMENT ON COLUMN "public"."ai_customer_memory"."interests_metadata" IS 'Metadata for interest strength: { term: { hits: number, last_at: string } }';



CREATE TABLE IF NOT EXISTS "public"."ai_evaluations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "analytics_id" "uuid" NOT NULL,
    "score" integer NOT NULL,
    "primary_tag" "text" NOT NULL,
    "secondary_tags" "text"[] DEFAULT '{}'::"text"[],
    "severity" "text" NOT NULL,
    "expected_outcome" "text",
    "comment" "text",
    "evaluator_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_evaluations_score_check" CHECK ((("score" >= 1) AND ("score" <= 5))),
    CONSTRAINT "ai_evaluations_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."ai_evaluations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_intents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "keywords" "text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_intents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_rules" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "config_id" "uuid",
    "category" "text" NOT NULL,
    "content" "text" NOT NULL,
    "priority" integer DEFAULT 0,
    "is_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_simulation_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "total" integer NOT NULL,
    "passed" integer NOT NULL,
    "failed" integer NOT NULL,
    "results" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_simulation_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level" "text" NOT NULL,
    "category" "text" NOT NULL,
    "message" "text" NOT NULL,
    "details" "jsonb",
    "user_id" "uuid",
    "url" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "app_logs_level_check" CHECK (("level" = ANY (ARRAY['info'::"text", 'warn'::"text", 'error'::"text", 'debug'::"text"])))
);


ALTER TABLE "public"."app_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."brands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text",
    "is_active" boolean DEFAULT true,
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."brands" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "section" "public"."section_type" NOT NULL,
    "parent_id" "uuid",
    "description" "text",
    "order_index" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "image_url" "text",
    "is_popular" boolean DEFAULT false
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


COMMENT ON COLUMN "public"."categories"."image_url" IS 'URL de imagen representativa de la categoría (opcional, para menus y banners)';



COMMENT ON COLUMN "public"."categories"."is_popular" IS 'Marca la categoría como popular/trending (muestra badge de llama en tienda)';



CREATE TABLE IF NOT EXISTS "public"."cesarin_improvement_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "analytics_id" "uuid",
    "evaluation_id" "uuid",
    "lane" "text" NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text",
    "severity" "text" DEFAULT 'medium'::"text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "owner_id" "uuid",
    "execution_note" "text",
    "artifact_ref" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source_kind" "text" DEFAULT 'review_interaction'::"text" NOT NULL,
    "intervention_signal_id" "uuid",
    "intervention_recommendation_id" "uuid",
    CONSTRAINT "cesarin_improvement_items_lane_check" CHECK (("lane" = ANY (ARRAY['rule'::"text", 'knowledge'::"text", 'compatibility'::"text", 'commerce'::"text", 'other'::"text"]))),
    CONSTRAINT "cesarin_improvement_items_severity_check" CHECK (("severity" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text", 'critical'::"text"]))),
    CONSTRAINT "cesarin_improvement_items_source_kind_check" CHECK (("source_kind" = ANY (ARRAY['review_interaction'::"text", 'intervention_recommendation'::"text"]))),
    CONSTRAINT "cesarin_improvement_items_source_lineage_check" CHECK (((("source_kind" = 'review_interaction'::"text") AND ("analytics_id" IS NOT NULL)) OR (("source_kind" = 'intervention_recommendation'::"text") AND ("intervention_recommendation_id" IS NOT NULL) AND ("intervention_signal_id" IS NOT NULL)))),
    CONSTRAINT "cesarin_improvement_items_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'in_progress'::"text", 'resolved'::"text", 'wont_fix'::"text"])))
);


ALTER TABLE "public"."cesarin_improvement_items" OWNER TO "postgres";


COMMENT ON COLUMN "public"."cesarin_improvement_items"."source_kind" IS 'Canonical source lineage for the governed operator queue.';



COMMENT ON COLUMN "public"."cesarin_improvement_items"."intervention_recommendation_id" IS 'Persisted link from an approved intervention recommendation into the canonical improvement queue.';



CREATE TABLE IF NOT EXISTS "public"."cesarin_operator_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "actor" "text",
    "action" "text" NOT NULL,
    "module" "text" DEFAULT 'cesarin_os'::"text" NOT NULL,
    "target_ref" "text",
    "detail" "text",
    "outcome" "text",
    "ts" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cesarin_operator_actions" OWNER TO "postgres";


COMMENT ON TABLE "public"."cesarin_operator_actions" IS 'Append-only shared activity log for Cesarin OS operator actions. Captures actor, action, module, target and timestamp for shared operational trust.';



CREATE TABLE IF NOT EXISTS "public"."cesarin_pilot_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "admin_id" "uuid",
    "prompt" "text" NOT NULL,
    "response" "text" NOT NULL,
    "capsule_slug" "text",
    "rating_accuracy" integer,
    "rating_tone" integer,
    "rating_utility" integer,
    "admin_notes" "text",
    "metadata_json" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "cesarin_pilot_feedback_rating_accuracy_check" CHECK ((("rating_accuracy" >= 1) AND ("rating_accuracy" <= 5))),
    CONSTRAINT "cesarin_pilot_feedback_rating_tone_check" CHECK ((("rating_tone" >= 1) AND ("rating_tone" <= 5))),
    CONSTRAINT "cesarin_pilot_feedback_rating_utility_check" CHECK ((("rating_utility" >= 1) AND ("rating_utility" <= 5)))
);


ALTER TABLE "public"."cesarin_pilot_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cesarin_signal_states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "analytics_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "handled_by" "text",
    "handled_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ref_label" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "cesarin_signal_states_status_check" CHECK (("status" = ANY (ARRAY['revisada'::"text", 'descartada'::"text", 'convertida_regla'::"text", 'convertida_mejora'::"text", 'resuelta'::"text"])))
);


ALTER TABLE "public"."cesarin_signal_states" OWNER TO "postgres";


COMMENT ON TABLE "public"."cesarin_signal_states" IS 'Shared operator signal handling decisions for the Cesarin learning surface. Replaces localStorage — allows multiple operators to share signal triage state.';



CREATE TABLE IF NOT EXISTS "public"."collections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "image_url" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compatibility_relations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "concept_a_id" "uuid" NOT NULL,
    "concept_b_id" "uuid" NOT NULL,
    "relation_type" "text" NOT NULL,
    "scope" "text" NOT NULL,
    "status" "text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "compatibility_relations_relation_type_check" CHECK (("relation_type" = ANY (ARRAY['uses_coil'::"text", 'uses_pod'::"text", 'uses_battery'::"text", 'uses_liquid'::"text", 'recommended_for_liquid'::"text", 'has_connector'::"text", 'replaces'::"text"]))),
    CONSTRAINT "compatibility_relations_scope_check" CHECK (("scope" = ANY (ARRAY['specific_model'::"text", 'class_generalization'::"text"]))),
    CONSTRAINT "compatibility_relations_status_check" CHECK (("status" = ANY (ARRAY['confirmed_compatible'::"text", 'confirmed_incompatible'::"text", 'unknown_unconfirmed'::"text"])))
);


ALTER TABLE "public"."compatibility_relations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."concept_aliases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "concept_id" "uuid" NOT NULL,
    "alias" "text" NOT NULL,
    "locale" "text" DEFAULT 'es-MX'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."concept_aliases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conversation_conversion_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "text",
    "event_type" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL
);


ALTER TABLE "public"."conversation_conversion_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."coupons" (
    "code" "text" NOT NULL,
    "description" "text",
    "discount_type" "text",
    "discount_value" numeric(10,2) NOT NULL,
    "min_purchase" numeric(10,2) DEFAULT 0,
    "max_uses" integer,
    "used_count" integer DEFAULT 0,
    "valid_from" timestamp with time zone DEFAULT "now"(),
    "valid_until" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "coupons_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'fixed'::"text"])))
);


ALTER TABLE "public"."coupons" OWNER TO "postgres";


COMMENT ON TABLE "public"."coupons" IS 'Cupones de descuento (porcentaje o monto fijo)';



CREATE TABLE IF NOT EXISTS "public"."customer_coupons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "coupon_code" "text" NOT NULL,
    "order_id" "uuid",
    "used_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_coupons" OWNER TO "postgres";


COMMENT ON TABLE "public"."customer_coupons" IS 'Registro de cupones usados por cada cliente';



CREATE TABLE IF NOT EXISTS "public"."customer_profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text" NOT NULL,
    "phone" "text",
    "whatsapp" "text",
    "birthdate" "date",
    "customer_tier" "text" DEFAULT 'bronze'::"text",
    "total_orders" integer DEFAULT 0,
    "total_spent" numeric(10,2) DEFAULT 0,
    "favorite_category_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "account_status" "text" DEFAULT 'active'::"text",
    "suspension_end" timestamp with time zone,
    "avatar_url" "text",
    "referral_code" "text",
    "ia_context" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "customer_profiles_account_status_check" CHECK (("account_status" = ANY (ARRAY['active'::"text", 'suspended'::"text", 'banned'::"text"]))),
    CONSTRAINT "customer_profiles_customer_tier_check" CHECK (("customer_tier" = ANY (ARRAY['bronze'::"text", 'silver'::"text", 'gold'::"text", 'platinum'::"text"])))
);


ALTER TABLE "public"."customer_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."customer_profiles" IS 'Perfil extendido de clientes, vinculado 1:1 con auth.users';



COMMENT ON COLUMN "public"."customer_profiles"."customer_tier" IS 'bronze < silver < gold < platinum según total_spent';



COMMENT ON COLUMN "public"."customer_profiles"."avatar_url" IS 'URL de la imagen de perfil del usuario (Supabase Storage bucket avatars)';



CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_number" "text" NOT NULL,
    "customer_id" "uuid",
    "items" "jsonb" NOT NULL,
    "subtotal" numeric(10,2) NOT NULL,
    "shipping_cost" numeric(10,2) DEFAULT 0,
    "discount" numeric(10,2) DEFAULT 0,
    "total" numeric(10,2) NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "payment_method" "text",
    "payment_status" "text" DEFAULT 'pending'::"text",
    "shipping_address_id" "uuid",
    "billing_address_id" "uuid",
    "tracking_notes" "text",
    "whatsapp_sent" boolean DEFAULT false,
    "whatsapp_sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "mp_preference_id" "text",
    "mp_payment_id" "text",
    "mp_payment_data" "jsonb",
    "cesarin_session_id" "text",
    "conversion_source" "text",
    "customer_name" "text",
    "customer_phone" "text",
    "delivery_type" "text",
    "shipping_address_snapshot" "jsonb",
    "tracking_number" "text",
    CONSTRAINT "orders_delivery_type_check" CHECK (("delivery_type" = ANY (ARRAY['pickup'::"text", 'delivery'::"text"]))),
    CONSTRAINT "orders_payment_method_check" CHECK (("payment_method" = ANY (ARRAY['whatsapp'::"text", 'mercadopago'::"text", 'cash'::"text", 'transfer'::"text", 'card'::"text"]))),
    CONSTRAINT "orders_payment_status_check" CHECK (("payment_status" = ANY (ARRAY['pending'::"text", 'paid'::"text", 'failed'::"text", 'refunded'::"text"]))),
    CONSTRAINT "orders_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'confirmed'::"text", 'processing'::"text", 'shipped'::"text", 'delivered'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


COMMENT ON TABLE "public"."orders" IS 'Pedidos de la tienda, con items en JSONB';



COMMENT ON COLUMN "public"."orders"."mp_payment_data" IS 'Auditoria completa del objeto payment de Mercado Pago';



COMMENT ON COLUMN "public"."orders"."tracking_number" IS 'Número de guía o rastreo del paquete';



CREATE OR REPLACE VIEW "public"."customer_rfm_metrics" WITH ("security_invoker"='off') AS
 WITH "latest_orders" AS (
         SELECT "orders"."customer_id",
            "max"("orders"."created_at") AS "last_order_date",
            "count"("orders"."id") AS "ord_count",
            "sum"("orders"."total") AS "ord_total"
           FROM "public"."orders"
          WHERE ("orders"."status" <> 'cancelled'::"text")
          GROUP BY "orders"."customer_id"
        )
 SELECT "cp"."id" AS "customer_id",
    "cp"."id",
    "cp"."full_name",
    "cp"."phone" AS "customer_phone",
    "cp"."phone",
    "cp"."whatsapp",
    "cp"."birthdate",
    "cp"."customer_tier",
    "cp"."total_orders",
    "cp"."total_spent",
    "cp"."favorite_category_id",
    "cp"."created_at",
    "cp"."updated_at",
    "cp"."ia_context",
    "cp"."ai_preferences",
    "cp"."account_status",
    "cp"."suspension_end",
    COALESCE("u"."email", 'Sin Email'::character varying) AS "email",
    COALESCE(("u"."raw_user_meta_data" ->> 'avatar_url'::"text"), "cp"."avatar_url") AS "avatar_url",
    COALESCE((EXTRACT(day FROM ("now"() - "lo"."last_order_date")))::integer, 365) AS "recency_days",
    COALESCE("lo"."ord_count", (0)::bigint) AS "frequency",
    COALESCE("lo"."ord_total", (0)::numeric) AS "monetary",
    "lo"."last_order_date"
   FROM (("public"."customer_profiles" "cp"
     LEFT JOIN "auth"."users" "u" ON (("cp"."id" = "u"."id")))
     LEFT JOIN "latest_orders" "lo" ON (("cp"."id" = "lo"."customer_id")))
  WHERE ((EXISTS ( SELECT 1
           FROM "public"."admin_users"
          WHERE ("admin_users"."id" = "auth"."uid"()))) OR ("auth"."uid"() = "cp"."id"));


ALTER VIEW "public"."customer_rfm_metrics" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."customer_intelligence_360" WITH ("security_invoker"='off') AS
 SELECT "customer_id",
    "id",
    "full_name",
    "customer_phone",
    "phone",
    "whatsapp",
    "birthdate",
    "customer_tier",
    "total_orders",
    "total_spent",
    "favorite_category_id",
    "created_at",
    "updated_at",
    "ia_context",
    "ai_preferences",
    "account_status",
    "suspension_end",
    "email",
    "avatar_url",
    "recency_days",
    "frequency",
    "monetary",
    "last_order_date",
        CASE
            WHEN (("recency_days" <= 15) AND ("frequency" >= 3)) THEN 'Campeón'::"text"
            WHEN (("recency_days" <= 30) AND ("frequency" >= 2)) THEN 'Leal'::"text"
            WHEN ("recency_days" > 45) THEN 'En Riesgo'::"text"
            WHEN ("recency_days" IS NULL) THEN 'Prospecto'::"text"
            ELSE 'Regular'::"text"
        END AS "segment",
        CASE
            WHEN ("recency_days" <= 7) THEN 'Saludable'::"text"
            WHEN ("recency_days" <= 30) THEN 'Estable'::"text"
            WHEN ("recency_days" > 30) THEN 'Requiere Atención'::"text"
            ELSE 'Sin Actividad'::"text"
        END AS "health_status"
   FROM "public"."customer_rfm_metrics";


ALTER VIEW "public"."customer_intelligence_360" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_wishlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_wishlists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flash_deals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "flash_price" numeric(10,2) NOT NULL,
    "max_qty" integer DEFAULT 10 NOT NULL,
    "sold_count" integer DEFAULT 0 NOT NULL,
    "starts_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "priority" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "flash_deals_positive_price" CHECK (("flash_price" > (0)::numeric)),
    CONSTRAINT "flash_deals_positive_qty" CHECK (("max_qty" > 0)),
    CONSTRAINT "flash_deals_valid_range" CHECK (("ends_at" > "starts_at"))
);


ALTER TABLE "public"."flash_deals" OWNER TO "postgres";


COMMENT ON TABLE "public"."flash_deals" IS 'Ofertas flash con precio especial, cantidad limitada y timer configurable.';



CREATE TABLE IF NOT EXISTS "public"."intervention_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "signal_id" "uuid" NOT NULL,
    "intervention_type" "text" NOT NULL,
    "rank" integer DEFAULT 1 NOT NULL,
    "diagnosis" "jsonb" NOT NULL,
    "operator_decision" "text" DEFAULT 'pending'::"text",
    "operator_id" "uuid",
    "operator_notes" "text",
    "operator_decision_at" timestamp with time zone,
    "execution_status" "text" DEFAULT 'not_started'::"text",
    "executed_at" timestamp with time zone,
    "validation_date" timestamp with time zone,
    "signal_reduction_percent" integer,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "valid_execution_status" CHECK (("execution_status" = ANY (ARRAY['not_started'::"text", 'in_progress'::"text", 'completed'::"text", 'failed'::"text"]))),
    CONSTRAINT "valid_intervention_type" CHECK (("intervention_type" = ANY (ARRAY['enrichment'::"text", 'compatibility'::"text", 'escalation_playbook'::"text"]))),
    CONSTRAINT "valid_operator_decision" CHECK (("operator_decision" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text", 'deferred'::"text"])))
);


ALTER TABLE "public"."intervention_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."intervention_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "signal_type" "text" NOT NULL,
    "product_id" "uuid",
    "category" "text",
    "evidence_count" integer DEFAULT 1 NOT NULL,
    "evidence_window_days" integer DEFAULT 7 NOT NULL,
    "confidence" "text" DEFAULT 'medium'::"text" NOT NULL,
    "signal_detail" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "first_occurrence_at" timestamp with time zone DEFAULT "now"(),
    "last_occurrence_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'pending'::"text",
    CONSTRAINT "valid_confidence" CHECK (("confidence" = ANY (ARRAY['high'::"text", 'medium'::"text", 'low'::"text"]))),
    CONSTRAINT "valid_signal_type" CHECK (("signal_type" = ANY (ARRAY['enrichment_gap'::"text", 'compatibility_miss'::"text", 'escalation_theme'::"text"]))),
    CONSTRAINT "valid_status" CHECK (("status" = ANY (ARRAY['pending'::"text", 'acknowledged'::"text", 'closed'::"text"])))
);


ALTER TABLE "public"."intervention_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."loyalty_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "points" integer NOT NULL,
    "transaction_type" "text" NOT NULL,
    "description" "text",
    "order_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "loyalty_points_transaction_type_check" CHECK (("transaction_type" = ANY (ARRAY['earned'::"text", 'spent'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."loyalty_points" OWNER TO "postgres";


COMMENT ON TABLE "public"."loyalty_points" IS 'Transacciones del programa de puntos de lealtad';



CREATE TABLE IF NOT EXISTS "public"."operator_case_drafts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_type" "text" NOT NULL,
    "source_ref_id" "text" NOT NULL,
    "source_session_id" "text",
    "source_interaction_id" "uuid",
    "input" "text" NOT NULL,
    "observed_response" "text",
    "evaluation_summary" "text",
    "expected_outcome" "text",
    "route_or_capsule" "text",
    "detected_intent" "text",
    "evaluation_score" integer,
    "failure_reason" "text",
    "readiness_status" "text" DEFAULT 'draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "operator_case_drafts_evaluation_score_check" CHECK ((("evaluation_score" >= 1) AND ("evaluation_score" <= 5))),
    CONSTRAINT "operator_case_drafts_readiness_status_check" CHECK (("readiness_status" = ANY (ARRAY['draft'::"text", 'needs_expected_outcome'::"text", 'ready'::"text"]))),
    CONSTRAINT "operator_case_drafts_source_type_check" CHECK (("source_type" = ANY (ARRAY['review_drawer'::"text", 'qa_simulation'::"text"])))
);


ALTER TABLE "public"."operator_case_drafts" OWNER TO "postgres";


COMMENT ON TABLE "public"."operator_case_drafts" IS 'Operator-created reusable private case drafts sourced from live interactions (ReviewDrawer) or failed QA simulation results (TabQuality). B2 Pass 1.';



CREATE TABLE IF NOT EXISTS "public"."order_admin_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "actor_user_id" "uuid",
    "actor_role" "text",
    "actor_label" "text",
    "event_type" "text" NOT NULL,
    "source" "text" DEFAULT 'admin_ui'::"text" NOT NULL,
    "visibility" "text" DEFAULT 'internal'::"text" NOT NULL,
    "status_before" "text",
    "status_after" "text",
    "payment_status_before" "text",
    "payment_status_after" "text",
    "payment_method" "text",
    "reason_category" "text",
    "reason" "text",
    "internal_note" "text",
    "customer_note" "text",
    "provider_name" "text",
    "provider_action" "text",
    "provider_execution_status" "text",
    "provider_payment_id" "text",
    "provider_refund_id" "text",
    "provider_event_id" "text",
    "refund_amount" numeric(10,2),
    "refund_currency" "text",
    "idempotency_key" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "order_admin_events_event_type_check" CHECK (("event_type" = ANY (ARRAY['admin_unpaid_order_cancelled'::"text", 'paid_cancellation_review_opened'::"text", 'paid_cancellation_review_rejected'::"text", 'paid_cancellation_approved'::"text", 'manual_refund_recorded'::"text", 'payment_status_changed_manual'::"text", 'provider_refund_requested'::"text", 'provider_refund_succeeded'::"text", 'provider_refund_failed'::"text", 'provider_refund_not_applicable'::"text", 'order_status_changed_manual'::"text", 'customer_cancellation_request_received'::"text", 'customer_cancellation_request_rejected'::"text", 'customer_cancellation_request_approved'::"text"]))),
    CONSTRAINT "order_admin_events_metadata_check" CHECK (("jsonb_typeof"("metadata") = 'object'::"text")),
    CONSTRAINT "order_admin_events_refund_amount_check" CHECK ((("refund_amount" IS NULL) OR ("refund_amount" >= (0)::numeric))),
    CONSTRAINT "order_admin_events_source_check" CHECK (("source" = ANY (ARRAY['admin_ui'::"text", 'admin_rpc'::"text", 'system'::"text", 'provider_webhook'::"text", 'manual_backoffice'::"text"]))),
    CONSTRAINT "order_admin_events_visibility_check" CHECK (("visibility" = ANY (ARRAY['internal'::"text", 'customer_safe'::"text"])))
);


ALTER TABLE "public"."order_admin_events" OWNER TO "postgres";


COMMENT ON TABLE "public"."order_admin_events" IS 'Append-only admin audit trail for order lifecycle events. Does not execute refunds or provider actions.';



COMMENT ON COLUMN "public"."order_admin_events"."visibility" IS 'internal rows are admin-only; customer_safe can support future customer-safe messaging without exposing internal notes.';



COMMENT ON COLUMN "public"."order_admin_events"."idempotency_key" IS 'Optional dedupe key for transactional admin actions or future provider/webhook reconciliation.';



CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid",
    "variant_id" "uuid",
    "variant_name" "text",
    "name" "text" NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "quantity" integer NOT NULL,
    "image" "text",
    "section" "public"."section_type",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "order_items_quantity_check" CHECK (("quantity" > 0))
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pilot_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prompt" "text" NOT NULL,
    "response" "text" NOT NULL,
    "capsule_slug" "text",
    "rating_accuracy" integer NOT NULL,
    "rating_tone" integer NOT NULL,
    "rating_utility" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "submitted_by" "uuid",
    CONSTRAINT "pilot_feedback_rating_accuracy_check" CHECK ((("rating_accuracy" >= 1) AND ("rating_accuracy" <= 5))),
    CONSTRAINT "pilot_feedback_rating_tone_check" CHECK ((("rating_tone" >= 1) AND ("rating_tone" <= 5))),
    CONSTRAINT "pilot_feedback_rating_utility_check" CHECK ((("rating_utility" >= 1) AND ("rating_utility" <= 5)))
);


ALTER TABLE "public"."pilot_feedback" OWNER TO "postgres";


COMMENT ON TABLE "public"."pilot_feedback" IS 'Operator-submitted quality ratings from TabPilot manual simulation sessions. Append-only. One row per feedback submission.';



COMMENT ON COLUMN "public"."pilot_feedback"."submitted_by" IS 'Auth user ID of the admin operator who submitted this feedback row. Nullable — rows are preserved if the auth user is later removed.';



CREATE TABLE IF NOT EXISTS "public"."product_attribute_values" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "attribute_id" "uuid",
    "value" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_attribute_values" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_attributes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_variant_capable" boolean DEFAULT true,
    "applicability" "jsonb" DEFAULT '{"sections": ["vape", "420"]}'::"jsonb"
);


ALTER TABLE "public"."product_attributes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_collections" (
    "product_id" "uuid" NOT NULL,
    "collection_id" "uuid" NOT NULL
);


ALTER TABLE "public"."product_collections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_concepts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "concept_type" "text" NOT NULL,
    "brand" "text",
    "product_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "product_concepts_concept_type_check" CHECK (("concept_type" = ANY (ARRAY['brand'::"text", 'device'::"text", 'coil'::"text", 'pod'::"text", 'battery'::"text", 'liquid_type'::"text", 'connector'::"text", 'device_class'::"text", 'accessory'::"text"])))
);


ALTER TABLE "public"."product_concepts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_tags" (
    "name" "text" NOT NULL,
    "label" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_tags" OWNER TO "postgres";


COMMENT ON TABLE "public"."product_tags" IS 'Catálogo canónico de tags. Los productos los usan via TEXT[] pero este registro permite gestión centralizada.';



CREATE TABLE IF NOT EXISTS "public"."product_variant_options" (
    "variant_id" "uuid" NOT NULL,
    "attribute_value_id" "uuid" NOT NULL
);


ALTER TABLE "public"."product_variant_options" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_variants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid",
    "sku" "text",
    "price" numeric(10,2),
    "stock" integer DEFAULT 0,
    "images" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_variants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "short_description" "text",
    "price" numeric(10,2) NOT NULL,
    "compare_at_price" numeric(10,2),
    "stock" integer DEFAULT 0,
    "sku" "text",
    "section" "public"."section_type" NOT NULL,
    "category_id" "uuid" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "status" "public"."product_status" DEFAULT 'active'::"public"."product_status",
    "images" "text"[] DEFAULT '{}'::"text"[],
    "is_featured" boolean DEFAULT false,
    "is_new" boolean DEFAULT false,
    "is_bestseller" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "cover_image" "text",
    "is_featured_until" timestamp with time zone,
    "is_new_until" timestamp with time zone,
    "is_bestseller_until" timestamp with time zone,
    "ai_is_featured" boolean DEFAULT false,
    "ai_sales_note" "text",
    "ai_exclude" boolean DEFAULT false,
    "specs" "jsonb" DEFAULT '{}'::"jsonb",
    "badges" "text"[] DEFAULT '{}'::"text"[],
    "embedding" "public"."vector"(768)
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON COLUMN "public"."products"."cover_image" IS 'Imagen principal de portada, puede ser externa a la galería';



COMMENT ON COLUMN "public"."products"."is_featured_until" IS 'Fecha de expiración para el badge de Destacado';



COMMENT ON COLUMN "public"."products"."is_new_until" IS 'Fecha de expiración para el badge de Nuevo';



COMMENT ON COLUMN "public"."products"."is_bestseller_until" IS 'Fecha de expiración para el badge de Bestseller';



CREATE TABLE IF NOT EXISTS "public"."smart_loyalty_propositions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "coupon_code" "text",
    "generated_code" "text" NOT NULL,
    "personalized_message" "text" NOT NULL,
    "discount_value" numeric NOT NULL,
    "discount_type" "text" NOT NULL,
    "expires_at" timestamp with time zone NOT NULL,
    "is_claimed" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "smart_loyalty_propositions_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'fixed'::"text"])))
);


ALTER TABLE "public"."smart_loyalty_propositions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."store_knowledge" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "category" "text" NOT NULL,
    "source_type" "text" NOT NULL,
    "source_id" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "embedding" "public"."vector"(768),
    CONSTRAINT "store_knowledge_category_check" CHECK (("category" = ANY (ARRAY['shipping'::"text", 'payments'::"text", 'vape_basics'::"text", '420_basics'::"text", 'policies'::"text", 'faq'::"text", 'onboarding'::"text"]))),
    CONSTRAINT "store_knowledge_source_type_check" CHECK (("source_type" = ANY (ARRAY['manual'::"text", 'policy_doc'::"text", 'ai_rules_migrated'::"text"])))
);


ALTER TABLE "public"."store_knowledge" OWNER TO "postgres";


COMMENT ON TABLE "public"."store_knowledge" IS 'Chunked, vectorized knowledge base for Cesarin OS RAG retrieval. Each row is a semantic chunk of a source document. Phase 3.2A.';



CREATE TABLE IF NOT EXISTS "public"."store_settings" (
    "id" bigint DEFAULT 1 NOT NULL,
    "site_name" "text",
    "description" "text",
    "logo_url" "text",
    "whatsapp_number" "text",
    "whatsapp_default_message" "text",
    "social_links" "jsonb" DEFAULT '{}'::"jsonb",
    "location_address" "text",
    "location_city" "text",
    "location_map_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "bank_account_info" "text",
    "payment_methods" "jsonb" DEFAULT '{"cash": false, "transfer": true, "mercadopago": false}'::"jsonb",
    "hero_sliders" "jsonb" DEFAULT '[{"id": "1", "title": "Los Mejores Vapes", "active": true, "ctaLink": "/vape", "ctaText": "Compra Ahora", "subtitle": "20% OFF en tu primera compra + envío gratis en Xalapa", "bgGradient": "from-violet-900 via-fuchsia-900 to-purple-900", "bgGradientLight": "from-violet-500 via-fuchsia-500 to-purple-600"}, {"id": "2", "title": "Productos Premium 420", "active": true, "ctaLink": "/420", "ctaText": "Explorar 420", "subtitle": "La mejor selección de productos importados directamente para ti", "bgGradient": "from-emerald-900 via-green-900 to-teal-900", "bgGradientLight": "from-emerald-500 via-green-500 to-teal-600"}, {"id": "3", "title": "Más de 50 Sabores", "active": true, "ctaLink": "/vape/liquidos", "ctaText": "Ver Líquidos", "subtitle": "Encuentra tu favorito entre nuestra amplia variedad de líquidos", "bgGradient": "from-blue-900 via-indigo-900 to-slate-900", "bgGradientLight": "from-blue-500 via-indigo-500 to-slate-600"}]'::"jsonb",
    "loyalty_config" "jsonb" DEFAULT '{"active": true, "points_per_currency": 10, "currency_per_point_unit": 100}'::"jsonb",
    "flash_deals_end" timestamp with time zone,
    "featured_categories" "jsonb" DEFAULT '[]'::"jsonb",
    "loyalty_tiers_config" "jsonb",
    "is_ai_assistant_enabled" boolean DEFAULT false NOT NULL,
    "pilot_runbook_status" "jsonb" DEFAULT '[]'::"jsonb",
    CONSTRAINT "single_row" CHECK (("id" = 1))
);


ALTER TABLE "public"."store_settings" OWNER TO "postgres";


COMMENT ON COLUMN "public"."store_settings"."bank_account_info" IS 'Information for bank transfers (account number, bank name, etc.)';



COMMENT ON COLUMN "public"."store_settings"."payment_methods" IS 'Configuración de métodos de pago habilitados en la tienda';



COMMENT ON COLUMN "public"."store_settings"."hero_sliders" IS 'Configuración de los slides del Hero (Home)';



COMMENT ON COLUMN "public"."store_settings"."loyalty_config" IS 'Configuración del programa de lealtad (puntos por compra)';



COMMENT ON COLUMN "public"."store_settings"."flash_deals_end" IS 'Hora de fin del countdown de ofertas flash. NULL = timer automático de 6h.';



COMMENT ON COLUMN "public"."store_settings"."is_ai_assistant_enabled" IS 'Global kill switch for the storefront AI assistant (Cesarin). Default is false.';



COMMENT ON COLUMN "public"."store_settings"."pilot_runbook_status" IS 'Status items for the storefront pilot runbook.';



CREATE TABLE IF NOT EXISTS "public"."testimonials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_name" "text" NOT NULL,
    "customer_location" "text",
    "avatar_url" "text",
    "rating" smallint DEFAULT 5 NOT NULL,
    "title" "text",
    "body" "text" NOT NULL,
    "section" "text",
    "category_id" "uuid",
    "product_id" "uuid",
    "verified_purchase" boolean DEFAULT false NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "review_date" "date" DEFAULT CURRENT_DATE,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "testimonials_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5))),
    CONSTRAINT "testimonials_section_check" CHECK (("section" = ANY (ARRAY['vape'::"text", '420'::"text"])))
);


ALTER TABLE "public"."testimonials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" DEFAULT 'info'::"text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    CONSTRAINT "user_notifications_type_check" CHECK (("type" = ANY (ARRAY['info'::"text", 'warning'::"text", 'alert'::"text", 'success'::"text"])))
);


ALTER TABLE "public"."user_notifications" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."view_ai_evaluation_stats" AS
 SELECT "primary_tag",
    "severity",
    "count"(*) AS "total_count",
    "avg"("score") AS "avg_score"
   FROM "public"."ai_evaluations" "e"
  GROUP BY "primary_tag", "severity";


ALTER VIEW "public"."view_ai_evaluation_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wheel_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid",
    "prize_id" "uuid",
    "result_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."wheel_attempts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wheel_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "label" "text" NOT NULL,
    "type" "text" NOT NULL,
    "value" "jsonb",
    "probability" double precision NOT NULL,
    "color" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."wheel_config" OWNER TO "postgres";


ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_customer_notes"
    ADD CONSTRAINT "admin_customer_notes_pkey" PRIMARY KEY ("customer_id");



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_analytics"
    ADD CONSTRAINT "ai_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_configs"
    ADD CONSTRAINT "ai_configs_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."ai_configs"
    ADD CONSTRAINT "ai_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_customer_memory"
    ADD CONSTRAINT "ai_customer_memory_customer_id_key" UNIQUE ("customer_id");



ALTER TABLE ONLY "public"."ai_customer_memory"
    ADD CONSTRAINT "ai_customer_memory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_evaluations"
    ADD CONSTRAINT "ai_evaluations_analytics_id_key" UNIQUE ("analytics_id");



ALTER TABLE ONLY "public"."ai_evaluations"
    ADD CONSTRAINT "ai_evaluations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_intents"
    ADD CONSTRAINT "ai_intents_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."ai_intents"
    ADD CONSTRAINT "ai_intents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_rules"
    ADD CONSTRAINT "ai_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_simulation_reports"
    ADD CONSTRAINT "ai_simulation_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_logs"
    ADD CONSTRAINT "app_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."brands"
    ADD CONSTRAINT "brands_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_section_key" UNIQUE ("slug", "section");



ALTER TABLE ONLY "public"."cesarin_improvement_items"
    ADD CONSTRAINT "cesarin_improvement_items_analytics_id_key" UNIQUE ("analytics_id");



ALTER TABLE ONLY "public"."cesarin_improvement_items"
    ADD CONSTRAINT "cesarin_improvement_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cesarin_operator_actions"
    ADD CONSTRAINT "cesarin_operator_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cesarin_pilot_feedback"
    ADD CONSTRAINT "cesarin_pilot_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cesarin_signal_states"
    ADD CONSTRAINT "cesarin_signal_states_analytics_id_key" UNIQUE ("analytics_id");



ALTER TABLE ONLY "public"."cesarin_signal_states"
    ADD CONSTRAINT "cesarin_signal_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."collections"
    ADD CONSTRAINT "collections_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."compatibility_relations"
    ADD CONSTRAINT "compatibility_relations_concept_a_id_concept_b_id_relation__key" UNIQUE ("concept_a_id", "concept_b_id", "relation_type");



ALTER TABLE ONLY "public"."compatibility_relations"
    ADD CONSTRAINT "compatibility_relations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."concept_aliases"
    ADD CONSTRAINT "concept_aliases_concept_id_alias_key" UNIQUE ("concept_id", "alias");



ALTER TABLE ONLY "public"."concept_aliases"
    ADD CONSTRAINT "concept_aliases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conversation_conversion_events"
    ADD CONSTRAINT "conversation_conversion_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."coupons"
    ADD CONSTRAINT "coupons_pkey" PRIMARY KEY ("code");



ALTER TABLE ONLY "public"."customer_coupons"
    ADD CONSTRAINT "customer_coupons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_profiles"
    ADD CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_profiles"
    ADD CONSTRAINT "customer_profiles_referral_code_key" UNIQUE ("referral_code");



ALTER TABLE ONLY "public"."customer_wishlists"
    ADD CONSTRAINT "customer_wishlists_customer_id_product_id_key" UNIQUE ("customer_id", "product_id");



ALTER TABLE ONLY "public"."customer_wishlists"
    ADD CONSTRAINT "customer_wishlists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flash_deals"
    ADD CONSTRAINT "flash_deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."intervention_recommendations"
    ADD CONSTRAINT "intervention_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."intervention_signals"
    ADD CONSTRAINT "intervention_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."loyalty_points"
    ADD CONSTRAINT "loyalty_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."operator_case_drafts"
    ADD CONSTRAINT "operator_case_drafts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_admin_events"
    ADD CONSTRAINT "order_admin_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_order_number_key" UNIQUE ("order_number");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pilot_feedback"
    ADD CONSTRAINT "pilot_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_attribute_values"
    ADD CONSTRAINT "product_attribute_values_attribute_id_value_key" UNIQUE ("attribute_id", "value");



ALTER TABLE ONLY "public"."product_attribute_values"
    ADD CONSTRAINT "product_attribute_values_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_attributes"
    ADD CONSTRAINT "product_attributes_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."product_attributes"
    ADD CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_collections"
    ADD CONSTRAINT "product_collections_pkey" PRIMARY KEY ("product_id", "collection_id");



ALTER TABLE ONLY "public"."product_concepts"
    ADD CONSTRAINT "product_concepts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_tags"
    ADD CONSTRAINT "product_tags_pkey" PRIMARY KEY ("name");



ALTER TABLE ONLY "public"."product_variant_options"
    ADD CONSTRAINT "product_variant_options_pkey" PRIMARY KEY ("variant_id", "attribute_value_id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_section_key" UNIQUE ("slug", "section");



ALTER TABLE ONLY "public"."smart_loyalty_propositions"
    ADD CONSTRAINT "smart_loyalty_propositions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_knowledge"
    ADD CONSTRAINT "store_knowledge_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."store_settings"
    ADD CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wheel_attempts"
    ADD CONSTRAINT "wheel_attempts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wheel_config"
    ADD CONSTRAINT "wheel_config_pkey" PRIMARY KEY ("id");



CREATE INDEX "cesarin_improvement_items_analytics_id_idx" ON "public"."cesarin_improvement_items" USING "btree" ("analytics_id");



CREATE INDEX "cesarin_improvement_items_created_at_idx" ON "public"."cesarin_improvement_items" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "cesarin_improvement_items_intervention_recommendation_id_key" ON "public"."cesarin_improvement_items" USING "btree" ("intervention_recommendation_id") WHERE ("intervention_recommendation_id" IS NOT NULL);



CREATE INDEX "cesarin_improvement_items_intervention_signal_id_idx" ON "public"."cesarin_improvement_items" USING "btree" ("intervention_signal_id");



CREATE INDEX "cesarin_improvement_items_lane_idx" ON "public"."cesarin_improvement_items" USING "btree" ("lane");



CREATE INDEX "cesarin_improvement_items_status_idx" ON "public"."cesarin_improvement_items" USING "btree" ("status");



CREATE INDEX "cesarin_operator_actions_actor_idx" ON "public"."cesarin_operator_actions" USING "btree" ("actor");



CREATE INDEX "cesarin_operator_actions_module_idx" ON "public"."cesarin_operator_actions" USING "btree" ("module");



CREATE INDEX "cesarin_operator_actions_ts_idx" ON "public"."cesarin_operator_actions" USING "btree" ("ts" DESC);



CREATE INDEX "cesarin_signal_states_analytics_id_idx" ON "public"."cesarin_signal_states" USING "btree" ("analytics_id");



CREATE INDEX "cesarin_signal_states_handled_at_idx" ON "public"."cesarin_signal_states" USING "btree" ("handled_at" DESC);



CREATE INDEX "cesarin_signal_states_status_idx" ON "public"."cesarin_signal_states" USING "btree" ("status");



CREATE INDEX "conversation_conversion_events_session_idx" ON "public"."conversation_conversion_events" USING "btree" ("session_id");



CREATE INDEX "conversation_conversion_events_type_time_idx" ON "public"."conversation_conversion_events" USING "btree" ("event_type", "timestamp" DESC);



CREATE INDEX "idx_addresses_customer_id" ON "public"."addresses" USING "btree" ("customer_id");



CREATE INDEX "idx_addresses_is_default" ON "public"."addresses" USING "btree" ("customer_id", "is_default") WHERE ("is_default" = true);



CREATE INDEX "idx_app_logs_category" ON "public"."app_logs" USING "btree" ("category");



CREATE INDEX "idx_app_logs_created_at" ON "public"."app_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_app_logs_level" ON "public"."app_logs" USING "btree" ("level");



CREATE INDEX "idx_categories_parent" ON "public"."categories" USING "btree" ("parent_id");



CREATE INDEX "idx_categories_section" ON "public"."categories" USING "btree" ("section");



CREATE INDEX "idx_compatibility_relations_a" ON "public"."compatibility_relations" USING "btree" ("concept_a_id");



CREATE INDEX "idx_compatibility_relations_b" ON "public"."compatibility_relations" USING "btree" ("concept_b_id");



CREATE INDEX "idx_concept_aliases_alias" ON "public"."concept_aliases" USING "btree" ("alias");



CREATE INDEX "idx_custom_profiles_ref" ON "public"."customer_profiles" USING "btree" ("referral_code");



CREATE INDEX "idx_customer_coupons_code" ON "public"."customer_coupons" USING "btree" ("coupon_code");



CREATE INDEX "idx_customer_coupons_customer" ON "public"."customer_coupons" USING "btree" ("customer_id");



CREATE INDEX "idx_flash_deals_active" ON "public"."flash_deals" USING "btree" ("is_active", "ends_at" DESC) WHERE ("is_active" = true);



CREATE INDEX "idx_flash_deals_product" ON "public"."flash_deals" USING "btree" ("product_id");



CREATE INDEX "idx_intervention_recommendations_created" ON "public"."intervention_recommendations" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_intervention_recommendations_operator_decision" ON "public"."intervention_recommendations" USING "btree" ("operator_decision");



CREATE INDEX "idx_intervention_recommendations_signal_id" ON "public"."intervention_recommendations" USING "btree" ("signal_id");



CREATE INDEX "idx_intervention_signals_created" ON "public"."intervention_signals" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_intervention_signals_status" ON "public"."intervention_signals" USING "btree" ("status");



CREATE INDEX "idx_intervention_signals_type" ON "public"."intervention_signals" USING "btree" ("signal_type");



CREATE INDEX "idx_loyalty_points_created" ON "public"."loyalty_points" USING "btree" ("customer_id", "created_at" DESC);



CREATE INDEX "idx_loyalty_points_customer" ON "public"."loyalty_points" USING "btree" ("customer_id");



CREATE INDEX "idx_order_items_order_id" ON "public"."order_items" USING "btree" ("order_id");



CREATE INDEX "idx_order_items_product_id" ON "public"."order_items" USING "btree" ("product_id");



CREATE INDEX "idx_orders_created_at" ON "public"."orders" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_orders_customer_id" ON "public"."orders" USING "btree" ("customer_id");



CREATE INDEX "idx_orders_order_number" ON "public"."orders" USING "btree" ("order_number");



CREATE INDEX "idx_orders_status" ON "public"."orders" USING "btree" ("status");



CREATE INDEX "idx_products_active" ON "public"."products" USING "btree" ("is_active");



CREATE INDEX "idx_products_category" ON "public"."products" USING "btree" ("category_id");



CREATE INDEX "idx_products_featured" ON "public"."products" USING "btree" ("is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_products_section" ON "public"."products" USING "btree" ("section");



CREATE INDEX "idx_simulation_reports_timestamp" ON "public"."ai_simulation_reports" USING "btree" ("timestamp" DESC);



CREATE INDEX "idx_smart_loyalty_customer_id" ON "public"."smart_loyalty_propositions" USING "btree" ("customer_id");



CREATE INDEX "idx_smart_loyalty_expires_at" ON "public"."smart_loyalty_propositions" USING "btree" ("expires_at");



CREATE INDEX "idx_testimonials_active" ON "public"."testimonials" USING "btree" ("is_active", "sort_order");



CREATE INDEX "idx_testimonials_category" ON "public"."testimonials" USING "btree" ("category_id") WHERE ("is_active" = true);



CREATE INDEX "idx_testimonials_featured" ON "public"."testimonials" USING "btree" ("is_featured") WHERE ("is_active" = true);



CREATE INDEX "idx_testimonials_section" ON "public"."testimonials" USING "btree" ("section") WHERE ("is_active" = true);



CREATE INDEX "operator_case_drafts_created_at_idx" ON "public"."operator_case_drafts" USING "btree" ("created_at" DESC);



CREATE INDEX "operator_case_drafts_readiness_status_idx" ON "public"."operator_case_drafts" USING "btree" ("readiness_status");



CREATE INDEX "operator_case_drafts_source_type_idx" ON "public"."operator_case_drafts" USING "btree" ("source_type");



CREATE INDEX "order_admin_events_actor_created_idx" ON "public"."order_admin_events" USING "btree" ("actor_user_id", "created_at" DESC);



CREATE INDEX "order_admin_events_created_idx" ON "public"."order_admin_events" USING "btree" ("created_at" DESC);



CREATE UNIQUE INDEX "order_admin_events_idempotency_key_uidx" ON "public"."order_admin_events" USING "btree" ("idempotency_key") WHERE ("idempotency_key" IS NOT NULL);



CREATE INDEX "order_admin_events_order_created_idx" ON "public"."order_admin_events" USING "btree" ("order_id", "created_at" DESC);



CREATE INDEX "order_admin_events_type_created_idx" ON "public"."order_admin_events" USING "btree" ("event_type", "created_at" DESC);



CREATE INDEX "orders_cesarin_session_id_idx" ON "public"."orders" USING "btree" ("cesarin_session_id");



CREATE INDEX "pilot_feedback_created_at_idx" ON "public"."pilot_feedback" USING "btree" ("created_at" DESC);



CREATE INDEX "pilot_feedback_submitted_by_idx" ON "public"."pilot_feedback" USING "btree" ("submitted_by");



CREATE INDEX "products_embedding_idx" ON "public"."products" USING "ivfflat" ("embedding" "public"."vector_cosine_ops") WITH ("lists"='100');



CREATE INDEX "store_knowledge_category_idx" ON "public"."store_knowledge" USING "btree" ("category") WHERE ("is_active" = true);



CREATE INDEX "store_knowledge_embedding_idx" ON "public"."store_knowledge" USING "hnsw" ("embedding" "public"."vector_cosine_ops") WITH ("m"='16', "ef_construction"='64');



CREATE INDEX "store_knowledge_source_id_idx" ON "public"."store_knowledge" USING "btree" ("source_id") WHERE ("source_id" IS NOT NULL);



CREATE OR REPLACE TRIGGER "cesarin_signal_states_updated_at" BEFORE UPDATE ON "public"."cesarin_signal_states" FOR EACH ROW EXECUTE FUNCTION "public"."handle_cesarin_signal_states_updated_at"();



CREATE OR REPLACE TRIGGER "improvement_item_updated_at" BEFORE UPDATE ON "public"."cesarin_improvement_items" FOR EACH ROW EXECUTE FUNCTION "public"."handle_improvement_item_updated_at"();



CREATE OR REPLACE TRIGGER "operator_case_drafts_updated_at" BEFORE UPDATE ON "public"."operator_case_drafts" FOR EACH ROW EXECUTE FUNCTION "public"."handle_operator_case_drafts_updated_at"();



CREATE OR REPLACE TRIGGER "store_knowledge_updated_at" BEFORE UPDATE ON "public"."store_knowledge" FOR EACH ROW EXECUTE FUNCTION "public"."handle_store_knowledge_updated_at"();



CREATE OR REPLACE TRIGGER "trg_customer_profiles_updated_at" BEFORE UPDATE ON "public"."customer_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_flash_deals_updated_at" BEFORE UPDATE ON "public"."flash_deals" FOR EACH ROW EXECUTE FUNCTION "public"."update_flash_deals_updated_at"();



CREATE OR REPLACE TRIGGER "trg_orders_set_number" BEFORE INSERT ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."trg_set_order_number"();



CREATE OR REPLACE TRIGGER "trg_orders_update_customer_stats" AFTER INSERT OR UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."trg_update_customer_stats"();



CREATE OR REPLACE TRIGGER "trg_orders_updated_at" BEFORE UPDATE ON "public"."orders" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trg_testimonials_updated_at" BEFORE UPDATE ON "public"."testimonials" FOR EACH ROW EXECUTE FUNCTION "public"."update_testimonials_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_ai_evaluations_updated_at" BEFORE UPDATE ON "public"."ai_evaluations" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_brands_updated_at" BEFORE UPDATE ON "public"."brands" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_customer_memory_updated_at" BEFORE UPDATE ON "public"."ai_customer_memory" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_products_updated_at" BEFORE UPDATE ON "public"."products" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."addresses"
    ADD CONSTRAINT "addresses_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_customer_notes"
    ADD CONSTRAINT "admin_customer_notes_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_analytics"
    ADD CONSTRAINT "ai_analytics_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_customer_memory"
    ADD CONSTRAINT "ai_customer_memory_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_evaluations"
    ADD CONSTRAINT "ai_evaluations_analytics_id_fkey" FOREIGN KEY ("analytics_id") REFERENCES "public"."ai_analytics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_evaluations"
    ADD CONSTRAINT "ai_evaluations_evaluator_id_fkey" FOREIGN KEY ("evaluator_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ai_rules"
    ADD CONSTRAINT "ai_rules_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "public"."ai_configs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_logs"
    ADD CONSTRAINT "app_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."cesarin_improvement_items"
    ADD CONSTRAINT "cesarin_improvement_items_analytics_id_fkey" FOREIGN KEY ("analytics_id") REFERENCES "public"."ai_analytics"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cesarin_improvement_items"
    ADD CONSTRAINT "cesarin_improvement_items_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "public"."ai_evaluations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cesarin_improvement_items"
    ADD CONSTRAINT "cesarin_improvement_items_intervention_recommendation_id_fkey" FOREIGN KEY ("intervention_recommendation_id") REFERENCES "public"."intervention_recommendations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cesarin_improvement_items"
    ADD CONSTRAINT "cesarin_improvement_items_intervention_signal_id_fkey" FOREIGN KEY ("intervention_signal_id") REFERENCES "public"."intervention_signals"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."cesarin_improvement_items"
    ADD CONSTRAINT "cesarin_improvement_items_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."admin_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."compatibility_relations"
    ADD CONSTRAINT "compatibility_relations_concept_a_id_fkey" FOREIGN KEY ("concept_a_id") REFERENCES "public"."product_concepts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compatibility_relations"
    ADD CONSTRAINT "compatibility_relations_concept_b_id_fkey" FOREIGN KEY ("concept_b_id") REFERENCES "public"."product_concepts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."concept_aliases"
    ADD CONSTRAINT "concept_aliases_concept_id_fkey" FOREIGN KEY ("concept_id") REFERENCES "public"."product_concepts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_coupons"
    ADD CONSTRAINT "customer_coupons_coupon_code_fkey" FOREIGN KEY ("coupon_code") REFERENCES "public"."coupons"("code") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_coupons"
    ADD CONSTRAINT "customer_coupons_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_coupons"
    ADD CONSTRAINT "customer_coupons_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."customer_profiles"
    ADD CONSTRAINT "customer_profiles_favorite_category_id_fkey" FOREIGN KEY ("favorite_category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."customer_profiles"
    ADD CONSTRAINT "customer_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_wishlists"
    ADD CONSTRAINT "customer_wishlists_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_wishlists"
    ADD CONSTRAINT "customer_wishlists_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."flash_deals"
    ADD CONSTRAINT "flash_deals_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intervention_recommendations"
    ADD CONSTRAINT "intervention_recommendations_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "public"."admin_users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."intervention_recommendations"
    ADD CONSTRAINT "intervention_recommendations_signal_id_fkey" FOREIGN KEY ("signal_id") REFERENCES "public"."intervention_signals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."intervention_signals"
    ADD CONSTRAINT "intervention_signals_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."loyalty_points"
    ADD CONSTRAINT "loyalty_points_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."loyalty_points"
    ADD CONSTRAINT "loyalty_points_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_admin_events"
    ADD CONSTRAINT "order_admin_events_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_admin_events"
    ADD CONSTRAINT "order_admin_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_billing_address_id_fkey" FOREIGN KEY ("billing_address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_shipping_address_id_fkey" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."addresses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pilot_feedback"
    ADD CONSTRAINT "pilot_feedback_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_attribute_values"
    ADD CONSTRAINT "product_attribute_values_attribute_id_fkey" FOREIGN KEY ("attribute_id") REFERENCES "public"."product_attributes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_collections"
    ADD CONSTRAINT "product_collections_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_collections"
    ADD CONSTRAINT "product_collections_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_concepts"
    ADD CONSTRAINT "product_concepts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."product_variant_options"
    ADD CONSTRAINT "product_variant_options_attribute_value_id_fkey" FOREIGN KEY ("attribute_value_id") REFERENCES "public"."product_attribute_values"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variant_options"
    ADD CONSTRAINT "product_variant_options_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_variants"
    ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id");



ALTER TABLE ONLY "public"."smart_loyalty_propositions"
    ADD CONSTRAINT "smart_loyalty_propositions_coupon_code_fkey" FOREIGN KEY ("coupon_code") REFERENCES "public"."coupons"("code") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."smart_loyalty_propositions"
    ADD CONSTRAINT "smart_loyalty_propositions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."testimonials"
    ADD CONSTRAINT "testimonials_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wheel_attempts"
    ADD CONSTRAINT "wheel_attempts_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customer_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wheel_attempts"
    ADD CONSTRAINT "wheel_attempts_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "public"."wheel_config"("id");



CREATE POLICY "Admins can delete brands" ON "public"."brands" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete categories" ON "public"."categories" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can delete products" ON "public"."products" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert any wishlist" ON "public"."customer_wishlists" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert brands" ON "public"."brands" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert categories" ON "public"."categories" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert notes" ON "public"."admin_customer_notes" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert notifications" ON "public"."user_notifications" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert pilot feedback" ON "public"."cesarin_pilot_feedback" FOR INSERT WITH CHECK (true);



CREATE POLICY "Admins can insert products" ON "public"."products" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can insert settings" ON "public"."store_settings" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can manage aliases" ON "public"."concept_aliases" TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can manage concepts" ON "public"."product_concepts" TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can manage customer memory" ON "public"."ai_customer_memory" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can manage evaluations" ON "public"."ai_evaluations" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can manage loyalty points" ON "public"."loyalty_points" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can manage order items" ON "public"."order_items" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can manage relations" ON "public"."compatibility_relations" TO "authenticated" USING (((("auth"."jwt"() -> 'app_metadata'::"text") ->> 'role'::"text") = 'admin'::"text"));



CREATE POLICY "Admins can manage tags" ON "public"."product_tags" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read all categories" ON "public"."categories" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read all notes" ON "public"."admin_customer_notes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read all order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read all profiles" ON "public"."customer_profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can read all wishlists" ON "public"."customer_wishlists" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update all profiles" ON "public"."customer_profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update all wishlists" ON "public"."customer_wishlists" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update brands" ON "public"."brands" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update categories" ON "public"."categories" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update notes" ON "public"."admin_customer_notes" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update operator decisions" ON "public"."intervention_recommendations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update orders" ON "public"."orders" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update products" ON "public"."products" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update settings" ON "public"."store_settings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can update signal status" ON "public"."intervention_signals" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can view all app logs" ON "public"."app_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can view all notes" ON "public"."admin_customer_notes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can view all notifications" ON "public"."user_notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can view all pilot feedback" ON "public"."cesarin_pilot_feedback" FOR SELECT USING (true);



CREATE POLICY "Admins can view all profiles" ON "public"."customer_profiles" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))) OR ("auth"."uid"() = "id")));



CREATE POLICY "Admins can view intervention recommendations" ON "public"."intervention_recommendations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins can view intervention signals" ON "public"."intervention_signals" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins have full access on addresses" ON "public"."addresses" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins have full access on admin_customer_notes" ON "public"."admin_customer_notes" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins have full access on coupons" ON "public"."coupons" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins have full access on customer_profiles" ON "public"."customer_profiles" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins have full access on customer_wishlists" ON "public"."customer_wishlists" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins have full access on orders" ON "public"."orders" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins have full access on product_variants" ON "public"."product_variants" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins have full access on products" ON "public"."products" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins pueden gestionar atributos" ON "public"."product_attributes" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins pueden gestionar opciones de variantes" ON "public"."product_variant_options" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins pueden gestionar valores de atributos" ON "public"."product_attribute_values" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Admins pueden gestionar variantes" ON "public"."product_variants" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow authenticated to read admin_users" ON "public"."admin_users" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow service_role full access" ON "public"."product_concepts" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Allow service_role full access aliases" ON "public"."concept_aliases" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Allow service_role full access relations" ON "public"."compatibility_relations" USING ((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text"));



CREATE POLICY "Anyone can insert app logs" ON "public"."app_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read tags" ON "public"."product_tags" FOR SELECT USING (true);



CREATE POLICY "Anyone can view active coupons" ON "public"."coupons" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Atributos visibles públicamente" ON "public"."product_attributes" FOR SELECT USING (true);



CREATE POLICY "Brands are viewable by everyone" ON "public"."brands" FOR SELECT USING (true);



CREATE POLICY "Categories visible públicamente" ON "public"."categories" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Collections visible públicamente" ON "public"."collections" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Enable insert for service role" ON "public"."ai_simulation_reports" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."ai_simulation_reports" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Lectura de variantes para admins y publico activo" ON "public"."product_variants" FOR SELECT USING ((("is_active" = true) OR (EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"())))));



CREATE POLICY "Opciones de variantes visibles públicamente" ON "public"."product_variant_options" FOR SELECT USING (true);



CREATE POLICY "Product collections visible públicamente" ON "public"."product_collections" FOR SELECT USING (true);



CREATE POLICY "Products visible públicamente" ON "public"."products" FOR SELECT USING ((("is_active" = true) AND ("status" = 'active'::"public"."product_status")));



CREATE POLICY "Public settings are visible to everyone" ON "public"."store_settings" FOR SELECT USING (true);



CREATE POLICY "Service role full access on smart_loyalty_propositions" ON "public"."smart_loyalty_propositions" USING (((CURRENT_USER = 'postgres'::"name") OR (CURRENT_USER = 'service_role'::"name")));



CREATE POLICY "Testimonials: admin full access" ON "public"."testimonials" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Testimonials: public read" ON "public"."testimonials" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Users can delete own addresses" ON "public"."addresses" FOR DELETE USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own addresses" ON "public"."addresses" FOR INSERT WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own coupon usage" ON "public"."customer_coupons" FOR INSERT WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own order items" ON "public"."order_items" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."customer_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert own orders" ON "public"."orders" FOR INSERT WITH CHECK (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own profile" ON "public"."customer_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own attempts" ON "public"."wheel_attempts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can update (claim) their own propositions" ON "public"."smart_loyalty_propositions" FOR UPDATE USING (("auth"."uid"() = "customer_id")) WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can update own addresses" ON "public"."addresses" FOR UPDATE USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can update own notifications" ON "public"."user_notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."customer_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own wishlist" ON "public"."customer_wishlists" FOR UPDATE USING (("auth"."uid"() = "customer_id")) WITH CHECK (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can view own addresses" ON "public"."addresses" FOR SELECT USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can view own coupon usage" ON "public"."customer_coupons" FOR SELECT USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can view own notifications" ON "public"."user_notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own order items" ON "public"."order_items" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."orders" "o"
  WHERE (("o"."id" = "order_items"."order_id") AND ("o"."customer_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own orders" ON "public"."orders" FOR SELECT USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can view own points" ON "public"."loyalty_points" FOR SELECT USING (("customer_id" = "auth"."uid"()));



CREATE POLICY "Users can view own profile" ON "public"."customer_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own attempts" ON "public"."wheel_attempts" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users can view their own propositions" ON "public"."smart_loyalty_propositions" FOR SELECT USING (("auth"."uid"() = "customer_id"));



CREATE POLICY "Users read own profile" ON "public"."customer_profiles" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "id"));



CREATE POLICY "Valores de atributos visibles públicamente" ON "public"."product_attribute_values" FOR SELECT USING (true);



CREATE POLICY "Wheel config is public" ON "public"."wheel_config" FOR SELECT TO "authenticated", "anon" USING (true);



ALTER TABLE "public"."addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_customer_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_analytics" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ai_analytics_insert_anon" ON "public"."ai_analytics" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "ai_analytics_insert_authenticated" ON "public"."ai_analytics" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "ai_analytics_select_admin" ON "public"."ai_analytics" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."ai_customer_memory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_evaluations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_simulation_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."brands" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "case_drafts_delete_admin" ON "public"."operator_case_drafts" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "case_drafts_insert_admin" ON "public"."operator_case_drafts" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "case_drafts_select_admin" ON "public"."operator_case_drafts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "case_drafts_update_admin" ON "public"."operator_case_drafts" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cesarin_improvement_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cesarin_operator_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cesarin_pilot_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cesarin_signal_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compatibility_relations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."concept_aliases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conversation_conversion_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "conversation_conversion_events_insert_anon" ON "public"."conversation_conversion_events" FOR INSERT TO "anon" WITH CHECK (true);



CREATE POLICY "conversation_conversion_events_insert_authenticated" ON "public"."conversation_conversion_events" FOR INSERT TO "authenticated" WITH CHECK (true);



ALTER TABLE "public"."coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_coupons" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_wishlists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flash_deals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "flash_deals_admin_delete" ON "public"."flash_deals" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "flash_deals_admin_insert" ON "public"."flash_deals" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "flash_deals_admin_update" ON "public"."flash_deals" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "flash_deals_read_all" ON "public"."flash_deals" FOR SELECT USING (true);



CREATE POLICY "improvement_items_insert_admin" ON "public"."cesarin_improvement_items" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "improvement_items_select_admin" ON "public"."cesarin_improvement_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "improvement_items_update_admin" ON "public"."cesarin_improvement_items" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"())))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."intervention_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."intervention_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."loyalty_points" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "operator_actions_insert_auth" ON "public"."cesarin_operator_actions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "operator_actions_select_auth" ON "public"."cesarin_operator_actions" FOR SELECT TO "authenticated" USING (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."operator_case_drafts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_admin_events" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "order_admin_events_insert_admin" ON "public"."order_admin_events" FOR INSERT TO "authenticated" WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))) AND ("actor_user_id" = "auth"."uid"())));



CREATE POLICY "order_admin_events_select_admin" ON "public"."order_admin_events" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pilot_feedback" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "pilot_feedback_insert_admin" ON "public"."pilot_feedback" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



CREATE POLICY "pilot_feedback_select_admin" ON "public"."pilot_feedback" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."admin_users"
  WHERE ("admin_users"."id" = "auth"."uid"()))));



ALTER TABLE "public"."product_attribute_values" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_attributes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_collections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_concepts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variant_options" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_variants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "signal_states_insert_auth" ON "public"."cesarin_signal_states" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "signal_states_select_auth" ON "public"."cesarin_signal_states" FOR SELECT TO "authenticated" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "signal_states_update_auth" ON "public"."cesarin_signal_states" FOR UPDATE TO "authenticated" USING (("auth"."uid"() IS NOT NULL)) WITH CHECK (("auth"."uid"() IS NOT NULL));



ALTER TABLE "public"."smart_loyalty_propositions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."store_knowledge" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "store_knowledge_select_active" ON "public"."store_knowledge" FOR SELECT TO "authenticated" USING (("is_active" = true));



CREATE POLICY "store_knowledge_select_active_anon" ON "public"."store_knowledge" FOR SELECT TO "anon" USING (("is_active" = true));



ALTER TABLE "public"."store_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."testimonials" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wheel_attempts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wheel_config" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_out"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_send"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_out"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_send"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_in"("cstring", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_out"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_recv"("internal", "oid", integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_send"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_typmod_in"("cstring"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(real[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(double precision[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(integer[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_halfvec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_sparsevec"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."array_to_vector"(numeric[], integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_float4"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_sparsevec"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_to_vector"("public"."halfvec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_halfvec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_to_vector"("public"."sparsevec", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_float4"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_halfvec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_to_sparsevec"("public"."vector", integer, boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector"("public"."vector", integer, boolean) TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."binary_quantize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_tier"("spent" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_tier"("spent" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_tier"("spent" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."can_user_spin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_user_spin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_user_spin"("user_id" "uuid") TO "service_role";



REVOKE ALL ON FUNCTION "public"."cancel_admin_unpaid_order_with_audit"("p_order_id" "uuid", "p_reason" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."cancel_admin_unpaid_order_with_audit"("p_order_id" "uuid", "p_reason" "text") TO "authenticated";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cosine_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_loyalty_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_loyalty_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_loyalty_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_customer_points_balance"("p_customer_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_customer_points_balance"("p_customer_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_customer_points_balance"("p_customer_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_accum"(double precision[], "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_add"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_cmp"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_concat"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_eq"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ge"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_gt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_l2_squared_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_le"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_lt"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_mul"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_ne"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_negative_inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_spherical_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."halfvec_sub"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."hamming_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_cesarin_signal_states_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_cesarin_signal_states_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_cesarin_signal_states_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_improvement_item_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_improvement_item_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_improvement_item_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_auth_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_operator_case_drafts_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_operator_case_drafts_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_operator_case_drafts_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_store_knowledge_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_store_knowledge_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_store_knowledge_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnsw_sparsevec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hnswhandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_coupon_uses"("target_coupon_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_coupon_uses"("target_coupon_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_coupon_uses"("target_coupon_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_bit_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflat_halfvec_support"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "postgres";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "anon";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "authenticated";
GRANT ALL ON FUNCTION "public"."ivfflathandler"("internal") TO "service_role";



GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "postgres";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "anon";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "authenticated";
GRANT ALL ON FUNCTION "public"."jaccard_distance"(bit, bit) TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l1_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."halfvec", "public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_norm"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."l2_normalize"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "filter_category" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "filter_category" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_knowledge"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "filter_category" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."match_products"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "min_stock" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."match_products"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "min_stock" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."match_products"("query_embedding" "public"."vector", "match_threshold" double precision, "match_count" integer, "min_stock" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."process_loyalty_points"("p_user_id" "uuid", "p_amount" integer, "p_type" character varying, "p_description" "text", "p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."process_loyalty_points"("p_user_id" "uuid", "p_amount" integer, "p_type" character varying, "p_description" "text", "p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_loyalty_points"("p_user_id" "uuid", "p_amount" integer, "p_type" character varying, "p_description" "text", "p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rename_product_tag"("old_name" "text", "new_name" "text", "new_label" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."rename_product_tag"("old_name" "text", "new_name" "text", "new_label" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."rename_product_tag"("old_name" "text", "new_name" "text", "new_label" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_cmp"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_eq"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ge"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_gt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_l2_squared_distance"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_le"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_lt"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_ne"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "anon";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sparsevec_negative_inner_product"("public"."sparsevec", "public"."sparsevec") TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."halfvec", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "postgres";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "anon";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."subvector"("public"."vector", integer, integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_set_order_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_set_order_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_set_order_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."trg_update_customer_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."trg_update_customer_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trg_update_customer_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_flash_deals_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_flash_deals_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_flash_deals_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_testimonials_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_testimonials_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_testimonials_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_accum"(double precision[], "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_add"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_avg"(double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_cmp"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "anon";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_combine"(double precision[], double precision[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_concat"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_dims"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_eq"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ge"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_gt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_l2_squared_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_le"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_lt"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_mul"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_ne"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_negative_inner_product"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_norm"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_spherical_distance"("public"."vector", "public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."vector_sub"("public"."vector", "public"."vector") TO "service_role";












GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."avg"("public"."vector") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."halfvec") TO "service_role";



GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "postgres";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "anon";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sum"("public"."vector") TO "service_role";









GRANT ALL ON TABLE "public"."addresses" TO "anon";
GRANT ALL ON TABLE "public"."addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."addresses" TO "service_role";



GRANT ALL ON TABLE "public"."admin_customer_notes" TO "anon";
GRANT ALL ON TABLE "public"."admin_customer_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_customer_notes" TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."ai_analytics" TO "anon";
GRANT ALL ON TABLE "public"."ai_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."ai_configs" TO "anon";
GRANT ALL ON TABLE "public"."ai_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_configs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_customer_memory" TO "anon";
GRANT ALL ON TABLE "public"."ai_customer_memory" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_customer_memory" TO "service_role";



GRANT ALL ON TABLE "public"."ai_evaluations" TO "anon";
GRANT ALL ON TABLE "public"."ai_evaluations" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_evaluations" TO "service_role";



GRANT ALL ON TABLE "public"."ai_intents" TO "anon";
GRANT ALL ON TABLE "public"."ai_intents" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_intents" TO "service_role";



GRANT ALL ON TABLE "public"."ai_rules" TO "anon";
GRANT ALL ON TABLE "public"."ai_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_rules" TO "service_role";



GRANT ALL ON TABLE "public"."ai_simulation_reports" TO "anon";
GRANT ALL ON TABLE "public"."ai_simulation_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_simulation_reports" TO "service_role";



GRANT ALL ON TABLE "public"."app_logs" TO "anon";
GRANT ALL ON TABLE "public"."app_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."app_logs" TO "service_role";



GRANT ALL ON TABLE "public"."brands" TO "anon";
GRANT ALL ON TABLE "public"."brands" TO "authenticated";
GRANT ALL ON TABLE "public"."brands" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."cesarin_improvement_items" TO "anon";
GRANT ALL ON TABLE "public"."cesarin_improvement_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cesarin_improvement_items" TO "service_role";



GRANT ALL ON TABLE "public"."cesarin_operator_actions" TO "anon";
GRANT ALL ON TABLE "public"."cesarin_operator_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."cesarin_operator_actions" TO "service_role";



GRANT ALL ON TABLE "public"."cesarin_pilot_feedback" TO "anon";
GRANT ALL ON TABLE "public"."cesarin_pilot_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."cesarin_pilot_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."cesarin_signal_states" TO "anon";
GRANT ALL ON TABLE "public"."cesarin_signal_states" TO "authenticated";
GRANT ALL ON TABLE "public"."cesarin_signal_states" TO "service_role";



GRANT ALL ON TABLE "public"."collections" TO "anon";
GRANT ALL ON TABLE "public"."collections" TO "authenticated";
GRANT ALL ON TABLE "public"."collections" TO "service_role";



GRANT ALL ON TABLE "public"."compatibility_relations" TO "anon";
GRANT ALL ON TABLE "public"."compatibility_relations" TO "authenticated";
GRANT ALL ON TABLE "public"."compatibility_relations" TO "service_role";



GRANT ALL ON TABLE "public"."concept_aliases" TO "anon";
GRANT ALL ON TABLE "public"."concept_aliases" TO "authenticated";
GRANT ALL ON TABLE "public"."concept_aliases" TO "service_role";



GRANT ALL ON TABLE "public"."conversation_conversion_events" TO "anon";
GRANT ALL ON TABLE "public"."conversation_conversion_events" TO "authenticated";
GRANT ALL ON TABLE "public"."conversation_conversion_events" TO "service_role";



GRANT ALL ON TABLE "public"."coupons" TO "anon";
GRANT ALL ON TABLE "public"."coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."coupons" TO "service_role";



GRANT ALL ON TABLE "public"."customer_coupons" TO "anon";
GRANT ALL ON TABLE "public"."customer_coupons" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_coupons" TO "service_role";



GRANT ALL ON TABLE "public"."customer_profiles" TO "anon";
GRANT ALL ON TABLE "public"."customer_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."customer_rfm_metrics" TO "anon";
GRANT ALL ON TABLE "public"."customer_rfm_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_rfm_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."customer_intelligence_360" TO "anon";
GRANT ALL ON TABLE "public"."customer_intelligence_360" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_intelligence_360" TO "service_role";



GRANT ALL ON TABLE "public"."customer_wishlists" TO "anon";
GRANT ALL ON TABLE "public"."customer_wishlists" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_wishlists" TO "service_role";



GRANT ALL ON TABLE "public"."flash_deals" TO "anon";
GRANT ALL ON TABLE "public"."flash_deals" TO "authenticated";
GRANT ALL ON TABLE "public"."flash_deals" TO "service_role";



GRANT ALL ON TABLE "public"."intervention_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."intervention_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."intervention_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."intervention_signals" TO "anon";
GRANT ALL ON TABLE "public"."intervention_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."intervention_signals" TO "service_role";



GRANT ALL ON TABLE "public"."loyalty_points" TO "anon";
GRANT ALL ON TABLE "public"."loyalty_points" TO "authenticated";
GRANT ALL ON TABLE "public"."loyalty_points" TO "service_role";



GRANT ALL ON TABLE "public"."operator_case_drafts" TO "anon";
GRANT ALL ON TABLE "public"."operator_case_drafts" TO "authenticated";
GRANT ALL ON TABLE "public"."operator_case_drafts" TO "service_role";



GRANT ALL ON TABLE "public"."order_admin_events" TO "anon";
GRANT ALL ON TABLE "public"."order_admin_events" TO "authenticated";
GRANT ALL ON TABLE "public"."order_admin_events" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."pilot_feedback" TO "anon";
GRANT ALL ON TABLE "public"."pilot_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."pilot_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."product_attribute_values" TO "anon";
GRANT ALL ON TABLE "public"."product_attribute_values" TO "authenticated";
GRANT ALL ON TABLE "public"."product_attribute_values" TO "service_role";



GRANT ALL ON TABLE "public"."product_attributes" TO "anon";
GRANT ALL ON TABLE "public"."product_attributes" TO "authenticated";
GRANT ALL ON TABLE "public"."product_attributes" TO "service_role";



GRANT ALL ON TABLE "public"."product_collections" TO "anon";
GRANT ALL ON TABLE "public"."product_collections" TO "authenticated";
GRANT ALL ON TABLE "public"."product_collections" TO "service_role";



GRANT ALL ON TABLE "public"."product_concepts" TO "anon";
GRANT ALL ON TABLE "public"."product_concepts" TO "authenticated";
GRANT ALL ON TABLE "public"."product_concepts" TO "service_role";



GRANT ALL ON TABLE "public"."product_tags" TO "anon";
GRANT ALL ON TABLE "public"."product_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."product_tags" TO "service_role";



GRANT ALL ON TABLE "public"."product_variant_options" TO "anon";
GRANT ALL ON TABLE "public"."product_variant_options" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variant_options" TO "service_role";



GRANT ALL ON TABLE "public"."product_variants" TO "anon";
GRANT ALL ON TABLE "public"."product_variants" TO "authenticated";
GRANT ALL ON TABLE "public"."product_variants" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."smart_loyalty_propositions" TO "anon";
GRANT ALL ON TABLE "public"."smart_loyalty_propositions" TO "authenticated";
GRANT ALL ON TABLE "public"."smart_loyalty_propositions" TO "service_role";



GRANT ALL ON TABLE "public"."store_knowledge" TO "anon";
GRANT ALL ON TABLE "public"."store_knowledge" TO "authenticated";
GRANT ALL ON TABLE "public"."store_knowledge" TO "service_role";



GRANT ALL ON TABLE "public"."store_settings" TO "anon";
GRANT ALL ON TABLE "public"."store_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."store_settings" TO "service_role";



GRANT ALL ON TABLE "public"."testimonials" TO "anon";
GRANT ALL ON TABLE "public"."testimonials" TO "authenticated";
GRANT ALL ON TABLE "public"."testimonials" TO "service_role";



GRANT ALL ON TABLE "public"."user_notifications" TO "anon";
GRANT ALL ON TABLE "public"."user_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."view_ai_evaluation_stats" TO "anon";
GRANT ALL ON TABLE "public"."view_ai_evaluation_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."view_ai_evaluation_stats" TO "service_role";



GRANT ALL ON TABLE "public"."wheel_attempts" TO "anon";
GRANT ALL ON TABLE "public"."wheel_attempts" TO "authenticated";
GRANT ALL ON TABLE "public"."wheel_attempts" TO "service_role";



GRANT ALL ON TABLE "public"."wheel_config" TO "anon";
GRANT ALL ON TABLE "public"."wheel_config" TO "authenticated";
GRANT ALL ON TABLE "public"."wheel_config" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































