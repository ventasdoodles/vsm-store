/**
 * // ─── COMPONENTE: AdminTags ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar el estado, las mutaciones y busquedas de etiquetas.
 * // Regla / Notas: Todo el UI render esta delegado a la carpeta components/admin/tags.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNotification } from '@/hooks/useNotification';

// API Services
import { 
  getAllTags, 
  createTag, 
  renameTag, 
  deleteTag 
} from '@/services/admin/admin-tags.service';

// Legos
import { TagsHeader } from '@/components/admin/tags/TagsHeader';
import { TagGrid } from '@/components/admin/tags/TagGrid';

/** Constantes de estado para acciones sobre tarjetas (elimina cadenas magicas) */
const TAG_ACTION = {
  CREATING: 'CREATING',
  DELETING: 'DELETING',
  RENAMING: 'RENAMING',
} as const;

export function AdminTags() {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotification();
  
  // Estado UI
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estado para UX de Mutaciones (loaders individuales)
  const [actingTagCard, setActingTagCard] = useState<string | null>(null);

  // Queries
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: getAllTags
  });

  // Mutaciones
  const createMutation = useMutation({
    mutationFn: ({ name, label }: { name: string; label: string }) => createTag(name, label),
    onMutate: () => setActingTagCard(TAG_ACTION.CREATING),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      success('Etiqueta creada', `La etiqueta "${vars.label}" se creo con exito.`);
    },
    onError: (e: Error) => notifyError('Error al crear', e.message?.includes('duplicate') ? 'La etiqueta ya existe.' : 'Error inesperado.'),
    onSettled: () => setActingTagCard(null),
  });

  const renameMutation = useMutation({
    mutationFn: ({ oldName, newLabel }: { oldName: string; newLabel: string }) => {
      // Create new name slug
      const newName = newLabel.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return renameTag(oldName, newName, newLabel);
    },
    onMutate: (vars) => setActingTagCard(`${TAG_ACTION.RENAMING}_${vars.oldName}`),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      success('Etiqueta actualizada', `Cambiaste el nombre a "${vars.newLabel}"`);
    },
    onError: (e: Error) => notifyError('Error al renombrar', e.message || 'Error inesperado.'),
    onSettled: () => setActingTagCard(null),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onMutate: (name) => setActingTagCard(`${TAG_ACTION.DELETING}_${name}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
      success('Etiqueta eliminada', 'Se removio la etiqueta correctamente.');
    },
    onError: (e: Error) => notifyError('No se pudo eliminar', e.message || 'Error inesperado.'),
    onSettled: () => setActingTagCard(null),
  });

  // Handlers
  const handleCreate = (name: string, label: string) => {
    createMutation.mutate({ name, label });
  };

  const handleRename = (oldName: string, newLabel: string) => {
    renameMutation.mutate({ oldName, newLabel });
  };

  const handleDelete = (name: string) => {
    // Buscar la etiqueta para verificar si esta en uso antes de la confirmacion
    const tag = tags.find(t => t.name === name);
    if (!tag) return;

    if ((tag.product_count || 0) > 0) {
      notifyError('Etiqueta en uso', `No se puede eliminar: esta asociada a ${tag.product_count} producto(s)`);
      return;
    }

    if (window.confirm(`Estas seguro de eliminar la etiqueta "${tag.label}"?`)) {
      deleteMutation.mutate(name);
    }
  };

  // Derivados
  const totalTags = tags.length;
  const totalProductsWithTags = tags.reduce((sum, tag) => sum + (tag.product_count || 0), 0);

  return (
    <div className="space-y-6">
      <TagsHeader 
        totalTags={totalTags}
        totalProductsUsed={totalProductsWithTags}
        search={searchQuery}
        setSearch={setSearchQuery}
      />

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-primary border-r-transparent"></div>
        </div>
      ) : (
        <TagGrid 
          tags={tags}
          searchQuery={searchQuery}
          isCreating={actingTagCard === TAG_ACTION.CREATING}
          isDeleting={actingTagCard?.startsWith(`${TAG_ACTION.DELETING}_`) ? actingTagCard.split('_')[1] : null}
          isRenaming={actingTagCard?.startsWith(`${TAG_ACTION.RENAMING}_`) ? actingTagCard.split('_')[1] : null}
          onCreate={handleCreate}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
