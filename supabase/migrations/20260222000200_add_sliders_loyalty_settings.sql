-- Agregar columnas para sliders y lealtad a la tabla store_settings
ALTER TABLE store_settings 
ADD COLUMN IF NOT EXISTS hero_sliders JSONB DEFAULT '[
    {
        "id": "1",
        "title": "Los Mejores Vapes",
        "subtitle": "20% OFF en tu primera compra + envío gratis en Xalapa",
        "ctaText": "Compra Ahora",
        "ctaLink": "/vape",
        "bgGradient": "from-violet-900 via-fuchsia-900 to-purple-900",
        "bgGradientLight": "from-violet-500 via-fuchsia-500 to-purple-600",
        "active": true
    },
    {
        "id": "2",
        "title": "Productos Premium 420",
        "subtitle": "La mejor selección de productos importados directamente para ti",
        "ctaText": "Explorar 420",
        "ctaLink": "/420",
        "bgGradient": "from-emerald-900 via-green-900 to-teal-900",
        "bgGradientLight": "from-emerald-500 via-green-500 to-teal-600",
        "active": true
    },
    {
        "id": "3",
        "title": "Más de 50 Sabores",
        "subtitle": "Encuentra tu favorito entre nuestra amplia variedad de líquidos",
        "ctaText": "Ver Líquidos",
        "ctaLink": "/vape/liquidos",
        "bgGradient": "from-blue-900 via-indigo-900 to-slate-900",
        "bgGradientLight": "from-blue-500 via-indigo-500 to-slate-600",
        "active": true
    }
]',
ADD COLUMN IF NOT EXISTS loyalty_config JSONB DEFAULT '{"points_per_currency": 10, "currency_per_point_unit": 100, "active": true}';

COMMENT ON COLUMN store_settings.hero_sliders IS 'Configuración de los slides del Hero (Home)';
COMMENT ON COLUMN store_settings.loyalty_config IS 'Configuración del programa de lealtad (puntos por compra)';
