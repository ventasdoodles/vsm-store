-- ============================================================================
-- VSM Store: Add tiers_config to store_settings
-- Migración: 20260306_loyalty_tiers_config.sql
-- ============================================================================

-- 1. Añadir la columna tiers_config (JSONB) para flexibilidad total
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS loyalty_tiers_config JSONB;

-- 2. Poblar con los valores actuales "hardcoded" para no romper nada
-- Estructura sugerida: Array de objetos {id, name, threshold, multiplier, color, benefits[]}
UPDATE store_settings SET loyalty_tiers_config = '[
    {
        "id": "bronze",
        "name": "Bronze",
        "threshold": 0,
        "multiplier": 1.0,
        "color": "#cd7f32",
        "benefits": ["Gana V-Coins en cada compra", "Acceso a ofertas exclusivas"]
    },
    {
        "id": "silver",
        "name": "Silver",
        "threshold": 5000,
        "multiplier": 1.2,
        "color": "#c0c0c0",
        "benefits": ["Multiplicador 1.2x en V-Coins", "Envío prioritario"]
    },
    {
        "id": "gold",
        "name": "Gold",
        "threshold": 20000,
        "multiplier": 1.5,
        "color": "#ffd700",
        "benefits": ["Multiplicador 1.5x en V-Coins", "Regalo sorpresa en aniversarios", "Soporte VIP"]
    },
    {
        "id": "platinum",
        "name": "Platinum",
        "threshold": 50000,
        "multiplier": 2.0,
        "color": "#e5e4e2",
        "benefits": ["Multiplicador 2.0x en V-Coins", "Envío gratis ilimitado", "Acceso anticipado a lanzamientos", "Gerente de cuenta dedicado"]
    }
]'::jsonb
WHERE id = 1 AND loyalty_tiers_config IS NULL;

COMMENT ON COLUMN store_settings.loyalty_tiers_config IS 'Configuración dinámica de los niveles de lealtad (tiers)';
