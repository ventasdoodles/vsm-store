/**
 * CustomerFormModal — Modal de Creación de Cliente
 * 
 * Formulario de dos columnas: datos personales (nombre, email, teléfono)
 * y dirección de entrega. Crea usuario en Supabase Auth + profile + address
 * usando un cliente temporal para no cerrar la sesión admin.
 * 
 * @module admin/customers
 */
import { useState } from 'react';
import { X, User, MapPin, Mail, Loader2, Save } from 'lucide-react';
import { createCustomerWithDetails, type CreateCustomerData } from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';

interface CustomerFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function CustomerFormModal({ isOpen, onClose, onSuccess }: CustomerFormModalProps) {
    const [loading, setLoading] = useState(false);
    const { success, error } = useNotification();
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

            success(
                'Cliente creado',
                'El cliente y su dirección han sido registrados correctamente.'
            );
            onSuccess();
            onClose();
        } catch (err: unknown) {
            console.error(err);
            error(
                'Error',
                err instanceof Error ? err.message : 'No se pudo crear el cliente.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#13141f] shadow-2xl relative">
                {/* Glow ambiental */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.02] px-8 py-6 relative z-10">
                    <h2 className="text-xl font-black text-theme-primary flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                            <User className="h-5 w-5" />
                        </div>
                        Nuevo Cliente
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl p-2 text-theme-secondary hover:bg-white/10 hover:text-white transition-all hover:rotate-90 duration-300"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form id="customer-form" onSubmit={handleSubmit} className="flex flex-col md:flex-row h-[75vh] md:h-auto overflow-hidden relative z-10">
                    {/* Col 1: Datos Personales */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 border-b md:border-b-0 md:border-r border-white/5 custom-scrollbar">
                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Datos de Cuenta
                        </h3>

                        <div className="grid gap-5">
                            <div>
                                <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Nombre Completo *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.full_name}
                                    onChange={e => handleChange('full_name', e.target.value)}
                                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-blue-500 focus:ring-4 outline-none focus:ring-blue-500/10 transition-all placeholder:text-theme-secondary/30"
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Correo Electrónico *</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => handleChange('email', e.target.value)}
                                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-blue-500 focus:ring-4 outline-none focus:ring-blue-500/10 transition-all placeholder:text-theme-secondary/30"
                                    placeholder="cliente@ejemplo.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Contraseña (Opcional)</label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={e => handleChange('password', e.target.value)}
                                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-blue-500 focus:ring-4 outline-none focus:ring-blue-500/10 transition-all placeholder:text-theme-secondary/30"
                                    placeholder="Predeterminada: Temporal123!"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Teléfono *</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => handleChange('phone', e.target.value)}
                                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-blue-500 focus:ring-4 outline-none focus:ring-blue-500/10 transition-all placeholder:text-theme-secondary/30"
                                        placeholder="10 dígitos"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">WhatsApp *</label>
                                    <input
                                        required
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={e => handleChange('whatsapp', e.target.value)}
                                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-blue-500 focus:ring-4 outline-none focus:ring-blue-500/10 transition-all placeholder:text-theme-secondary/30"
                                        placeholder="10 dígitos"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Col 2: Dirección */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-white/[0.02] custom-scrollbar">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            Dirección de Entrega
                        </h3>

                        <div className="grid gap-5">
                            <div className="grid grid-cols-3 gap-5">
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Calle *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address.street}
                                        onChange={e => handleAddressChange('street', e.target.value)}
                                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-indigo-500 focus:ring-4 outline-none focus:ring-indigo-500/10 transition-all placeholder:text-theme-secondary/30"
                                        placeholder="Av. Principal"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Número *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address.number}
                                        onChange={e => handleAddressChange('number', e.target.value)}
                                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-indigo-500 focus:ring-4 outline-none focus:ring-indigo-500/10 transition-all placeholder:text-theme-secondary/30"
                                        placeholder="#123"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Colonia *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address.colony}
                                        onChange={e => handleAddressChange('colony', e.target.value)}
                                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-indigo-500 focus:ring-4 outline-none focus:ring-indigo-500/10 transition-all placeholder:text-theme-secondary/30"
                                        placeholder="Centro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">C.P. *</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.address.zip_code}
                                        onChange={e => handleAddressChange('zip_code', e.target.value)}
                                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-indigo-500 focus:ring-4 outline-none focus:ring-indigo-500/10 transition-all placeholder:text-theme-secondary/30"
                                        placeholder="91000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Referencias</label>
                                <textarea
                                    value={formData.address.references || ''}
                                    onChange={e => handleAddressChange('references', e.target.value)}
                                    rows={2}
                                    className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-indigo-500 focus:ring-4 outline-none focus:ring-indigo-500/10 transition-all placeholder:text-theme-secondary/30 resize-none custom-scrollbar"
                                    placeholder="Casa azul con portón negro..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Ciudad</label>
                                    <input
                                        type="text"
                                        value={formData.address.city}
                                        onChange={e => handleAddressChange('city', e.target.value)}
                                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-indigo-500 focus:ring-4 outline-none focus:ring-indigo-500/10 transition-all placeholder:text-theme-secondary/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-theme-secondary/70 uppercase tracking-widest mb-2">Estado</label>
                                    <input
                                        type="text"
                                        value={formData.address.state}
                                        onChange={e => handleAddressChange('state', e.target.value)}
                                        className="w-full rounded-xl border border-white/5 bg-black/40 px-4 py-3 text-sm font-medium text-theme-primary focus:border-indigo-500 focus:ring-4 outline-none focus:ring-indigo-500/10 transition-all placeholder:text-theme-secondary/30"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 border-t border-white/5 bg-black/40 px-8 py-5 relative z-10">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl px-5 py-3 text-sm font-bold text-theme-secondary hover:bg-white/10 hover:text-white transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="customer-form"
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3 text-sm font-black text-white hover:from-blue-400 hover:to-indigo-500 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Creando Perfil...
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
