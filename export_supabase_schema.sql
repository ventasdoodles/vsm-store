-- Script para exportar el esquema de todas las tablas en Supabase
-- Ejecuta este archivo en el SQL Editor de Supabase o en psql

-- Para cada tabla, muestra columnas, tipos y nullabilidad

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- Si quieres ver constraints y relaciones:
SELECT tc.table_name, tc.constraint_type, kcu.column_name, ccu.table_name AS foreign_table, ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name;

-- Si quieres ver los índices:
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public';

-- Si quieres ver los triggers:
SELECT event_object_table AS table_name, trigger_name, event_manipulation AS event, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public';
