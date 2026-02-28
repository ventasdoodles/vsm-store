import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface ImageUploaderProps {
    images: string[];
    onChange: (urls: string[]) => void;
    onUpload: (file: File) => Promise<string>;
    maxImages?: number;
}

export function ImageUploader({ images, onChange, onUpload, maxImages = 4 }: ImageUploaderProps) {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (images.length + acceptedFiles.length > maxImages) {
            alert(`Solo puedes subir un mÃ¡ximo de ${maxImages} imÃ¡genes.`);
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
            console.error('Error al subir imÃ¡genes:', error);
            alert('Hubo un error al subir la imagen. Intenta de nuevo.');
        } finally {
            setIsUploading(false);
        }
    }, [images, maxImages, onChange, onUpload]);

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
            <label className="text-sm font-medium text-theme-primary">
                GalerÃa de ImÃ¡genes ({images.length}/{maxImages})
            </label>

            {/* Grid de imÃ¡genes actuales */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {images.map((url, index) => (
                        <div key={url} className="group relative aspect-square rounded-xl border border-theme/30 bg-theme-secondary/20 overflow-hidden">
                            <OptimizedImage 
                                src={url} 
                                alt={`Product image ${index + 1}`}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {/* Insignia "Portada" a la primera imagen */}
                            {index === 0 && (
                                <div className="absolute top-2 left-2 rounded-md bg-primary-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                    Portada
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute right-2 top-2 rounded-full bg-red-500/80 p-1.5 text-white backdrop-blur-sm opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                    
                    {/* Placeholder para saber cuÃ¡ntas faltan si queremos 4 por default */}
                    {Array.from({ length: Math.max(0, maxImages - Math.max(images.length, 1)) }).map((_, i) => (
                        <div key={`placeholder-${i}`} className="aspect-square rounded-xl border border-theme/20 border-dashed bg-theme-secondary/10 flex items-center justify-center opacity-50">
                            <ImageIcon className="h-8 w-8 text-theme-primary0/30" />
                        </div>
                    ))}
                </div>
            )}

            {/* Ãrea de Dropzone */}
            {images.length < maxImages && (
                <div
                    {...getRootProps()}
                    className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
                        isDragActive 
                            ? 'border-primary-500 bg-primary-500/10' 
                            : 'border-theme/40 hover:border-primary-500/50 hover:bg-theme-secondary/20'
                    } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                >
                    <input {...getInputProps()} />
                    
                    {isUploading ? (
                        <>
                            <Loader2 className="mb-3 h-10 w-10 animate-spin text-theme-primary0" />
                            <p className="text-sm font-medium text-theme-primary">Subiendo imÃ¡genes...</p>
                        </>
                    ) : (
                        <>
                            <div className="mb-4 rounded-full bg-theme-secondary/50 p-4">
                                <UploadCloud className="h-8 w-8 text-theme-primary0" />
                            </div>
                            <p className="text-sm font-medium text-theme-primary">
                                {isDragActive ? 'Suelta las imÃ¡genes aquÃ' : 'Arrastra imÃ¡genes aquÃ o haz clic'}
                            </p>
                            <p className="mt-1 text-xs text-theme-primary0">
                                Soportado: WEBP, PNG, JPG (MÃ¡x. 5MB)
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}