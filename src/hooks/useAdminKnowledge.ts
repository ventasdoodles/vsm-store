import { useState, useEffect, useCallback } from 'react';
import { adminKnowledgeService, StoreKnowledgeNode, KnowledgeCategory } from '@/services/admin-knowledge.service';
import { toast } from 'react-hot-toast';

export function useAdminKnowledge() {
    const [nodes, setNodes] = useState<StoreKnowledgeNode[]>([]);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<KnowledgeCategory | undefined>();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedNode, setSelectedNode] = useState<StoreKnowledgeNode | null>(null);

    const fetchNodes = useCallback(async (): Promise<StoreKnowledgeNode[]> => {
        setIsLoading(true);
        try {
            const data = await adminKnowledgeService.fetchKnowledgeChunks(search, categoryFilter);
            setNodes(data);
            return data;
        } catch (error: any) {
            console.error('Error fetching knowledge nodes:', error);
            toast.error('Error al cargar la base de conocimiento');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [search, categoryFilter]);

    // Use debouncing for search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchNodes();
        }, 300);
        return () => clearTimeout(timer);
    }, [fetchNodes]);

    const selectNode = (id: string | null) => {
        if (!id) {
            setSelectedNode(null);
            return;
        }
        const node = nodes.find(n => n.id === id);
        if (node) setSelectedNode(node);
    };

    const updateNode = async (
        id: string, 
        payload: { title: string; content: string; category: KnowledgeCategory; source_type: string; metadata?: Record<string, any> }
    ) => {
        setIsSaving(true);
        try {
            const authoritativeNode = await adminKnowledgeService.updateKnowledgeChunk(id, payload);
            toast.success('Vector sincronizado correctamente');
            const refreshedNodes = await fetchNodes();
            const persistedNode = refreshedNodes.find(node => node.id === id) ?? authoritativeNode;

            if (selectedNode?.id === id) {
                setSelectedNode(persistedNode);
            }
        } catch (error: any) {
            console.error('Error updating knowledge node:', error);
            toast.error(error.message || 'Error al guardar. Verifica la validación de servidor.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (id: string, isActive: boolean) => {
        setIsSaving(true);
        try {
            const authoritativeNode = await adminKnowledgeService.toggleChunkStatus(id, isActive);
            toast.success(`Fragmento ${isActive ? 'activado' : 'desactivado'}`);
            setNodes(prev => prev.map(n => n.id === id ? authoritativeNode : n));
            if (selectedNode?.id === id) {
                setSelectedNode(authoritativeNode);
            }
        } catch (error: any) {
            console.error('Error toggling status:', error);
            toast.error('Error al cambiar estatus');
        } finally {
            setIsSaving(false);
        }
    };

    return {
        nodes,
        search,
        setSearch,
        categoryFilter,
        setCategoryFilter,
        isLoading,
        isSaving,
        selectedNode,
        selectNode,
        updateNode,
        toggleStatus,
        refresh: fetchNodes
    };
}
