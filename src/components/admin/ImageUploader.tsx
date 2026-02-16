// Image Uploader — VSM Store Admin
// Drag-and-drop + click-to-browse, con preview grid
import { useState, useRef, useCallback } from 'react';
import { Upload, X, Loader2, ImageIcon, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { uploadProductImage, deleteProductImage } from '@/services/storage.service';
import { processImageForUpload } from '@/lib/image-optimizer';

interface ImageUploaderProps {
    images: string[];
    onChange: (urls: string[]) => void;
}

export function ImageUploader({ images, onChange }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadCount, setUploadCount] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [urlInput, setUrlInput] = useState('');
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        if (fileArray.length === 0) return;

        setError(null);
        setUploading(true);
        setUploadCount(fileArray.length);

        const newUrls: string[] = [];
        const errors: string[] = [];

        for (const file of fileArray) {
            try {
                // 1. Optimizar imagen (Client-side)
                const processedFile = await processImageForUpload(file);
                // 2. Subir a Supabase
                const url = await uploadProductImage(processedFile);
                newUrls.push(url);
            } catch (err) {
                errors.push(err instanceof Error ? err.message : `Error con ${file.name}`);
            }
        }

        if (newUrls.length > 0) {
            onChange([...images, ...newUrls]);
        }
        if (errors.length > 0) {
            setError(errors.join('. '));
        }

        setUploading(false);
        setUploadCount(0);
    }, [images, onChange]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    }, [handleFiles]);

    const handleRemove = async (url: string) => {
        onChange(images.filter((u) => u !== url));
        // Fire-and-forget: try to delete from storage
        deleteProductImage(url).catch(() => { });
    };

    const handleAddUrl = () => {
        const u = urlInput.trim();
        if (u) {
            onChange([...images, u]);
            setUrlInput('');
            setShowUrlInput(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Drop Zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileRef.current?.click()}
                className={cn(
                    'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 transition-all',
                    dragOver
                        ? 'border-vape-400 bg-vape-500/10'
                        : 'border-primary-800/50 bg-primary-950/40 hover:border-primary-700 hover:bg-primary-900/40',
                    uploading && 'pointer-events-none opacity-60'
                )}
            >
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                {uploading ? (
                    <>
                        <Loader2 className="h-8 w-8 animate-spin text-vape-400" />
                        <p className="text-sm text-primary-400">
                            Subiendo {uploadCount} imagen{uploadCount > 1 ? 'es' : ''}...
                        </p>
                    </>
                ) : (
                    <>
                        <Upload className="h-8 w-8 text-primary-600" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-primary-300">
                                Arrastra imágenes o <span className="text-vape-400">haz clic</span>
                            </p>
                            <p className="mt-1 text-xs text-primary-600">
                                JPG, PNG, WebP, AVIF · máx 5 MB
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-2.5 text-xs text-red-400">
                    {error}
                </div>
            )}

            {/* URL Fallback */}
            <div>
                {showUrlInput ? (
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                            className="flex-1 rounded-xl border border-primary-800/50 bg-primary-950/60 px-3 py-2 text-sm text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none"
                            placeholder="https://ejemplo.com/imagen.jpg"
                            autoFocus
                        />
                        <Button
                            type="button"
                            onClick={handleAddUrl}
                            variant="secondary"
                            size="icon"
                            aria-label="Agregar URL"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            onClick={() => { setShowUrlInput(false); setUrlInput(''); }}
                            variant="ghost"
                            size="icon"
                            aria-label="Cancelar"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        variant="ghost"
                        size="sm"
                        leftIcon={<LinkIcon className="h-3 w-3" />}
                        className="text-xs text-primary-500"
                    >
                        O pegar URL directa
                    </Button>
                )}
            </div>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    {images.map((url, i) => (
                        <div
                            key={`${url}-${i}`}
                            className="group relative aspect-square rounded-xl overflow-hidden border border-primary-800/40 bg-primary-950"
                        >
                            <img
                                src={url}
                                alt={`Imagen ${i + 1}`}
                                className="h-full w-full object-cover"
                                loading="lazy"
                            />
                            <Button
                                type="button"
                                onClick={() => handleRemove(url)}
                                variant="danger"
                                size="icon"
                                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-red-500"
                                aria-label="Eliminar imagen"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                            {i === 0 && (
                                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-vape-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
                                    Principal
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
