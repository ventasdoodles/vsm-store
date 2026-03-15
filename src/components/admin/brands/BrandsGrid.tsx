import { Award } from 'lucide-react';
import type { Brand } from '@/services/admin';
import { BrandAdminCard } from './BrandAdminCard';

interface BrandsGridProps {
    brands: Brand[];
    onEdit: (b: Brand) => void;
    onDuplicate: (b: Brand) => void;
    onDelete: (b: Brand) => void;
    onToggleActive: (id: string, active: boolean) => void;
}

export function BrandsGrid({ brands, onEdit, onDuplicate, onDelete, onToggleActive }: BrandsGridProps) {
    if (brands.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-theme-primary/5 rounded-3xl border border-white/5 shadow-inner">
                <div className="p-5 bg-blue-500/10 rounded-full mb-6">
                     <Award className="h-12 w-12 text-blue-500/50" />
                </div>
                <p className="text-xl font-black text-theme-primary text-center">
                    No se encontraron marcas
                </p>
                <p className="text-sm font-medium text-theme-secondary mt-2 text-center max-w-md">
                    No hay marcas que coincidan con la búsqueda actual o no has agregado ninguna todavía.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pt-4 pb-12">
            {brands.map((b) => (
                <BrandAdminCard
                    key={b.id}
                    brand={b}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onToggleActive={onToggleActive}
                />
            ))}
        </div>
    );
}
