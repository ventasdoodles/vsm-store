import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/types/product';

interface WishlistState {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    toggleItem: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
    /** Sync local wishlist state to DB for the logged-in user */
    syncToDb: () => Promise<void>;
    /** Load wishlist from DB for the logged-in user (merges with local) */
    loadFromDb: () => Promise<void>;
}

/** Fire-and-forget DB sync helpers */
async function dbAdd(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('customer_wishlists').upsert(
        { customer_id: user.id, product_id: productId },
        { onConflict: 'customer_id,product_id' }
    ).then(() => {});
}

async function dbRemove(productId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('customer_wishlists')
        .delete()
        .eq('customer_id', user.id)
        .eq('product_id', productId)
        .then(() => {});
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const currentItems = get().items;
                if (!currentItems.find((item) => item.id === product.id)) {
                    set({ items: [...currentItems, product] });
                    dbAdd(product.id).catch(() => {});
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.id !== productId) });
                dbRemove(productId).catch(() => {});
            },
            toggleItem: (product) => {
                const currentItems = get().items;
                const exists = currentItems.find((item) => item.id === product.id);
                if (exists) {
                    set({ items: currentItems.filter((item) => item.id !== product.id) });
                    dbRemove(product.id).catch(() => {});
                } else {
                    set({ items: [...currentItems, product] });
                    dbAdd(product.id).catch(() => {});
                }
            },
            isInWishlist: (productId) => {
                return get().items.some((item) => item.id === productId);
            },
            clearWishlist: () => set({ items: [] }),

            syncToDb: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const items = get().items;
                if (items.length === 0) return;
                // Upsert all local items to DB
                const rows = items.map(p => ({ customer_id: user.id, product_id: p.id }));
                await supabase.from('customer_wishlists')
                    .upsert(rows, { onConflict: 'customer_id,product_id' })
                    .then(() => {});
            },

            loadFromDb: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data } = await supabase
                    .from('customer_wishlists')
                    .select('product_id, products (*)')
                    .eq('customer_id', user.id);
                if (!data || data.length === 0) return;

                const localItems = get().items;
                const localIds = new Set(localItems.map(i => i.id));
                const dbProducts = data
                    .map((row: Record<string, unknown>) => row.products as Product | null)
                    .filter((p): p is Product => p !== null && !localIds.has(p.id));
                if (dbProducts.length > 0) {
                    set({ items: [...localItems, ...dbProducts] });
                }
            },
        }),
        {
            name: 'vsm-wishlist',
        }
    )
);
