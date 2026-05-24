import { describe, expect, it } from 'vitest';
import { vape420VerticalPackConfig } from '@/config/productization';
import {
    SECTION_DEFAULT_SPECS,
    SPEC_KEY_NORMALIZATION,
    SUGGESTED_SPECS,
    normalizeSpecKey,
} from '../specs.constants';

describe('specs constants public surface', () => {
    it('keeps spec suggestions backed by the Vape/420 vertical pack', () => {
        expect(SUGGESTED_SPECS).toBe(vape420VerticalPackConfig.attributeSchema.suggestedSpecsByCategorySlug);
        expect(SUGGESTED_SPECS.disposables).toEqual([
            'Puffs',
            'Capacidad',
            'Batería',
            'Nicotina',
            'Puerto de Carga',
        ]);
        expect(SUGGESTED_SPECS.extractos).toEqual([
            'Concentración',
            'Método de Extracción',
            'Tipo',
            'THC%',
        ]);
        expect(SUGGESTED_SPECS.parafernalia).toEqual(['Material', 'Tamaño', 'Compatibilidad']);
    });

    it('keeps section defaults and normalization behavior stable', () => {
        expect(SECTION_DEFAULT_SPECS).toEqual({
            vape: ['Marca', 'Modelo', 'Color'],
            '420': ['Marca', 'Tipo', 'Efecto'],
        });
        expect(SPEC_KEY_NORMALIZATION).toBe(vape420VerticalPackConfig.attributeSchema.specKeyNormalization);
        expect(normalizeSpecKey('battery')).toBe('Batería');
        expect(normalizeSpecKey('size=')).toBe('Tamaño');
        expect(normalizeSpecKey('sabor')).toBe('Sabor');
    });
});
