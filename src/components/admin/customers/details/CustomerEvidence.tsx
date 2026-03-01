/**
 * CustomerEvidence — Bóveda de Evidencia
 * 
 * Almacén visual de documentos del cliente (fotos, identificaciones, tickets).
 * Soporta drag & drop y upload directo a Supabase Storage.
 * Muestra los archivos existentes en un grid con preview y enlace externo.
 * 
 * @module admin/customers/details
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Camera, ExternalLink, Loader2, ImagePlus } from 'lucide-react';
import { uploadCustomerEvidence } from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerEvidence({ customer }: Props) {
    const queryClient = useQueryClient();
    const notify = useNotification();

    const uploadMutation = useMutation({
        mutationFn: (file: File) => uploadCustomerEvidence(customer.id, file),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'customer', customer.id] });
            notify.success('Agregado', 'Documento agregado a la bóveda del cliente.');
        },
        onError: (err: Error) => {
            notify.error('Fallo', err.message || 'Fallo al procesar el archivo. Intenta de nuevo.');
        }
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            uploadMutation.mutate(e.target.files[0]);
        }
    };

    return (
        <div className="rounded-[2rem] border border-white/5 bg-[#13141f]/80 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

            <div className="relative mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/5 border border-cyan-500/20 shadow-inner">
                        <Camera className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Bóveda de Evidencia</h3>
                        <p className="text-xs text-theme-secondary/70">Fotos, identificaciones y tickets</p>
                    </div>
                </div>
                <div className="text-xs font-bold text-cyan-400/80 bg-cyan-400/10 px-2 py-1 rounded-md border border-cyan-400/20">
                    {customer.evidence?.length || 0} Archivos
                </div>
            </div>

            <div className="relative z-10 space-y-4">
                {/* Upload Zone */}
                <label className={`relative flex flex-col items-center justify-center w-full min-h-[120px] rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden group
                    ${uploadMutation.isPending ? 'border-cyan-500/50 bg-[#1a1c29]' : 'border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 bg-[#1a1c29]/50'}
                `}>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex flex-col items-center justify-center p-6 text-center transform transition-transform group-hover:scale-105">
                        {uploadMutation.isPending ? (
                            <>
                                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                                <p className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Procesando Cifrado...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-white/5 rounded-full mb-3 shadow-[0_0_15px_rgba(255,255,255,0.02)] group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors border border-white/5">
                                    <ImagePlus className="w-6 h-6 text-theme-secondary/70 group-hover:text-cyan-400 transition-colors" />
                                </div>
                                <p className="text-xs font-bold text-white mb-1">Subir nuevo documento</p>
                                <p className="text-[10px] text-theme-secondary/50">PNG, JPG o PDF validado (Max 5MB)</p>
                            </>
                        )}
                    </div>
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} disabled={uploadMutation.isPending} />
                </label>

                {/* Evidence Grid */}
                {customer.evidence && customer.evidence.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {customer.evidence.map((file, i) => (
                            <a 
                                key={i} 
                                href={file.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="block relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-[#1a1c29] group transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:-translate-y-1"
                            >
                                <img 
                                    src={file.url} 
                                    alt={`Evidencia ${i + 1}`} 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300" 
                                    loading="lazy" 
                                />
                                
                                {/* Overlay gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#13141f]/90 via-[#13141f]/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                
                                <div className="absolute inset-0 flex flex-col items-center justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-xl">
                                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                                        <span className="text-[10px] font-bold text-white uppercase tracking-wide">Expandir</span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
