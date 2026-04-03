import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TabConcepts } from '../TabConcepts';

const fetchConceptsMock = vi.fn();
const fetchAliasesMock = vi.fn();
const fetchRelationsMock = vi.fn();
const updateRelationMock = vi.fn();
const deleteRelationMock = vi.fn();
const addAliasMock = vi.fn();
const removeAliasMock = vi.fn();
const addRelationMock = vi.fn();
const addConceptMock = vi.fn();

vi.mock('@/services/admin-compatibility.service', () => ({
    adminCompatibilityService: {
        fetchConcepts: (...args: unknown[]) => fetchConceptsMock(...args),
        fetchAliases: (...args: unknown[]) => fetchAliasesMock(...args),
        fetchRelations: (...args: unknown[]) => fetchRelationsMock(...args),
        updateRelation: (...args: unknown[]) => updateRelationMock(...args),
        deleteRelation: (...args: unknown[]) => deleteRelationMock(...args),
        addAlias: (...args: unknown[]) => addAliasMock(...args),
        removeAlias: (...args: unknown[]) => removeAliasMock(...args),
        addRelation: (...args: unknown[]) => addRelationMock(...args),
        addConcept: (...args: unknown[]) => addConceptMock(...args),
    },
}));

vi.mock('../TabRepoGraph', () => ({
    TabRepoGraph: () => <div>Repo Graph</div>,
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('TabConcepts', () => {
    beforeEach(() => {
        fetchConceptsMock.mockReset();
        fetchAliasesMock.mockReset();
        fetchRelationsMock.mockReset();
        updateRelationMock.mockReset();
        deleteRelationMock.mockReset();
        addAliasMock.mockReset();
        removeAliasMock.mockReset();
        addRelationMock.mockReset();
        addConceptMock.mockReset();

        fetchConceptsMock.mockResolvedValue([
            {
                id: 'concept-1',
                name: 'Caliburn G3',
                concept_type: 'device',
                brand: 'Uwell',
                alias_count: 1,
                relation_count: 1,
            },
            {
                id: 'concept-2',
                name: 'Waka Uva',
                concept_type: 'liquid',
                brand: 'Waka',
                alias_count: 0,
                relation_count: 0,
            },
        ]);
        fetchAliasesMock.mockResolvedValue([
            { id: 'alias-1', concept_id: 'concept-1', alias: 'g3' },
        ]);
        fetchRelationsMock.mockResolvedValue([
            {
                id: 'rel-1',
                concept_a_id: 'concept-1',
                concept_b_id: 'concept-2',
                relation_type: 'recommended_for_liquid',
                scope: 'specific_model',
                status: 'unknown_unconfirmed',
                notes: '',
                concept_a: { name: 'Caliburn G3' },
                concept_b: { name: 'Waka Uva' },
            },
        ]);
        addAliasMock.mockResolvedValue(undefined);
        removeAliasMock.mockResolvedValue(undefined);
        addConceptMock.mockResolvedValue(undefined);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('exposes persisted concept creation plus alias add/remove instead of leaving the lifecycle half-hidden', async () => {
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<TabConcepts />);

        await waitFor(() => {
            expect(screen.getByText(/Caliburn G3/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Esta vista ya permite crear conceptos y administrar aliases\/relaciones persistidas/i)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: /Crear concepto/i }));
        fireEvent.change(screen.getByPlaceholderText(/Nombre del concepto/i), {
            target: { value: 'Vaporesso Xros 4' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Tipo taxonomico/i), {
            target: { value: 'device' },
        });
        fireEvent.change(screen.getByPlaceholderText(/Marca \(opcional\)/i), {
            target: { value: 'Vaporesso' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Guardar concepto/i }));

        await waitFor(() => {
            expect(addConceptMock).toHaveBeenCalledWith({
                name: 'Vaporesso Xros 4',
                concept_type: 'device',
                brand: 'Vaporesso',
            });
        });

        fireEvent.click(screen.getByText('Caliburn G3'));

        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Agregar alias persistido/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Los aliases se persisten en DB desde esta vista/i)).toBeInTheDocument();

        fireEvent.change(screen.getByPlaceholderText(/Agregar alias persistido/i), {
            target: { value: 'g3 pro' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Agregar alias/i }));

        await waitFor(() => {
            expect(addAliasMock).toHaveBeenCalledWith('concept-1', 'g3 pro');
        });

        fireEvent.click(screen.getByTitle(/Eliminar alias/i));

        await waitFor(() => {
            expect(removeAliasMock).toHaveBeenCalledWith('alias-1');
        });
    }, 10000);

    it('treats relation count as a total edge reading instead of implying outgoing-only health', async () => {
        const conceptWithTotalRelationCount = [
            {
                id: 'concept-3',
                name: 'Oxbar Ice',
                concept_type: 'device',
                brand: 'Oxbar',
                alias_count: 1,
                relation_count: 2,
            },
        ];
        fetchConceptsMock.mockResolvedValue(conceptWithTotalRelationCount);

        render(<TabConcepts />);

        await waitFor(() => {
            expect(screen.getByText(/conteo de relaciones suma edges entrantes y salientes/i)).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(screen.getByText(/Oxbar Ice/i)).toBeInTheDocument();
        });

        expect(screen.getByText((content, element) => content.trim() === '2' && element?.tagName.toLowerCase() === 'div')).toBeInTheDocument();
        expect(screen.queryByTitle(/Incompleto \(Falta alias\/relacion\)/i)).not.toBeInTheDocument();
    });
});
