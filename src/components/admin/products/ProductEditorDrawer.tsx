import { useState, useEffect } from 'react';
import { Camera, Save, DollarSign, Tag, Package2 } from 'lucide-react';
import { SideDrawer } from '@/components/ui/SideDrawer';
import { type Product } from '@/types/product';
import { type ProductFormData, uploadProductImage } from '@/services/admin';
import { ImageUploader } from './ImageUploader';

interface ProductEditorDrawerProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<ProductFormData>) => void;
    isSaving: boolean;
}

const DEFAULT_FORM: Partial<ProductFormData> = {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    price: 0,
    compare_at_price: null,
    stock: 0,
    sku: '',
    section: 'vape',
    category_id: '',
    tags: [],
    status: 'draft',
    images: [],
    cover_image: null,
    is_active: true,
};

export function ProductEditorDrawer({
    product,
    isOpen,
    onClose,
    onSave,
    isSaving
}: ProductEditorDrawerProps) {
    const [formData, setFormData] = useState<Partial<ProductFormData>>(DEFAULT_FORM);

    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (product && isOpen) {
            setFormData({
                ...product,
                // Supabase devuelve nulls a veces, asegurar arrays/strings
                images: product.images || [],
                tags: product.tags || [],
                description: product.description || '',
                short_description: product.short_description || '',
                sku: product.sku || '',
            });
        } else if (!product && isOpen) {
            setFormData(DEFAULT_FORM);
        }
    }, [product, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleImagesChange = (newImages: string[]) => {
        setFormData(prev => ({
            ...prev,
            images: newImages,
            // La primera imagen siempre es la portada
            cover_image: newImages.length > 0 ? newImages[0] : null
        }));
    };

    const handleSave = () => {
        // Todo: AquÃ­ irian validaciones bÃ¡sicas antes de emitir
        if (!formData.name || formData.price === undefined) {
            alert('El nombre y precio son obligatorios');
            return;
        }
        
        // Auto generar slug si no existe
        const finalData = { ...formData };
        if (!finalData.slug && finalData.name) {
            finalData.slug = finalData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }

        onSave(finalData);
    };

    const isEditMode = !!product;

    return (
        <SideDrawer
            isOpen={isOpen}
            onClose={onClose}
            title={isEditMode ? 'Editar Producto' : 'Nuevo Producto'}
            width="max-w-2xl w-full"
        >
            <div className="space-y-8 pb-20"> {/* pb extra para que el footer no tape */}
                
                {/* 1. ImÃ¡genes Premium */}
                <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                        <Camera className="h-5 w-5 text-primary-500" />
                        FotografÃ­as
                    </h3>
                    <div className="rounded-xl border border-theme/30 bg-theme-primary p-5">
                        <ImageUploader 
                            images={formData.images || []}
                            onChange={handleImagesChange}
                            onUpload={uploadProductImage}
                            maxImages={4}
                        />
                    </div>
                </div>

                {/* 2. InformaciÃ³n BÃ¡sica */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                        <Package2 className="h-5 w-5 text-primary-500" />
                        Info BÃ¡sica
                    </h3>
                    <div className="grid grid-cols-1 gap-4 rounded-xl border border-theme/30 bg-theme-primary p-5">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-primary0">Nombre del Producto *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name || ''}
                                onChange={handleChange}
                                placeholder="Ej: Vaporesso XROS 3"
                                className="w-full rounded-lg border border-theme/40 bg-transparent px-3 py-2 text-theme-primary focus:border-primary-500 focus:outline-none"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-primary0">SecciÃ³n</label>
                                <select 
                                    name="section" 
                                    value={formData.section} 
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-theme/40 bg-theme-primary px-3 py-2 text-theme-primary focus:border-primary-500 focus:outline-none"
                                >
                                    <option value="vape">Vape</option>
                                    <option value="420">420</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-primary0">SKU (Interno)</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-theme/40 bg-transparent px-3 py-2 text-theme-primary focus:border-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-theme-primary0">DescripciÃ³n Corta</label>
                            <textarea
                                name="short_description"
                                value={formData.short_description || ''}
                                onChange={handleChange}
                                rows={2}
                                className="w-full rounded-lg border border-theme/40 bg-transparent px-3 py-2 text-theme-primary focus:border-primary-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Precios e Inventario */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary-500" />
                            Precio
                        </h3>
                        <div className="rounded-xl border border-theme/30 bg-theme-primary p-5 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-primary0">Precio de Venta ($) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price || 0}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-theme/40 bg-transparent px-3 py-2 text-xl font-bold text-theme-primary focus:border-primary-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-primary0">Precio ComparaciÃ³n (Opcional, tachado)</label>
                                <input
                                    type="number"
                                    name="compare_at_price"
                                    value={formData.compare_at_price || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-theme/40 bg-transparent px-3 py-2 text-theme-primary0 focus:border-primary-500 focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
                            <Tag className="h-5 w-5 text-primary-500" />
                            Inventario
                        </h3>
                        <div className="rounded-xl border border-theme/30 bg-theme-primary p-5 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-primary0">Stock Disponible *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock || 0}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-theme/40 bg-transparent px-3 py-2 text-theme-primary focus:border-primary-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-theme-primary0">Estado PÃºblico</label>
                                <label className="flex items-center gap-3 mt-3 cursor-pointer">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData(p => ({ ...p, is_active: e.target.checked }))}
                                        />
                                        <div className="w-11 h-6 bg-theme-secondary/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </div>
                                    <span className="text-sm font-medium text-theme-primary">
                                        {formData.is_active ? 'Producto Activo (Visible en tienda)' : 'Oculto / Borrador'}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer pegajoso con botones */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-theme/20 bg-theme-primary/95 backdrop-blur-md px-6 py-4 flex justify-between items-center z-10">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-theme-primary0 hover:text-theme-primary hover:bg-theme-secondary/20 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50 transition-colors shadow-lg shadow-primary-500/20"
                >
                    {isSaving ? (
                        <>Guardando...</>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            {isEditMode ? 'Guardar Cambios' : 'Crear Producto'}
                        </>
                    )}
                </button>
            </div>
        </SideDrawer>
    );
}