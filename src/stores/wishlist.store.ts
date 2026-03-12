import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import * as wishlistService from '@/services/wishlist.service';
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

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const currentItems = get().items;
                if (!currentItems.find((item) => item.id === product.id)) {
                    set({ items: [...currentItems, product] });
                    // Fire-and-forget sync
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user) wishlistService.addToWishlist(user.id, product.id).catch(() => {});
                    });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.id !== productId) });
                // Fire-and-forget sync
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) wishlistService.removeFromWishlist(user.id, productId).catch(() => {});
                });
            },
            toggleItem: (product) => {
                const currentItems = get().items;
                const exists = currentItems.find((item) => item.id === product.id);
                if (exists) {
                    get().removeItem(product.id);
                } else {
                    get().addItem(product);
                }
            },
            isInWishlist: (productId) => {
                return get().items.some((item) => item.id === productId);
            },
            clearWishlist: () => {
                set({ items: [] });
                supabase.auth.getUser().then(({ data: { user } }) => {
                    if (user) wishlistService.clearWishlist(user.id).catch(() => {});
                });
            },

            syncToDb: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const items = get().items;
                if (items.length === 0) return;
                
                for (const item of items) {
                    await wishlistService.addToWishlist(user.id, item.id).catch(() => {});
                }
            },

            loadFromDb: async () => {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                const dbItems = await wishlistService.getWishlist(user.id);
                if (dbItems.length === 0) return;

                const localItems = get().items;
                const localIds = new Set(localItems.map(i => i.id));
                const newItems = dbItems.filter(p => !localIds.has(p.id));
                
                if (newItems.length > 0) {
                    set({ items: [...localItems, ...newItems] });
                }
            },
        }),
        {
            name: 'vsm-wishlist',
        }
    )
);
