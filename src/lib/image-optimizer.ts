/**
 * Procesa una imagen en el cliente antes de subirla:
 * 1. Redimensiona a un máximo de 1200x1200px (preservando aspect ratio).
 * 2. Convierte a formato WebP.
 * 3. Reduce la calidad a 0.8 (80%).
 */
export async function processImageForUpload(file: File): Promise<File> {
    // Si no es imagen, o es SVG/GIf, devolver original
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;

            // Calcular nuevas dimensiones
            if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                if (width > height) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                } else {
                    width = Math.round((width * MAX_HEIGHT) / height);
                    height = MAX_HEIGHT;
                }
            }

            // Crear canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('No se pudo obtener el contexto del canvas'));
                return;
            }

            // Dibujar imagen redimensionada
            ctx.drawImage(img, 0, 0, width, height);

            // Exportar a WebP
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Crear nuevo archivo con extensión .webp
                        const newName = file.name.replace(/\.[^.]+$/, '') + '.webp';
                        const newFile = new File([blob], newName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error('Error al convertir la imagen a WebP'));
                    }
                },
                'image/webp',
                0.8
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Error al cargar la imagen para procesamiento'));
        };

        img.src = url;
    });
}
