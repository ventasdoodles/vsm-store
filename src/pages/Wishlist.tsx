import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ShoppingCart } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useCartStore } from '@/stores/cart.store';
import { useNotification } from '@/hooks/useNotification';
import { ProductGrid } from '@/components/products/ProductGrid';
import { SEO } from '@/components/seo/SEO';

export function Wishlist() {
    const items = useWishlistStore((s) => s.items);
    const clearWishlist = useWishlistStore((s) => s.clearWishlist);
    const addToCart = useCartStore((s) => s.addItem);
    const notify = useNotification();

    const handleAddAllToCart = () => {
        const inStock = items.filter(p => p.stock > 0);
        if (inStock.length === 0) {
            notify.warning('Sin stock', 'Ninguno de tus favoritos está disponible.');
            return;
        }
        inStock.forEach(product => addToCart(product));
        notify.success(
            '¡Agregados al carrito!',
            `${inStock.length} producto${inStock.length > 1 ? 's' : ''} agregado${inStock.length > 1 ? 's' : ''}.`
        );
    };

    return (
        <div className="container-vsm py-12 min-h-[70vh]">
            <SEO title="Mis Favoritos" description="Tus productos favoritos guardados para después." />

            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                        <Heart className="h-6 w-6 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-theme-primary tracking-tight">Mis Favoritos</h1>
                        <p className="text-theme-secondary mt-1">
                            {items.length} {items.length === 1 ? 'producto guardado' : 'productos guardados'}
                        </p>
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAddAllToCart}
                            className="inline-flex items-center gap-2 rounded-xl bg-vape-500 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-vape-500/20 transition-all hover:bg-vape-600 hover:-translate-y-0.5"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            Agregar todo al carrito
                        </button>
                        <button
                            onClick={clearWishlist}
                            className="rounded-xl border border-theme px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-theme-secondary transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                        >
                            Limpiar
                        </button>
                    </div>
                )}
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-theme-secondary/5 rounded-3xl vsm-border">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 blur-2xl bg-red-500/20 rounded-full" />
                        <div className="relative rounded-3xl bg-theme-secondary/30 p-8 vsm-border-subtle">
                            <Heart className="h-16 w-16 text-theme-tertiary opacity-40" />
                        </div>
                    </div>
                    <h2 className="text-xl font-bold text-theme-primary mb-2">Tu lista está vacía</h2>
                    <p className="text-theme-secondary max-w-md mb-8">
                        Aún no has guardado ningún producto. Explora nuestra tienda y usa el corazón para guardar tus favoritos.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 rounded-xl bg-vape-500 px-8 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-vape-500/25 transition-all hover:bg-vape-600 hover:shadow-vape-500/40 hover:-translate-y-0.5"
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Explorar Tienda
                    </Link>
                </div>
            ) : (
                <ProductGrid products={items} isLoading={false} />
            )}
        </div>
    );
}
