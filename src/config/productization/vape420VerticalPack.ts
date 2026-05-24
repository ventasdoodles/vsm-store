import type { VerticalPackConfig } from './types';

export const vape420VerticalPackConfig = {
    id: 'vape-420',
    label: 'Vape/420',
    description: 'Current VSM vertical pack for vape, 420 accessories, and related catalog assumptions.',
    sections: [
        {
            slug: 'vape',
            label: 'Vape Collection',
            shortLabel: 'Vape',
            routePrefix: '/vape',
            description: 'Pods, liquidos, accesorios y equipos de vape.',
            themeToken: 'vape',
        },
        {
            slug: '420',
            label: '420 Zone',
            shortLabel: '420',
            routePrefix: '/420',
            description: 'Herbal, grinders, papel, accesorios y productos para sesion 420.',
            themeToken: 'herbal',
        },
    ],
    categoryTaxonomyHints: [
        {
            slug: 'liquidos',
            label: 'Liquidos',
            sectionSlug: 'vape',
            fixtureImageKey: 'category-liquidos',
        },
        {
            slug: 'mods',
            label: 'Pods & Mods',
            sectionSlug: 'vape',
            fixtureImageKey: 'category-pods',
        },
        {
            slug: 'accesorios-vape',
            label: 'Accesorios Vape',
            sectionSlug: 'vape',
            fixtureImageKey: 'category-accesorios',
        },
        {
            slug: 'concentrados',
            label: 'Cannabis Premium',
            sectionSlug: '420',
            fixtureImageKey: 'category-cannabis',
        },
    ],
    productAttributeHints: [
        {
            categorySlug: 'disposables',
            sectionSlug: 'vape',
            attributes: ['Puffs', 'Capacidad', 'Bateria', 'Nicotina', 'Puerto de Carga'],
        },
        {
            categorySlug: 'vape-kits',
            sectionSlug: 'vape',
            attributes: ['Watts', 'Bateria', 'Capacidad', 'Resistencia Incluida', 'Puerto de Carga'],
        },
        {
            categorySlug: 'pods',
            sectionSlug: 'vape',
            attributes: ['Resistencia', 'Capacidad', 'Compatibilidad'],
        },
        {
            categorySlug: 'liquidos',
            sectionSlug: 'vape',
            attributes: ['Nicotina', 'VG/PG', 'Volumen'],
        },
        {
            categorySlug: 'flores',
            sectionSlug: '420',
            attributes: ['THC%', 'CBD%', 'Genetica', 'Efecto', 'Terpenos'],
        },
        {
            categorySlug: 'extractos',
            sectionSlug: '420',
            attributes: ['Concentracion', 'Metodo de Extraccion', 'Tipo', 'THC%'],
        },
        {
            categorySlug: 'parafernalia',
            sectionSlug: '420',
            attributes: ['Material', 'Tamano', 'Compatibilidad'],
        },
    ],
    compatibilityRuleLabels: [
        'Pods compatibles con equipo base',
        'Consumibles compatibles con kit o dispositivo',
        'Accesorios compatibles por material, tamano o conexion',
    ],
    recommendationRuleLabels: [
        'Alternativas por presupuesto dentro de la misma seccion',
        'Kitting de equipo base con consumibles',
        'Recuperacion de busqueda cuando no existe match exacto',
    ],
    legalPolicyCaveatLabels: [
        'Productos regulados por edad y jurisdiccion',
        'No prometer beneficios medicos',
        'No inventar disponibilidad, compatibilidad o tiempos de entrega',
    ],
    fixtureMetadata: {
        demoProductFamilies: ['Caliburn', 'Nova Pod', 'Mango Ice', 'Vape Pen 22mm'],
        demoCategorySlugs: ['liquidos', 'mods', 'concentrados', 'accesorios-vape'],
        fallbackImageKeys: ['category-liquidos', 'category-pods', 'category-cannabis', 'category-accesorios'],
    },
} satisfies VerticalPackConfig;
