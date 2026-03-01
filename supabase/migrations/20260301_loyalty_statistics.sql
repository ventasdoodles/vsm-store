-- Obtener estadísticas generales para el panel de Lealtad (V-Coins)
CREATE OR REPLACE FUNCTION get_admin_loyalty_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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
