// Lista de direcciones - VSM Store
import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '@/hooks/useAddresses';
import { useNotification } from '@/hooks/useNotification';
import type { Address, AddressData } from '@/services/addresses.service';

interface AddressListProps {
    customerId: string;
    type?: 'shipping' | 'billing';
    selectable?: boolean;
    selectedId?: string;
    onSelect?: (address: Address) => void;
}

export function AddressList({ customerId, type, selectable, selectedId, onSelect }: AddressListProps) {
    const { data: addresses = [], isLoading } = useAddresses(customerId);
    const createMutation = useCreateAddress();
    const updateMutation = useUpdateAddress();
    const deleteMutation = useDeleteAddress();
    const setDefaultMutation = useSetDefaultAddress();
    const { success, info } = useNotification();

    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const filtered = type ? addresses.filter((a) => a.type === type) : addresses;

    const handleCreate = async (data: AddressData) => {
        await createMutation.mutateAsync(data);
        success('Dirección guardada', 'Tu nueva dirección ha sido añadida correctamente.');
        setShowForm(false);
    };

    const handleUpdate = async (data: AddressData) => {
        if (!editingAddress) return;
        await updateMutation.mutateAsync({ id: editingAddress.id, data });
        success('Dirección actualizada', 'Los cambios han sido guardados.');
        setEditingAddress(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta dirección?')) return;
        await deleteMutation.mutateAsync(id);
        info('Dirección eliminada', 'Se ha removido la dirección de tu lista.');
    };

    const handleSetDefault = (id: string) => {
        const addr = addresses.find((a) => a.id === id);
        if (!addr) return;
        setDefaultMutation.mutate({ id, customerId, type: addr.type as 'shipping' | 'billing' });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
        );
    }

    // Mostrar form de crear/editar
    if (showForm || editingAddress) {
        return (
            <AddressForm
                address={editingAddress}
                customerId={customerId}
                onSubmit={editingAddress ? handleUpdate : handleCreate}
                onCancel={() => { setShowForm(false); setEditingAddress(null); }}
                loading={createMutation.isPending || updateMutation.isPending}
            />
        );
    }

    return (
        <div className="space-y-3">
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-theme py-10 text-center">
                    <p className="text-sm text-primary-600 mb-3">No hay direcciones registradas</p>
                    <button
                        onClick={() => setShowForm(true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-vape-500/10 px-4 py-2 text-sm font-medium text-vape-400 hover:bg-vape-500/20 transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar dirección
                    </button>
                </div>
            ) : (
                <>
                    {filtered.map((addr) => (
                        <div
                            key={addr.id}
                            onClick={selectable ? () => onSelect?.(addr) : undefined}
                            className={selectable ? 'cursor-pointer' : ''}
                        >
                            <AddressCard
                                address={addr}
                                selected={selectedId === addr.id}
                                onEdit={selectable ? undefined : (a) => setEditingAddress(a)}
                                onDelete={selectable ? undefined : handleDelete}
                                onSetDefault={selectable ? undefined : handleSetDefault}
                                compact={selectable}
                            />
                        </div>
                    ))}
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-theme py-3 text-sm text-theme-primary0 hover:border-theme hover:text-theme-secondary transition-colors"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Agregar dirección
                    </button>
                </>
            )}
        </div>
    );
}
