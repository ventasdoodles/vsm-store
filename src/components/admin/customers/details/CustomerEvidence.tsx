import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { uploadCustomerEvidence } from '@/services/admin';
import { useNotificationsStore } from '@/stores/notifications.store';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerEvidence({ customer }: Props) {
    const queryClient = useQueryClient();
    const { addNotification } = useNotificationsStore();

    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadCustomerEvidence(customer.id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customer.id] });
            addNotification({ type: 'success', title: 'Subido', message: 'Archivo subido correctamente' });
        },
        onError: (err: Error) => {
            addNotification({ type: 'error', title: 'Error', message: err.message || 'Error al subir archivo' });
        }
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadMutation.mutate(e.target.files[0]);
        }
    };

    return (
        <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5">
            <h3 className="text-sm font-semibold text-accent-primary mb-4 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Archivo / Evidencia
            </h3>

            <div className="grid grid-cols-2 gap-2 mb-4">
                {customer.evidence?.map((file, i) => (
                    <a key={i} href={file.url} target="_blank" rel="noopener noreferrer" className="block relative aspect-square rounded-lg overflow-hidden border border-theme hover:border-theme transition-colors group">
                        <img src={file.url} alt="Evidence" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-xs text-white">Ver</span>
                        </div>
                    </a>
                ))}
            </div>

            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-theme rounded-xl cursor-pointer hover:border-theme hover:bg-theme-secondary/30 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadMutation.isPending ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-theme" />
                    ) : (
                        <>
                            <Upload className="w-6 h-6 text-theme-primary0 mb-1" />
                            <p className="text-xs text-theme-primary0">Subir Captura</p>
                        </>
                    )}
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
        </div>
    );
}
