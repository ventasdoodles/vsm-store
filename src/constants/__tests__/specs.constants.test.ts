import { describe, expect, it } from 'vitest';
import { vape420VerticalPackConfig } from '@/config/productization';
import {
    getSectionDefaultSpecs,
    getSpecKeyNormalization,
    getSuggestedSpecs,
    normalizeSpecKey,
} from '../specs.constants';

describe('specs constants public surface', () => {
    it('keeps spec suggestions backed by the Vape/420 vertical pack', () => {
        expect(getSuggestedSpecs(vape420VerticalPackConfig)).toBe(vape420VerticalPackConfig.attributeSchema.suggestedSpecsByCategorySlug);
        expect(getSuggestedSpecs(vape420VerticalPackConfig).disposables).toEqual([
            'Puffs',
            'Capacidad',
            'Batería',
            'Nicotina',
            'Puerto de Carga',
        ]);
        expect(getSuggestedSpecs(vape420VerticalPackConfig).extractos).toEqual([
            'Concentración',
            'Método de Extracción',
            'Tipo',
            'THC%',
        ]);
        expect(getSuggestedSpecs(vape420VerticalPackConfig).parafernalia).toEqual(['Material', 'Tamaño', 'Compatibilidad']);
    });

    it('keeps section defaults and normalization behavior stable', () => {
        expect(getSectionDefaultSpecs(vape420VerticalPackConfig)).toEqual({
            vape: ['Marca', 'Modelo', 'Color'],
            '420': ['Marca', 'Tipo', 'Efecto'],
        });
        expect(getSpecKeyNormalization(vape420VerticalPackConfig)).toBe(vape420VerticalPackConfig.attributeSchema.specKeyNormalization);
        expect(normalizeSpecKey('battery', vape420VerticalPackConfig)).toBe('Batería');
        expect(normalizeSpecKey('size=', vape420VerticalPackConfig)).toBe('Tamaño');
        expect(normalizeSpecKey('sabor', vape420VerticalPackConfig)).toBe('Sabor');
    });
});
