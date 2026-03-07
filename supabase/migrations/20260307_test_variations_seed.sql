-- ============================================
-- VSM Store - Seed Data: Variaciones para Pruebas
-- Descripción: Añade variaciones a productos existentes para probar filtros.
-- ============================================

DO $$
DECLARE
    v_product_id UUID;
    v_attr_color_id UUID;
    v_attr_sabor_id UUID;
    v_val_red_id UUID;
    v_val_blue_id UUID;
    v_val_fresa_id UUID;
    v_val_mango_id UUID;
    v_variant_id UUID;
BEGIN
    -- 1. Obtener IDs de atributos
    SELECT id INTO v_attr_color_id FROM product_attributes WHERE name = 'Color' LIMIT 1;
    SELECT id INTO v_attr_sabor_id FROM product_attributes WHERE name = 'Sabor' LIMIT 1;

    -- 2. Insertar valores si no existen
    INSERT INTO product_attribute_values (attribute_id, value) VALUES (v_attr_color_id, 'Rojo') ON CONFLICT DO NOTHING;
    INSERT INTO product_attribute_values (attribute_id, value) VALUES (v_attr_color_id, 'Azul') ON CONFLICT DO NOTHING;
    INSERT INTO product_attribute_values (attribute_id, value) VALUES (v_attr_sabor_id, 'Fresa') ON CONFLICT DO NOTHING;
    INSERT INTO product_attribute_values (attribute_id, value) VALUES (v_attr_sabor_id, 'Mango') ON CONFLICT DO NOTHING;

    SELECT id INTO v_val_red_id FROM product_attribute_values WHERE attribute_id = v_attr_color_id AND value = 'Rojo';
    SELECT id INTO v_val_blue_id FROM product_attribute_values WHERE attribute_id = v_attr_color_id AND value = 'Azul';
    SELECT id INTO v_val_fresa_id FROM product_attribute_values WHERE attribute_id = v_attr_sabor_id AND value = 'Fresa';
    SELECT id INTO v_val_mango_id FROM product_attribute_values WHERE attribute_id = v_attr_sabor_id AND value = 'Mango';

    -- 3. Añadir variaciones al 'Pod System Starter Kit'
    SELECT id INTO v_product_id FROM products WHERE slug = 'pod-system-starter-kit' LIMIT 1;
    
    IF v_product_id IS NOT NULL THEN
        -- Variante Roja
        INSERT INTO product_variants (product_id, sku, price, stock) 
        VALUES (v_product_id, 'POD-RED', 450.00, 10) RETURNING id INTO v_variant_id;
        INSERT INTO product_variant_options (variant_id, attribute_value_id) VALUES (v_variant_id, v_val_red_id);

        -- Variante Azul
        INSERT INTO product_variants (product_id, sku, price, stock) 
        VALUES (v_product_id, 'POD-BLUE', 450.00, 10) RETURNING id INTO v_variant_id;
        INSERT INTO product_variant_options (variant_id, attribute_value_id) VALUES (v_variant_id, v_val_blue_id);
    END IF;

    -- 4. Añadir variaciones al 'E-Liquid Frutas Tropicales 60ml 6mg'
    SELECT id INTO v_product_id FROM products WHERE slug = 'eliquid-frutas-tropicales-60ml-6mg' LIMIT 1;

    IF v_product_id IS NOT NULL THEN
        -- Variante Fresa
        INSERT INTO product_variants (product_id, sku, price, stock) 
        VALUES (v_product_id, 'LIQ-TROP-FRESA', 280.00, 20) RETURNING id INTO v_variant_id;
        INSERT INTO product_variant_options (variant_id, attribute_value_id) VALUES (v_variant_id, v_val_fresa_id);

        -- Variante Mango
        INSERT INTO product_variants (product_id, sku, price, stock) 
        VALUES (v_product_id, 'LIQ-TROP-MANGO', 280.00, 20) RETURNING id INTO v_variant_id;
        INSERT INTO product_variant_options (variant_id, attribute_value_id) VALUES (v_variant_id, v_val_mango_id);
    END IF;

END $$;
