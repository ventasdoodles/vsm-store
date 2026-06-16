DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
BEGIN
  -- Insert into auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password, 
    email_confirmed_at, recovery_sent_at, last_sign_in_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, 
    confirmation_token, email_change, email_change_token_new, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', new_user_id, 'authenticated', 'authenticated', 'ventasdoodles@gmail.com',
    crypt('password123', gen_salt('bf')),
    now(), now(), now(),
    '{"provider":"email","providers":["email"]}', '{"name": "Administrador General"}', now(), now(),
    '', '', '', ''
  );

  -- Insert into auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    new_user_id, new_user_id, format('{"sub":"%s","email":"ventasdoodles@gmail.com"}', new_user_id)::jsonb, 'email', new_user_id::text, now(), now(), now()
  );

  -- Insert into public.admin_users
  BEGIN
    INSERT INTO public.admin_users (user_id, email, role)
    VALUES (new_user_id, 'ventasdoodles@gmail.com', 'super_admin');
  EXCEPTION WHEN OTHERS THEN
    -- Ignore
  END;
END $$;
