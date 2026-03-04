/**
 * // ─── COMPONENTE: AdminTags ───
 * // Arquitectura: Page Orchestrator (Lego Master)
 * // Proposito principal: Orquestar el estado, las mutaciones y busquedas de etiquetas.
 * // Regla / Notas: Refactorizado para vista compacta (tabla), modal create/edit,
 * //   paginación y stats. Homogenizado con AdminBrands.
 */
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import { Pagination, paginateItems } from '@/components/admin/Pagination';

// API Services
import {
  getAllTags,
  createTag,
  renameTag,
  deleteTag,
} from '@/services/admin/admin-tags.service';
import type { ProductTag } from '@/services/admin/admin-tags.service';

// Legos
import { TagsHeader } from '@/components/admin/tags/TagsHeader';
import { TagsStats } from '@/components/admin/tags/TagsStats';
import { TagsFilters } from '@/components/admin/tags/TagsFilters';
import { TagsTable } from '@/components/admin/tags/TagsTable';
import { TagFormModal } from '@/components/admin/tags/TagFormModal';
import type { TagFormData } from '@/components/admin/tags/TagFormModal';

const EMPTY_FORM: TagFormData = { label: '', name: '' };
const PAGE_SIZE = 20;

export function AdminTags() {
  const queryClient = useQueryClient();
  const { success, error: notifyError } = useNotification();

  // Estado UI
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [form, setForm] = useState<TagFormData>(EMPTY_FORM);

  // Estado para UX de Mutaciones (loaders individuales)
  const [deletingTag, setDeletingTag] = useState<string | null>(null);

  // Queries
  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['admin-tags'],
    queryFn: getAllTags,
  });

  // Mutaciones
  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-tags'] });
    queryClient.invalidateQueries({ queryKey: ['tags'] });
  };

  const createMutation = useMutation({
    mutationFn: ({ name, label }: { name: string; label: string }) =>
      createTag(name, label),
    onSuccess: (_, vars) => {
      refreshData();
      handleCloseModal();
      success('Etiqueta creada', `La etiqueta "${vars.label}" se creó con éxito.`);
    },
    onError: (e: Error) =>
      notifyError(
        'Error al crear',
        e.message?.includes('duplicate') ? 'La etiqueta ya existe.' : 'Error inesperado.'
      ),
  });

  const renameMutation = useMutation({
    mutationFn: ({ oldName, newLabel }: { oldName: string; newLabel: string }) => {
      const newName = newLabel
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return renameTag(oldName, newName, newLabel);
    },
    onSuccess: (_, vars) => {
      refreshData();
      handleCloseModal();
      success('Etiqueta actualizada', `Cambiaste el nombre a "${vars.newLabel}"`);
    },
    onError: (e: Error) =>
      notifyError('Error al renombrar', e.message || 'Error inesperado.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onMutate: (name) => setDeletingTag(name),
    onSuccess: () => {
      refreshData();
      success('Etiqueta eliminada', 'Se removió la etiqueta correctamente.');
    },
    onError: (e: Error) =>
      notifyError('No se pudo eliminar', e.message || 'Error inesperado.'),
    onSettled: () => setDeletingTag(null),
  });

  // Filtering & Derived Data
  const filtered = useMemo(() => {
    if (!search.trim()) return tags;
    const q = search.toLowerCase();
    return tags.filter(
      (t) =>
        t.label.toLowerCase().includes(q) || t.name.toLowerCase().includes(q)
    );
  }, [tags, search]);

  const stats = useMemo(() => {
    const total = tags.length;
    const productsTagged = tags.reduce((sum, t) => sum + (t.product_count || 0), 0);
    const mostUsed = tags.length > 0
      ? [...tags].sort((a, b) => (b.product_count || 0) - (a.product_count || 0))[0]
      : null;
    return { total, productsTagged, mostUsedTag: mostUsed?.label ?? null };
  }, [tags]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = paginateItems(filtered, safePage, PAGE_SIZE);
  const startItem = (safePage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safePage * PAGE_SIZE, filtered.length);

  // Modal handlers
  const handleOpenCreate = () => {
    setEditingName(null);
    setForm(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tag: ProductTag) => {
    setEditingName(tag.name);
    setForm({ label: tag.label, name: tag.name });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingName(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    if (!form.label.trim() || !form.name.trim()) {
      notifyError('Validación', 'El nombre de la etiqueta es obligatorio.');
      return;
    }

    if (editingName) {
      renameMutation.mutate({ oldName: editingName, newLabel: form.label });
    } else {
      createMutation.mutate({ name: form.name, label: form.label });
    }
  };

  const handleDelete = (name: string) => {
    const tag = tags.find((t) => t.name === name);
    if (!tag) return;

    if ((tag.product_count || 0) > 0) {
      notifyError(
        'Etiqueta en uso',
        `No se puede eliminar: está asociada a ${tag.product_count} producto(s)`
      );
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar la etiqueta "${tag.label}"?`)) {
      deleteMutation.mutate(name);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-accent-primary/20 blur-xl rounded-full" />
          <Loader2 className="h-10 w-10 animate-spin text-accent-primary relative z-10" />
        </div>
        <p className="text-theme-secondary font-medium tracking-wide animate-pulse">
          Cargando etiquetas...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6">
      <TagsHeader onNew={handleOpenCreate} />

      <TagsStats
        total={stats.total}
        productsTagged={stats.productsTagged}
        mostUsedTag={stats.mostUsedTag}
      />

      <div className="bg-[#181825]/50 rounded-3xl p-4 sm:p-6 border border-white/5 space-y-4">
        <TagsFilters
          search={search}
          onSearchChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />

        <TagsTable
          tags={paginated}
          deletingName={deletingTag}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />

        {filtered.length > PAGE_SIZE && (
          <div className="pt-4 border-t border-white/5 flex justify-center">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              itemsLabel={`${startItem}–${endItem} de ${filtered.length} etiquetas`}
            />
          </div>
        )}
      </div>

      <TagFormModal
        isOpen={isModalOpen}
        editingName={editingName}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        onCancel={handleCloseModal}
        isPending={createMutation.isPending || renameMutation.isPending}
      />
    </div>
  );
}
