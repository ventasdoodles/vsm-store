// Gestión de Productos (Admin) - VSM Store
// Lista con búsqueda, filtros, y toggles inline
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Eye,
    Star,
    Sparkles,
    TrendingUp,
    ToggleLeft,
    ToggleRight,
    Package,
    Filter,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import {
    getAllProducts,
    deleteProduct,
    toggleProductFlag,
} from '@/services/admin.service';
import type { Product, Section } from '@/types/product';

export function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sectionFilter, setSectionFilter] = useState<Section | ''>('');
    const [showInactive, setShowInactive] = useState(false);

    const loadProducts = () => {
        setLoading(true);
        getAllProducts()
            .then(setProducts)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const filtered = useMemo(() => {
        return products.filter((p) => {
            if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku?.toLowerCase().includes(search.toLowerCase())) return false;
            if (sectionFilter && p.section !== sectionFilter) return false;
            if (!showInactive && !p.is_active) return false;
            return true;
        });
    }, [products, search, sectionFilter, showInactive]);

    const handleToggle = async (id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', current: boolean) => {
        try {
            await toggleProductFlag(id, flag, !current);
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, [flag]: !current } : p))
            );
        } catch (err) {
            console.error('Error toggling flag:', err);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`¿Desactivar "${name}"? No se eliminará, solo se ocultará de la tienda.`)) return;
        try {
            await deleteProduct(id);
            setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: false } : p)));
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-primary-100">Productos</h1>
                    <p className="text-sm text-primary-500">
                        {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <Link
                    to="/admin/products/new"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-vape-500 to-vape-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-vape-500/20 hover:shadow-vape-500/30 transition-all hover:-translate-y-0.5"
                >
                    <Plus className="h-4 w-4" />
                    Nuevo producto
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o SKU..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-primary-800/50 bg-primary-900/60 py-2.5 pl-10 pr-4 text-sm text-primary-200 placeholder-primary-600 focus:border-vape-500/50 focus:outline-none focus:ring-1 focus:ring-vape-500/30"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-xl border border-primary-800/50 bg-primary-900/60 p-1">
                        <button
                            onClick={() => setSectionFilter('')}
                            className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                !sectionFilter ? 'bg-primary-700 text-primary-100' : 'text-primary-500 hover:text-primary-300'
                            )}
                        >
                            Todos
                        </button>
                        <button
                            onClick={() => setSectionFilter('vape')}
                            className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                sectionFilter === 'vape' ? 'bg-vape-500/20 text-vape-400' : 'text-primary-500 hover:text-primary-300'
                            )}
                        >
                            Vape
                        </button>
                        <button
                            onClick={() => setSectionFilter('420')}
                            className={cn(
                                'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                                sectionFilter === '420' ? 'bg-herbal-500/20 text-herbal-400' : 'text-primary-500 hover:text-primary-300'
                            )}
                        >
                            420
                        </button>
                    </div>
                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className={cn(
                            'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition-colors',
                            showInactive
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                                : 'border-primary-800/50 bg-primary-900/60 text-primary-500 hover:text-primary-300'
                        )}
                    >
                        <Filter className="h-3 w-3" />
                        Inactivos
                    </button>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-16 animate-pulse rounded-xl bg-primary-800/30" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-primary-800/40 bg-primary-900/60 py-16">
                    <Package className="h-12 w-12 text-primary-700 mb-3" />
                    <p className="text-sm text-primary-500">No se encontraron productos</p>
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-primary-800/40 bg-primary-900/60">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-primary-800/30">
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider hidden sm:table-cell">
                                        Flags
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Activo
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-primary-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-primary-800/20">
                                {filtered.map((product) => (
                                    <tr key={product.id} className={cn('hover:bg-primary-800/20 transition-colors', !product.is_active && 'opacity-50')}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary-800/60 overflow-hidden">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Package className="h-4 w-4 text-primary-600" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate font-medium text-primary-200 max-w-[200px]">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-primary-500">
                                                        <span
                                                            className={cn(
                                                                'inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                                                                product.section === 'vape'
                                                                    ? 'bg-vape-500/10 text-vape-400'
                                                                    : 'bg-herbal-500/10 text-herbal-400'
                                                            )}
                                                        >
                                                            {product.section}
                                                        </span>
                                                        {product.sku && (
                                                            <span className="ml-2 font-mono text-primary-600">{product.sku}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-primary-200">{formatPrice(product.price)}</p>
                                            {product.compare_at_price && (
                                                <p className="text-xs text-primary-600 line-through">
                                                    {formatPrice(product.compare_at_price)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span
                                                className={cn(
                                                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                                                    product.stock < 5
                                                        ? 'bg-red-500/10 text-red-400'
                                                        : product.stock < 15
                                                            ? 'bg-amber-500/10 text-amber-400'
                                                            : 'bg-emerald-500/10 text-emerald-400'
                                                )}
                                            >
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <div className="flex items-center justify-center gap-1">
                                                <button
                                                    onClick={() => handleToggle(product.id, 'is_featured', product.is_featured)}
                                                    title="Destacado"
                                                    className={cn(
                                                        'rounded-md p-1 transition-colors',
                                                        product.is_featured
                                                            ? 'bg-amber-500/15 text-amber-400'
                                                            : 'text-primary-700 hover:text-primary-400'
                                                    )}
                                                >
                                                    <Star className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(product.id, 'is_new', product.is_new)}
                                                    title="Nuevo"
                                                    className={cn(
                                                        'rounded-md p-1 transition-colors',
                                                        product.is_new
                                                            ? 'bg-blue-500/15 text-blue-400'
                                                            : 'text-primary-700 hover:text-primary-400'
                                                    )}
                                                >
                                                    <Sparkles className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleToggle(product.id, 'is_bestseller', product.is_bestseller)}
                                                    title="Bestseller"
                                                    className={cn(
                                                        'rounded-md p-1 transition-colors',
                                                        product.is_bestseller
                                                            ? 'bg-emerald-500/15 text-emerald-400'
                                                            : 'text-primary-700 hover:text-primary-400'
                                                    )}
                                                >
                                                    <TrendingUp className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleToggle(product.id, 'is_active', product.is_active)}
                                                className="transition-colors"
                                            >
                                                {product.is_active ? (
                                                    <ToggleRight className="h-5 w-5 text-emerald-400" />
                                                ) : (
                                                    <ToggleLeft className="h-5 w-5 text-primary-600" />
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                <a
                                                    href={`/${product.section}/${product.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-800 hover:text-primary-300 transition-colors"
                                                    title="Ver en tienda"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </a>
                                                <Link
                                                    to={`/admin/products/${product.id}`}
                                                    className="rounded-lg p-1.5 text-primary-500 hover:bg-primary-800 hover:text-primary-300 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="rounded-lg p-1.5 text-primary-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                                    title="Desactivar"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
