import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdminKnowledge } from '../useAdminKnowledge';

const fetchKnowledgeChunksMock = vi.fn();
const updateKnowledgeChunkMock = vi.fn();
const toggleChunkStatusMock = vi.fn();

vi.mock('@/services/admin-knowledge.service', () => ({
    adminKnowledgeService: {
        fetchKnowledgeChunks: (...args: unknown[]) => fetchKnowledgeChunksMock(...args),
        updateKnowledgeChunk: (...args: unknown[]) => updateKnowledgeChunkMock(...args),
        toggleChunkStatus: (...args: unknown[]) => toggleChunkStatusMock(...args),
    },
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe('useAdminKnowledge', () => {
    beforeEach(() => {
        fetchKnowledgeChunksMock.mockReset();
        updateKnowledgeChunkMock.mockReset();
        toggleChunkStatusMock.mockReset();
    });

    it('rehydrates the persisted node after update instead of keeping a synthetic optimistic copy', async () => {
        const initialNode = {
            id: 'node-1',
            title: 'Envios DHL',
            content: 'Texto base de envios.',
            category: 'shipping',
            source_type: 'manual',
            source_id: null,
            metadata: {},
            is_active: true,
            created_at: '2026-04-03T00:00:00.000Z',
            updated_at: '2026-04-03T00:00:00.000Z',
            has_embedding: false,
        };
        const authoritativeNode = {
            ...initialNode,
            title: 'Envios DHL Express',
            content: 'Texto sincronizado por servidor.',
            updated_at: '2026-04-03T01:00:00.000Z',
            has_embedding: true,
        };
        const refreshedNode = {
            ...authoritativeNode,
            metadata: { persisted: true },
        };

        fetchKnowledgeChunksMock
            .mockResolvedValueOnce([initialNode])
            .mockResolvedValueOnce([refreshedNode]);
        updateKnowledgeChunkMock.mockResolvedValue(authoritativeNode);

        const { result } = renderHook(() => useAdminKnowledge());

        await waitFor(() => {
            expect(fetchKnowledgeChunksMock).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(result.current.nodes).toHaveLength(1);
        });

        act(() => {
            result.current.selectNode('node-1');
        });

        await act(async () => {
            await result.current.updateNode('node-1', {
                title: 'Envios DHL Express',
                content: 'Texto sincronizado por servidor.',
                category: 'shipping',
                source_type: 'manual',
            });
        });

        expect(updateKnowledgeChunkMock).toHaveBeenCalledWith('node-1', {
            title: 'Envios DHL Express',
            content: 'Texto sincronizado por servidor.',
            category: 'shipping',
            source_type: 'manual',
        });
        expect(result.current.nodes[0]).toEqual(refreshedNode);
        expect(result.current.selectedNode).toEqual(refreshedNode);
    }, 10000);

    it('replaces node state with the authoritative toggle response instead of a local guess', async () => {
        const initialNode = {
            id: 'node-1',
            title: 'Pagos',
            content: 'Solo transferencia.',
            category: 'payments',
            source_type: 'manual',
            source_id: null,
            metadata: {},
            is_active: true,
            created_at: '2026-04-03T00:00:00.000Z',
            updated_at: '2026-04-03T00:00:00.000Z',
            has_embedding: true,
        };
        const toggledNode = {
            ...initialNode,
            is_active: false,
            updated_at: '2026-04-03T01:30:00.000Z',
        };

        fetchKnowledgeChunksMock.mockResolvedValueOnce([initialNode]);
        toggleChunkStatusMock.mockResolvedValue(toggledNode);

        const { result } = renderHook(() => useAdminKnowledge());

        await waitFor(() => {
            expect(fetchKnowledgeChunksMock).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
            expect(result.current.nodes).toHaveLength(1);
        });

        act(() => {
            result.current.selectNode('node-1');
        });

        await act(async () => {
            await result.current.toggleStatus('node-1', false);
        });

        expect(toggleChunkStatusMock).toHaveBeenCalledWith('node-1', false);
        expect(result.current.nodes[0]).toEqual(toggledNode);
        expect(result.current.selectedNode).toEqual(toggledNode);
    }, 10000);
});
