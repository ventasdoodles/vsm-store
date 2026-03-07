/**
 * Lógica de filtrado y extracción de atributos para productos - VSM Store
 */
import type { Product } from '@/types/product';

export interface FilterState {
    priceRange: [number, number];
    attributes: Record<string, string[]>; // { "Sabor": ["Fresa", "Mango"], "Concentración": ["3mg"] }
}

/**
 * Extrae los valores únicos de atributos y el rango de precio de una lista de productos
 */
export function getAvailableFilters(products: Product[]) {
    const filters = {
        minPrice: 0,
        maxPrice: 0,
        attributes: {} as Record<string, Set<string>>
    };

    if (products.length === 0) return filters;

    // Inicializar precios con el primer producto
    const firstProduct = products[0];
    if (firstProduct) {
        filters.minPrice = firstProduct.price;
        filters.maxPrice = firstProduct.price;
    }

    products.forEach(product => {
        // Rango de precio
        if (product.price < filters.minPrice) filters.minPrice = product.price;
        if (product.price > filters.maxPrice) filters.maxPrice = product.price;

        // Atributos de las variantes
        product.variants?.forEach(variant => {
            variant.options?.forEach(option => {
                if (option.attribute_name && option.attribute_value?.value) {
                    const attrName = option.attribute_name;
                    if (!filters.attributes[attrName]) {
                        filters.attributes[attrName] = new Set();
                    }
                    filters.attributes[attrName]?.add(option.attribute_value.value);
                }
            });
        });
    });

    // Convertir Sets a Arrays ordenados
    const sortedAttributes: Record<string, string[]> = {};
    Object.keys(filters.attributes).forEach(key => {
        const valueSet = filters.attributes[key];
        if (valueSet) {
            sortedAttributes[key] = Array.from(valueSet).sort();
        }
    });

    return {
        minPrice: Math.floor(filters.minPrice),
        maxPrice: Math.ceil(filters.maxPrice),
        attributes: sortedAttributes
    };
}

/**
 * Filtra una lista de productos basándose en el estado de los filtros
 */
export function applyFilters(products: Product[], filters: FilterState): Product[] {
    return products.filter(product => {
        // 1. Filtro de Precio
        const withinPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
        if (!withinPrice) return false;

        // 2. Filtro de Atributos
        const activeAttrKeys = Object.keys(filters.attributes).filter(key => filters.attributes[key].length > 0);

        if (activeAttrKeys.length === 0) return true;

        // Para cada atributo activo (ej: Color), el producto debe tener al menos una variante 
        // que coincida con uno de los valores seleccionados (OR dentro del atributo, AND entre atributos)
        return activeAttrKeys.every(attrName => {
            const selectedValues = filters.attributes[attrName] || [];

            // Si el producto no tiene variantes, no puede cumplir filtros de atributos
            if (!product.variants || product.variants.length === 0) return false;

            return product.variants.some(variant =>
                variant.options.some(opt =>
                    opt.attribute_name === attrName &&
                    opt.attribute_value &&
                    selectedValues.includes(opt.attribute_value.value)
                )
            );
        });
    });
}
