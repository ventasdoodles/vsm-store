-- MIGRACIÓN FASE 2B: LIMPIEZA TÉCNICA DE TAGS
-- Fecha: 16/3/2026, 8:25:22 p.m.
-- Propósito: Migrar tags de alta confianza a specs/badges sin borrar tags originales.

BEGIN;

-- Producto: Box Mod 150W TC
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"potencia":"150w"}'::jsonb WHERE id = '6fbd2ee0-5910-4472-a90f-d03a5904f7e0';

-- Producto: Paletas CBD Sandía x5
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"dosis_por_porcion":"15mg"}'::jsonb WHERE id = '4847d1cc-65c3-4507-a4e0-f14e62c628ab';

-- Producto: Chocolate Dark THC 10mg x4
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"dosis_por_porcion":"10mg"}'::jsonb WHERE id = '1b33ab83-58ea-47a1-8125-5bf15cf55d17';

-- Producto: Pod Mod AIO 60W
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"potencia":"60w"}'::jsonb WHERE id = 'b8311631-045b-435c-a5c0-9bcb5bbac50f';

-- Producto: Mini Mod 40W Stealth
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"potencia":"40w"}'::jsonb WHERE id = '229d9c06-7adb-4c1f-8127-32fb2a8daf0b';

-- Producto: E-Liquid Berry Mix 100ml 6mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"6mg"}'::jsonb WHERE id = '4d9bf44e-c485-493d-8d2b-1de162da00e3';

-- Producto: Nic Salt Tabaco Clásico 30ml 50mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"50mg"}'::jsonb WHERE id = '00fb55a7-a1c3-47aa-9250-10af6692a129';

-- Producto: E-Liquid Postre Vainilla 60ml 3mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"3mg"}'::jsonb WHERE id = 'bb30b2fa-ddd3-4749-99c1-4266528bcc34';

-- Producto: Nic Salt Mango Lychee 30ml 35mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"35mg"}'::jsonb WHERE id = 'ce3ef2d2-a1f7-4749-903b-3848b4f88422';

-- Producto: E-Liquid Frutas Tropicales 60ml 6mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"6mg","ratio_vg_pg":"70vg"}'::jsonb WHERE id = 'e178fb01-86f2-40b8-9e9c-468c31c918f8';

-- Producto: Vaporizer Micro Pod 420
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"conector":"510"}'::jsonb WHERE id = '4d238a13-f237-49a7-9ef7-d8f94be10bc7';

-- Producto: Nic Salt Sandía Mint 30ml 35mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"35mg"}'::jsonb WHERE id = '0fabc66d-0561-4183-99c1-1295fdae6cf9';

-- Producto: Nic Salt Fresa Kiwi 30ml 20mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"20mg"}'::jsonb WHERE id = '95686826-c099-4bf4-a42b-154c7a11881f';

-- Producto: Nic Salt Uva Ice 15ml 50mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"50mg"}'::jsonb WHERE id = 'b21b3e6b-fa6b-4a44-b722-1ebcc22ab116';

-- Producto: Mod Regulado 80W Compact
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"potencia":"80w","conector":"510-thread"}'::jsonb WHERE id = 'b85e9382-eeed-4157-9892-c655eccbef04';

-- Producto: Box Mod 200W Dual Battery
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"potencia":"200w"}'::jsonb WHERE id = 'cd9fdb07-54a4-41d6-9fdd-fd4b5ff8af82';

-- Producto: Mod Squonk 100W BF
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"potencia":"100w"}'::jsonb WHERE id = '3eea19a4-af22-44be-af7a-d8bedcf34202';

-- Producto: E-Liquid Mentolado Ice 120ml 3mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"3mg","ratio_vg_pg":"80vg"}'::jsonb WHERE id = '423fccab-f86d-4a54-b417-bdc2cbee7b7d';

-- Producto: E-Liquid Tabaco Rubio 30ml 12mg
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"nicotina":"12mg","ratio_vg_pg":"50vg"}'::jsonb WHERE id = 'f9a0edbf-40bf-4eb0-a2a9-3cf4b585c9c7';

-- Producto: Gomitas THC Sour 5mg x20
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"dosis_por_porcion":"5mg"}'::jsonb WHERE id = '860ac9a4-4fdb-42de-8980-1c2dce1df650';

-- Producto: Caramelos Hard Candy THC 10mg x8
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"dosis_por_porcion":"10mg"}'::jsonb WHERE id = '401447d0-2be0-4af2-ba4c-5e2850cf9f80';

-- Producto: Brownies CBD 50mg x2
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"dosis_por_porcion":"50mg"}'::jsonb WHERE id = 'f073a855-c797-4fe3-b04d-c921a40ca1a5';

-- Producto: Gomitas CBD 25mg x10 Frutas
UPDATE products SET specs = COALESCE(specs, '{}'::jsonb) || '{"dosis_por_porcion":"25mg"}'::jsonb WHERE id = '122952b3-e6b5-491b-a8c8-40110d8cfba4';

COMMIT;
