/**
 * // ─── COMPONENTE: ImageUploader ───
 * // Arquitectura: Dumb Component (Visual)
 * // Proposito principal: Cargador de imagenes drag-and-drop glassmorphism con grid de previews,
 *    badge "Portada" glow, placeholders con borde dashed, y dropzone con efecto violeta on drag.
 * // Regla / Notas: Props tipadas. Sin `any`. Usa react-dropzone.
 */
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { useNotification } from '@/hooks/useNotification';

interface ImageUploaderProps {
    images: string[];
    onChange: (urls: string[]) => void;
    onUpload: (file: File) => Promise<string>;
    maxImages?: number;
}

export function ImageUploader({ images, onChange, onUpload, maxImages = 4 }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);
    const notify = useNotification();

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (images.length + acceptedFiles.length > maxImages) {
            notify.warning('Límite alcanzado', `Solo puedes subir un máximo de ${maxImages} imágenes.`);
            return;
        }

        setIsUploading(true);
        try {
            const newUrls = [...images];
            for (const file of acceptedFiles) {
                const url = await onUpload(file);
                newUrls.push(url);
            }
            onChange(newUrls);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error al subir imagenes:', error);
            notify.error('Error', 'Hubo un error al subir la imagen. Intenta de nuevo.');
        } finally {
            setIsUploading(false);
        }
    }, [images, maxImages, onChange, onUpload, notify]);

    const removeImage = (indexToRemove: number) => {
        onChange(images.filter((_, index) => index !== indexToRemove));
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'image/webp': ['.webp'],
            'image/avif': ['.avif']
        },
        disabled: isUploading || images.length >= maxImages,
    });

    return (
        <div className="space-y-4">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">
                Galeria de Imagenes ({images.length}/{maxImages})
            </label>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {images.map((url, index) => (
                        <div key={url} className="group relative aspect-square overflow-hidden rounded-[1rem] border border-white/10 bg-white/5 shadow-inner">
                            <OptimizedImage
                                src={url}
                                alt={`Product image ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Portada badge */}
                            {index === 0 && (
                                <div className="absolute left-2 top-2 rounded-md bg-gradient-to-r from-violet-600 to-indigo-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg shadow-violet-500/30 backdrop-blur-sm">
                                    Portada
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 text-white opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-red-600 hover:scale-110"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    ))}

                    {/* Placeholder slots */}
                    {Array.from({ length: Math.max(0, maxImages - Math.max(images.length, 1)) }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="flex aspect-square items-center justify-center rounded-[1rem] border border-dashed border-white/10 bg-white/[0.02]">
                            <ImageIcon className="h-8 w-8 text-white/10" />
                        </div>
                    ))}
                </div>
            )}

            {/* Dropzone */}
            {images.length < maxImages && (
                <div
                    {...getRootProps()}
                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-[1.25rem] border-2 border-dashed p-8 transition-all ${
                        isDragActive
                            ? 'border-violet-500/40 bg-violet-500/5'
                            : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
                    } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                    <input {...getInputProps()} />

                    {isUploading ? (
                        <>
                            <Loader2 className="mb-3 h-10 w-10 animate-spin text-violet-400" />
                            <p className="text-sm font-semibold text-white/60">Subiendo imagenes...</p>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 rounded-[1rem] bg-gradient-to-br from-violet-500/10 to-indigo-500/5 p-4 border border-violet-500/10">
                                <UploadCloud className="h-8 w-8 text-violet-400/60" />
                            </div>
                            <p className="text-sm font-semibold text-white/60">
                                {isDragActive ? 'Suelta las imagenes aqui' : 'Arrastra imagenes aqui o haz clic'}
                            </p>
                            <p className="mt-1 text-xs text-white/30">
                                Soportado: WEBP, PNG, JPG (Max. 5MB)
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}