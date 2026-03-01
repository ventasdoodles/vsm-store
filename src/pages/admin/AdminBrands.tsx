import { useState, useEffect } from 'react';
import { 
    Award, 
    Plus, 
    Search,
    Edit2,
    Trash2,
    Copy,
    Image as ImageIcon,
    Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { 
    getBrands, 
    createBrand, 
    updateBrand, 
    deleteBrand, 
    duplicateBrand,
    uploadBrandLogo,
    type Brand 
} from '@/services/admin/admin-brands.service';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { ImageUploader } from '@/components/admin/products/ImageUploader';
import { cn } from '@/lib/utils';

export function AdminBrands() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');
    
    // Edit Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        is_active: true,
        sort_order: 0
    });

    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        setIsLoading(true);
        try {
            const data = await getBrands();
            setBrands(data);
        } catch (error: any) {
            toast.error('Error al cargar las marcas: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (brand?: Brand) => {
        if (brand) {
            setEditingBrand(brand);
            setFormData({
                name: brand.name,
                logo_url: brand.logo_url || '',
                is_active: brand.is_active,
                sort_order: brand.sort_order
            });
        } else {
            setEditingBrand(null);
            setFormData({
                name: '',
                logo_url: '',
                is_active: true,
                sort_order: brands.length * 10
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBrand(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name) {
            toast.error('Goku requiere un nombre para la marca.');
            return;
        }

        setIsSaving(true);
        try {
            if (editingBrand) {
                await updateBrand(editingBrand.id, formData);
                toast.success('Marca actualizada exitosamente.');
            } else {
                await createBrand(formData);
                toast.success('Marca creada exitosamente.');
            }
            await loadBrands();
            handleCloseModal();
        } catch (error: any) {
            toast.error('Error al guardar: ' + error.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (brand: Brand) => {
        if (!window.confirm(`¿Estás seguro de que deseas eliminar la marca "${brand.name}"?`)) return;
        
        try {
            await deleteBrand(brand.id);
            toast.success('Marca eliminada.');
            await loadBrands();
        } catch (error: any) {
            toast.error('Error al eliminar: ' + error.message);
        }
    };

    const handleDuplicate = async (brand: Brand) => {
        try {
            await duplicateBrand(brand.id);
            toast.success('Marca duplicada.');
            await loadBrands();
        } catch (error: any) {
            toast.error('Error al duplicar: ' + error.message);
        }
    };

    const handleUploadLogo = async (file: File) => {
        return await uploadBrandLogo(file);
    };

    const filteredBrands = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-6">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
                        <Award className="h-6 w-6 text-accent-primary" />
                        Marcas
                    </h1>
                    <p className="text-sm text-theme-secondary mt-1">
                        Gestiona las marcas que aparecen en el carrusel de inicio.
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                    <Plus className="h-4 w-4" />
                    Nueva Marca
                </button>
            </header>

            {/* Buscador */}
            <div className="bg-theme-secondary/5 rounded-xl p-4 border border-theme">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-secondary" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 bg-theme border border-theme rounded-lg text-sm text-theme-primary placeholder:text-theme-secondary focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50"
                    />
                </div>
            </div>

            {/* Grid de Marcas */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-theme-secondary">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-accent-primary" />
                    <p>Cargando marcas...</p>
                </div>
            ) : filteredBrands.length === 0 ? (
                <div className="text-center py-20 bg-theme-secondary/5 rounded-xl border border-theme border-dashed">
                    <Award className="w-12 h-12 text-theme-secondary mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-medium text-theme-primary">No hay marcas</h3>
                    <p className="text-theme-secondary text-sm mt-1">Crea tu primera marca para mostrarla en el sitio.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredBrands.map(brand => (
                        <div key={brand.id} className="bg-theme rounded-xl border border-theme hover:border-white/10 transition-colors group overflow-hidden">
                            <div className="aspect-video w-full bg-theme-secondary/10 flex items-center justify-center p-6 relative">
                                {brand.logo_url ? (
                                    <OptimizedImage
                                        src={brand.logo_url} 
                                        alt={brand.name}
                                        className={cn(
                                            "max-w-full max-h-full object-contain filter group-hover:brightness-110 transition-all",
                                            !brand.is_active && "grayscale opacity-50"
                                        )}
                                    />
                                ) : (
                                    <ImageIcon className="h-10 w-10 text-theme-secondary/30" />
                                )}

                                {/* Hover actions over image */}
                                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                    <button
                                        onClick={() => handleOpenModal(brand)}
                                        className="p-1.5 bg-black/60 hover:bg-accent-primary text-white backdrop-blur-sm rounded-md transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDuplicate(brand)}
                                        className="p-1.5 bg-black/60 hover:bg-blue-500 text-white backdrop-blur-sm rounded-md transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(brand)}
                                        className="p-1.5 bg-black/60 hover:bg-red-500 text-white backdrop-blur-sm rounded-md transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {!brand.is_active && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white/70 text-[10px] uppercase font-bold rounded-md tracking-wider">
                                        Inactiva
                                    </div>
                                )}
                            </div>
                            <div className="p-3 border-t border-theme flex flex-col justify-between h-full bg-theme-secondary/5">
                                <h3 className={cn("font-semibold text-sm truncate", brand.is_active ? "text-theme-primary" : "text-theme-secondary")}>
                                    {brand.name}
                                </h3>
                                <div className="text-[10px] text-theme-secondary mt-1 tracking-wider uppercase">
                                    Orden: {brand.sort_order}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal Modal/Drawer - Formulario */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleCloseModal} />
                    <div className="relative w-full max-w-lg bg-[#0a0f18] border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-300">
                        <header className="mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                {editingBrand ? 'Editar Marca' : 'Nueva Marca'}
                            </h2>
                            <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">Configurador global de marcas</p>
                        </header>

                        <form onSubmit={handleSave} className="space-y-6">
                            
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-white/50 ml-1">
                                    Nombre de la Marca *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/50"
                                    placeholder="Ej: Elfbar, SMOK..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-white/50 ml-1">
                                    Logo de la Marca
                                </label>
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <ImageUploader 
                                        images={formData.logo_url ? [formData.logo_url] : []}
                                        maxImages={1}
                                        onChange={(urls) => setFormData({ ...formData, logo_url: urls[0] || '' })}
                                        onUpload={handleUploadLogo}
                                    />
                                    <p className="text-[10px] text-white/40 text-center mt-3 uppercase tracking-wider">
                                        Recomendado: PNG en blanco o SVG, fondo transparente
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-white/50 ml-1">
                                        Orden de aparición
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-accent-primary/50"
                                    />
                                </div>
                                <div className="space-y-2 flex flex-col justify-end">
                                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 border border-white/10 rounded-xl h-12 transition-colors hover:bg-white/10">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="w-4 h-4 rounded border-white/20 bg-black/50 text-accent-primary focus:ring-accent-primary/50"
                                        />
                                        <span className="text-sm font-medium text-white">Activa (Visible)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-white/10">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-accent-primary hover:bg-accent-primary/90 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                    {isSaving ? 'Guardando...' : 'Guardar Marca'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}