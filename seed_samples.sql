-- Semilla de datos para VSM Store CRM 360
-- Este script puebla perfiles de clientes y órdenes para probar la inteligencia.

-- 1. Asegurar que existan algunos perfiles vinculados a auth.users (o perfiles huérfanos si RLS lo permite para pruebas)
-- Nota: En Supabase real, 'id' debe ser un UUID válido de auth.users.
-- Para pruebas rápidas, usaremos UUIDs fijos.

INSERT INTO customer_profiles (id, full_name, phone, whatsapp, avatar_url, created_at)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'Juan Pérez', '5512345678', '5512345678', 'https://i.pravatar.cc/150?u=juan', NOW() - INTERVAL '60 days'),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 'María García', '5587654321', '5587654321', 'https://i.pravatar.cc/150?u=maria', NOW() - INTERVAL '10 days'),
  ('c3d4e5f6-a7b8-4c5d-0e1f-2345678901cd', 'Carlos Rodríguez', '5555555555', '5555555555', NULL, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- 2. Insertar órdenes para simular actividad
-- Asumimos que existen productos. Si no coinciden los IDs de producto, la vista RFM igual funcionará para Frequency/Monetary.

INSERT INTO orders (customer_id, total, status, created_at)
VALUES 
  -- Juan (En Riesgo: última compra hace 60 días)
  ('a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 1200.50, 'delivered', NOW() - INTERVAL '60 days'),
  
  -- María (Leal: 3 compras recientes)
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 850.00, 'delivered', NOW() - INTERVAL '15 days'),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 920.00, 'delivered', NOW() - INTERVAL '8 days'),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 1500.00, 'delivered', NOW() - INTERVAL '2 days'),
  
  -- Carlos (Nuevo: 1 compra hoy)
  ('c3d4e5f6-a7b8-4c5d-0e1f-2345678901cd', 2300.00, 'processing', NOW() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

-- 3. Notas Administrativas
INSERT INTO admin_customer_notes (customer_id, notes, tags, updated_at)
VALUES 
  ('a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'Cliente quejumbroso por envío tardío.', ARRAY['VIP', 'Queja'], NOW()),
  ('b2c3d4e5-f6a7-4b5c-9d8e-1234567890bc', 'Excelente cliente, prefiere sabores frutales.', ARRAY['Leal', 'Frutales'], NOW())
ON CONFLICT (customer_id) DO NOTHING;
