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

    const fetchNodes = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminKnowledgeService.fetchKnowledgeChunks(search, categoryFilter);
            setNodes(data);
        } catch (error: any) {
            console.error('Error fetching knowledge nodes:', error);
            toast.error('Error al cargar la base de conocimiento');
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
            // Service layer validation is primary. We just pass through.
            await adminKnowledgeService.updateKnowledgeChunk(id, payload);
            toast.success('Vector sincronizado correctamente');
            await fetchNodes(); // Refresh to get exact timestamps
            
            // Update selected node locally if open
            if (selectedNode?.id === id) {
                setSelectedNode(prev => prev ? { ...prev, ...payload, has_embedding: true } : null);
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
            await adminKnowledgeService.toggleChunkStatus(id, isActive);
            toast.success(`Fragmento ${isActive ? 'activado' : 'desactivado'}`);
            setNodes(prev => prev.map(n => n.id === id ? { ...n, is_active: isActive } : n));
            if (selectedNode?.id === id) {
                setSelectedNode(prev => prev ? { ...prev, is_active: isActive } : null);
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
