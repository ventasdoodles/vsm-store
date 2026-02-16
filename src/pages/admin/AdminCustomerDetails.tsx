import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Phone, Mail, MapPin, Tag, Plus, X,
    Save, FileText, Image as ImageIcon, Trash2, Upload, ArrowLeft,
    AlertTriangle, Ban, Megaphone, Send, ShieldAlert
} from 'lucide-react';
import {
    getAdminCustomerDetails,
    updateAdminCustomerNotes,
    updateCustomerStatus,
    sendCustomerNotification,
    uploadCustomerEvidence
} from '@/services/admin.service';
import { useNotificationsStore } from '@/stores/notifications.store';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
};

export function AdminCustomerDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationsStore();

    // State for edits
    const [newTag, setNewTag] = useState('');
    const [newFieldKey, setNewFieldKey] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');
    const [notes, setNotes] = useState('');
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');

    const { data: customer, isLoading } = useQuery({
        queryKey: ['admin', 'customer', id],
        queryFn: () => getAdminCustomerDetails(id!),
        enabled: !!id,
    });

    // Populate notes local state when data loads
    useEffect(() => {
        if (customer?.admin_notes?.notes) {
            setNotes(customer.admin_notes.notes);
        }
    }, [customer]);

    // Mutation: Update Notes/Tags/Fields
    const updateMutation = useMutation({
        mutationFn: (data: any) => updateAdminCustomerNotes(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', id] });
            addNotification({ type: 'success', title: 'Guardado', message: 'Datos actualizados correctamente' });
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo guardar los cambios' });
        }
    });

    // Mutation: Update Status
    const updateStatusMutation = useMutation({
        mutationFn: ({ status, end }: { status: 'active' | 'suspended' | 'banned', end?: string }) =>
            updateCustomerStatus(id!, status, end),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', id] });
            addNotification({ type: 'success', title: 'Estado Actualizado', message: 'El estado del usuario ha cambiado.' });
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo actualizar el estado.' });
        }
    });

    // Mutation: Send Notification
    const sendNotificationMutation = useMutation({
        mutationFn: () => sendCustomerNotification(id!, notifTitle, notifMessage, 'info'),
        onSuccess: () => {
            setNotifTitle('');
            setNotifMessage('');
            addNotification({ type: 'success', title: 'Mensaje Enviado', message: 'El usuario recibirá la notificación.' });
        },
        onError: () => {
            addNotification({ type: 'error', title: 'Error', message: 'No se pudo enviar el mensaje.' });
        }
    });

    const handleSendNotification = () => {
        if (!notifTitle.trim() || !notifMessage.trim()) {
            addNotification({ type: 'error', title: 'Campos vacíos', message: 'Escribe un título y mensaje.' });
            return;
        }
        sendNotificationMutation.mutate();
    };

    // Mutation: Upload Evidence
    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadCustomerEvidence(id!, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', id] });
            addNotification({ type: 'success', title: 'Subido', message: 'Archivo subido correctamente' });
        },
        onError: (err: any) => {
            addNotification({ type: 'error', title: 'Error', message: err.message || 'Error al subir archivo' });
        }
    });

    const handleAddTag = () => {
        if (!newTag.trim() || !customer) return;
        const currentTags = customer.admin_notes?.tags || [];
        if (currentTags.includes(newTag.trim())) return;

        updateMutation.mutate({
            tags: [...currentTags, newTag.trim()]
        });
        setNewTag('');
    };

    const handleRemoveTag = (tag: string) => {
        if (!customer) return;
        const currentTags = customer.admin_notes?.tags || [];
        updateMutation.mutate({
            tags: currentTags.filter(t => t !== tag)
        });
    };

    const handleAddField = () => {
        if (!newFieldKey.trim() || !newFieldValue.trim() || !customer) return;
        const currentFields = customer.admin_notes?.custom_fields || {};

        updateMutation.mutate({
            custom_fields: { ...currentFields, [newFieldKey.trim()]: newFieldValue.trim() }
        });
        setNewFieldKey('');
        setNewFieldValue('');
    };

    const handleRemoveField = (key: string) => {
        if (!customer) return;
        const currentFields = { ...customer.admin_notes?.custom_fields };
        delete currentFields[key];
        updateMutation.mutate({ custom_fields: currentFields });
    };

    const handleSaveNotes = () => {
        updateMutation.mutate({ notes });
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadMutation.mutate(e.target.files[0]);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-primary-400">Cargando perfil...</div>;
    if (!customer) return <div className="p-8 text-center text-red-400">Cliente no encontrado</div>;

    const stats = customer.orders_summary;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/customers')} className="rounded-xl p-2 hover:bg-primary-900/50 text-primary-400">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-primary-100 flex items-center gap-2">
                        {customer.full_name || 'Sin Nombre'}
                        {customer.admin_notes?.tags?.includes('VIP') && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">VIP</span>
                        )}
                    </h1>
                    <div className="flex gap-4 text-sm text-primary-500 mt-1">
                        <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone || '--'}</span>
                        <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email || 'No email'}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-primary-800 bg-primary-900/40 p-4">
                    <div className="text-xs text-primary-500 mb-1">Total Gastado</div>
                    <div className="text-xl font-bold text-herbal-400">{formatCurrency(stats?.total_spent || 0)}</div>
                </div>
                <div className="rounded-xl border border-primary-800 bg-primary-900/40 p-4">
                    <div className="text-xs text-primary-500 mb-1">Pedidos</div>
                    <div className="text-xl font-bold text-primary-100">{stats?.total_orders || 0}</div>
                </div>
                <div className="rounded-xl border border-primary-800 bg-primary-900/40 p-4">
                    <div className="text-xs text-primary-500 mb-1">Ticket Promedio</div>
                    <div className="text-xl font-bold text-blue-400">{formatCurrency(stats?.aov || 0)}</div>
                </div>
                <div className="rounded-xl border border-primary-800 bg-primary-900/40 p-4">
                    <div className="text-xs text-primary-500 mb-1">Última Compra</div>
                    <div className="text-sm font-bold text-primary-100">
                        {stats?.last_order_date ? new Date(stats.last_order_date).toLocaleDateString() : 'N/A'}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Col: CRM Controls */}
                <div className="md:col-span-2 space-y-6">
                    {/* Tags Section */}
                    <div className="rounded-2xl border border-primary-800 bg-primary-900/20 p-5">
                        <h3 className="text-sm font-semibold text-vape-400 mb-4 flex items-center gap-2">
                            <Tag className="h-4 w-4" /> Etiquetas
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {customer.admin_notes?.tags?.map(tag => (
                                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-800/50 text-xs font-medium text-primary-200 border border-primary-700">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400"><X className="h-3 w-3" /></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newTag}
                                onChange={e => setNewTag(e.target.value)}
                                placeholder="Nueva etiqueta (ej. VIP)..."
                                className="flex-1 bg-primary-950/50 border border-primary-800 rounded-lg px-3 py-1.5 text-sm text-primary-200"
                                onKeyDown={e => e.key === 'Enter' && handleAddTag()}
                            />
                            <button onClick={handleAddTag} className="bg-primary-800 hover:bg-primary-700 text-primary-200 p-1.5 rounded-lg"><Plus className="h-4 w-4" /></button>
                        </div>
                    </div>

                    {/* Custom Fields Section */}
                    <div className="rounded-2xl border border-primary-800 bg-primary-900/20 p-5">
                        <h3 className="text-sm font-semibold text-blue-400 mb-4 flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Campos Personalizados
                        </h3>
                        <div className="space-y-3 mb-4">
                            {Object.entries(customer.admin_notes?.custom_fields || {}).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between bg-primary-950/30 p-2 rounded-lg border border-primary-800/50">
                                    <div className="text-sm">
                                        <span className="text-primary-500 block text-xs">{key}</span>
                                        <span className="text-primary-200">{value}</span>
                                    </div>
                                    <button onClick={() => handleRemoveField(key)} className="text-primary-600 hover:text-red-400 p-1">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {Object.keys(customer.admin_notes?.custom_fields || {}).length === 0 && (
                                <div className="text-sm text-primary-600 italic">No hay campos personalizados</div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={newFieldKey}
                                onChange={e => setNewFieldKey(e.target.value)}
                                placeholder="Campo (ej. Sabor Favorito)"
                                className="bg-primary-950/50 border border-primary-800 rounded-lg px-3 py-1.5 text-sm text-primary-200"
                            />
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newFieldValue}
                                    onChange={e => setNewFieldValue(e.target.value)}
                                    placeholder="Valor (ej. Menta)"
                                    className="flex-1 bg-primary-950/50 border border-primary-800 rounded-lg px-3 py-1.5 text-sm text-primary-200"
                                    onKeyDown={e => e.key === 'Enter' && handleAddField()}
                                />
                                <button onClick={handleAddField} className="bg-primary-800 hover:bg-primary-700 text-primary-200 p-1.5 rounded-lg"><Plus className="h-4 w-4" /></button>
                            </div>
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div className="rounded-2xl border border-primary-800 bg-primary-900/20 p-5">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-sm font-semibold text-primary-400">Notas Generales</h3>
                            <button onClick={handleSaveNotes} className="text-xs text-vape-400 hover:text-vape-300 flex items-center gap-1">
                                <Save className="h-3 w-3" /> Guardar
                            </button>
                        </div>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={4}
                            className="w-full bg-primary-950/50 border border-primary-800 rounded-lg p-3 text-sm text-primary-200 focus:border-vape-500 outline-none resize-none"
                            placeholder="Notas privadas sobre este cliente..."
                        />
                    </div>
                </div>

                {/* Right Col: Evidence & Info */}
                <div className="space-y-6">
                    {/* Evidence Gallery */}
                    <div className="rounded-2xl border border-primary-800 bg-primary-900/20 p-5">
                        <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" /> Archivo / Evidencia
                        </h3>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            {customer.evidence?.map((file, i) => (
                                <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border border-primary-800 hover:border-primary-600 transition-colors group">
                                    <img src={file.url} alt="Evidence" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-xs text-white">Ver</span>
                                    </div>
                                </a>
                            ))}
                        </div>

                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-primary-800 rounded-xl cursor-pointer hover:border-primary-600 hover:bg-primary-800/30 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {uploadMutation.isPending ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-400" />
                                ) : (
                                    <>
                                        <Upload className="w-6 h-6 text-primary-500 mb-1" />
                                        <p className="text-xs text-primary-500">Subir Captura</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                        </label>
                    </div>

                    {/* Address Card */}
                    {customer.addresses?.[0] && (
                        <div className="rounded-2xl border border-primary-800 bg-primary-900/20 p-5">
                            <h3 className="text-sm font-semibold text-herbal-400 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Dirección Principal
                            </h3>
                            <div className="text-sm text-primary-300">
                                <p>{customer.addresses[0].street} #{customer.addresses[0].number}</p>
                                <p>{customer.addresses[0].colony}</p>
                                <p>{customer.addresses[0].city}, {customer.addresses[0].state}</p>
                                {customer.addresses[0].references && (
                                    <p className="mt-2 text-xs text-primary-500 italic">"{customer.addresses[0].references}"</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* God Mode Actions */}
            <div className="rounded-2xl border border-red-900/30 bg-red-950/10 p-5">
                <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4" /> Zona de Dios (Acciones)
                </h3>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    <button
                        onClick={() => updateStatusMutation.mutate({ status: 'active' })}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all ${customer.account_status === 'active' || !customer.account_status ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-primary-900/40 text-primary-500 border-primary-800 hover:text-green-400'}`}
                    >
                        Activo
                    </button>
                    <button
                        onClick={() => updateStatusMutation.mutate({ status: 'suspended' })}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all ${customer.account_status === 'suspended' ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-primary-900/40 text-primary-500 border-primary-800 hover:text-orange-400'}`}
                    >
                        Suspender
                    </button>
                    <button
                        onClick={() => updateStatusMutation.mutate({ status: 'banned' })}
                        className={`p-2 rounded-lg text-xs font-bold border transition-all ${customer.account_status === 'banned' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-primary-900/40 text-primary-500 border-primary-800 hover:text-red-400'}`}
                    >
                        Banear
                    </button>
                </div>

                {customer.account_status === 'suspended' && (
                    <div className="mb-4">
                        <label className="text-xs text-primary-500 mb-1 block">Fin de suspensión (Opcional)</label>
                        <input
                            type="date"
                            className="w-full bg-primary-950/50 border border-primary-800 rounded-lg p-2 text-sm text-primary-200"
                            onChange={(e) => updateStatusMutation.mutate({ status: 'suspended', end: new Date(e.target.value).toISOString() })}
                        />
                    </div>
                )}

                <div className="border-t border-primary-800/50 pt-4 mt-4">
                    <h4 className="text-xs font-semibold text-primary-400 mb-2 flex items-center gap-1">
                        <Megaphone className="h-3 w-3" /> Enviar Aviso
                    </h4>
                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Título (ej. Advertencia)"
                            className="w-full bg-primary-950/50 border border-primary-800 rounded-lg p-2 text-sm text-primary-200"
                            value={notifTitle}
                            onChange={e => setNotifTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Mensaje al usuario (no puede responder)..."
                            rows={3}
                            className="w-full bg-primary-950/50 border border-primary-800 rounded-lg p-2 text-sm text-primary-200 resize-none"
                            value={notifMessage}
                            onChange={e => setNotifMessage(e.target.value)}
                        />
                        <button
                            onClick={handleSendNotification}
                            disabled={sendNotificationMutation.isPending}
                            className="w-full bg-primary-800 hover:bg-primary-700 text-primary-200 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                        >
                            <Send className="h-3 w-3" />
                            {sendNotificationMutation.isPending ? 'Enviando...' : 'Enviar Mensaje'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
