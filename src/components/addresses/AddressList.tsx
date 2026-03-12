/**
 * // ─── COMPONENTE: ADDRESS LIST ───
 * // Propósito: Orquestación de la lista de direcciones y gestión de formularios.
 * // Arquitectura: Pure presentation with business logic hook integration (§1.1).
 * // Estilo: High-End Premium Content Grouping (§2.1).
 */
import { useState } from 'react';
import { Plus, Loader2, MapPin } from 'lucide-react';
import { AddressCard } from './AddressCard';
import { AddressForm } from './AddressForm';
import { useAddresses, useCreateAddress, useUpdateAddress, useDeleteAddress, useSetDefaultAddress } from '@/hooks/useAddresses';
import { useNotification } from '@/hooks/useNotification';
import { cn } from '@/lib/utils';
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
        // TODO: Migrar a Custom Confirmation Modal (Wave 47)
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
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-accent-primary opacity-20" />
                <p className="text-[10px] font-black text-theme-tertiary uppercase tracking-widest">Sincronizando libreta...</p>
            </div>
        );
    }

    // Mostrar form de crear/editar
    if (showForm || editingAddress) {
        return (
            <div className="vsm-surface glass-premium p-8">
                <AddressForm
                    address={editingAddress}
                    customerId={customerId}
                    onSubmit={editingAddress ? handleUpdate : handleCreate}
                    onCancel={() => { setShowForm(false); setEditingAddress(null); }}
                    loading={createMutation.isPending || updateMutation.isPending}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {filtered.length === 0 ? (
                <div className="vsm-surface glass-premium p-12 text-center space-y-6">
                    <div className="mx-auto h-20 w-20 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 flex items-center justify-center">
                        <MapPin className="h-10 w-10 text-theme-tertiary opacity-30" />
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-black text-white uppercase tracking-tight">Sin destinos registrados</p>
                        <p className="text-[10px] text-theme-tertiary font-bold uppercase tracking-widest opacity-60">Parece que aún no has guardado ninguna dirección.</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="vsm-button-primary inline-flex gap-3 px-8"
                    >
                        <Plus className="h-4 w-4" />
                        Añadir Primera Dirección
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filtered.map((addr) => (
                        <div
                            key={addr.id}
                            onClick={selectable ? () => onSelect?.(addr) : undefined}
                            className={cn(
                                "transition-all duration-300",
                                selectable ? 'cursor-pointer' : ''
                            )}
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
                        className="group w-full py-8 border-2 border-dashed border-white/5 rounded-[2.5rem] hover:border-accent-primary/20 hover:bg-accent-primary/5 transition-all duration-500 flex flex-col items-center justify-center gap-3"
                    >
                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-accent-primary/10 group-hover:border-accent-primary/20 transition-all duration-500">
                             <Plus className="h-6 w-6 text-theme-tertiary group-hover:text-accent-primary transition-colors" />
                        </div>
                        <span className="text-[10px] font-black text-theme-tertiary uppercase tracking-[0.2em] group-hover:text-white transition-colors">Añadir Nueva Dirección</span>
                    </button>
                </div>
            )}
        </div>
    );
}
