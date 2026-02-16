import { useState } from 'react';
import { X, User, MapPin, Mail, Loader2, Save } from 'lucide-react';
import { createCustomerWithDetails, type CreateCustomerData } from '@/services/admin.service';
import { useNotificationsStore } from '@/stores/notifications.store';

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CustomerFormModal({ isOpen, onClose, onSuccess }: CustomerFormModalProps) {
    const [loading, setLoading] = useState(false);
    const { addNotification } = useNotificationsStore();
    const [formData, setFormData] = useState<CreateCustomerData>({
        email: '',
        password: '', // Optional, defaults to Temporal123!
        full_name: '',
        phone: '',
        whatsapp: '',
        address: {
            label: 'Casa',
            type: 'shipping',
            full_name: '', // Will autocomplete with main name
            street: '',
            number: '',
            colony: '',
            zip_code: '',
            city: 'Xalapa',
            state: 'Veracruz',
            references: '',
            phone: '', // Will autocomplete
        }
    });

    if (!isOpen) return null;

    const handleChange = (field: keyof CreateCustomerData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: value }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Auto-fill address fields if empty
            const finalData = { ...formData };
            if (!finalData.address.full_name) finalData.address.full_name = finalData.full_name;
            if (!finalData.address.phone) finalData.address.phone = finalData.phone;

            await createCustomerWithDetails(finalData);

            addNotification({
                type: 'success',
                title: 'Cliente creado',
                message: 'El cliente y su dirección han sido registrados correctamente.',
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            addNotification({
                type: 'error',
                title: 'Error',
                message: error.message || 'No se pudo crear el cliente.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-primary-800 bg-primary-950 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-primary-800 bg-primary-900/50 px-6 py-4">
                    <h2 className="text-lg font-bold text-primary-100 flex items-center gap-2">
                        <User className="h-5 w-5 text-vape-400" />
                        Nuevo Cliente
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 text-primary-400 hover:bg-primary-800 hover:text-primary-200 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row h-[70vh] md:h-auto overflow-hidden">
                    {/* Col 1: Datos Personales */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 border-b md:border-b-0 md:border-r border-primary-800/50 scrollbar-thin">
                        <h3 className="text-sm font-semibold text-vape-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            Datos de Cuenta
                        </h3>

                        <div className="grid gap-4">
                            <div>
                                <label className="block text-xs font-medium text-primary-400 mb-1">Nombre Completo *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => handleChange('full_name', e.target.value)}
                                    className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-vape-500 focus:outline-none"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-primary-400 mb-1">Correo Electrónico *</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-vape-500 focus:outline-none"
                                    placeholder="cliente@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-primary-400 mb-1">Contraseña (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={e => handleChange('password', e.target.value)}
                                    className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-vape-500 focus:outline-none"
                                    placeholder="Predeterminada: Temporal123!"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-primary-400 mb-1">Teléfono *</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => handleChange('phone', e.target.value)}
                                        className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-vape-500 focus:outline-none"
                                        placeholder="228..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-primary-400 mb-1">WhatsApp *</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={e => handleChange('whatsapp', e.target.value)}
                                        className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-vape-500 focus:outline-none"
                                        placeholder="228..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Col 2: Dirección */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-primary-900/20 scrollbar-thin">
                        <h3 className="text-sm font-semibold text-herbal-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Dirección de Entrega
                        </h3>

                        <div className="grid gap-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-primary-400 mb-1">Calle *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address.street}
                                        onChange={e => handleAddressChange('street', e.target.value)}
                                        className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-herbal-500 focus:outline-none"
                                        placeholder="Av. Xalapa"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-primary-400 mb-1">Número *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address.number}
                                        onChange={e => handleAddressChange('number', e.target.value)}
                                        className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-herbal-500 focus:outline-none"
                                        placeholder="#123"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-primary-400 mb-1">Colonia *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address.colony}
                                        onChange={e => handleAddressChange('colony', e.target.value)}
                                        className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-herbal-500 focus:outline-none"
                                        placeholder="Centro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-primary-400 mb-1">Código Postal *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address.zip_code}
                                        onChange={e => handleAddressChange('zip_code', e.target.value)}
                                        className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-herbal-500 focus:outline-none"
                                        placeholder="91000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-primary-400 mb-1">Referencias</label>
                                <textarea
                                    value={formData.address.references || ''}
                                    onChange={e => handleAddressChange('references', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-herbal-500 focus:outline-none resize-none"
                                    placeholder="Casa color azul, portón negro, junto a la tienda..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-primary-400 mb-1">Ciudad</label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={e => handleAddressChange('city', e.target.value)}
                                        className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-herbal-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-primary-400 mb-1">Estado</label>
                                    <input
                                        type="text"
                                        value={formData.address.state}
                                        onChange={e => handleAddressChange('state', e.target.value)}
                                        className="w-full rounded-lg border border-primary-800 bg-primary-900/50 p-2.5 text-sm text-primary-100 focus:border-herbal-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-primary-800 bg-primary-900/50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-4 py-2.5 text-sm font-medium text-primary-400 hover:text-primary-200 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-vape-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-vape-900/20 transition-all hover:bg-vape-500 hover:shadow-vape-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creando...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4" />
                                Crear Cliente
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
