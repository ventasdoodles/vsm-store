import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCurrentUser } from '@/services/auth.service';
import * as wishlistService from '@/services';
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
                    // Fire-and-forget sync via service layer
                    void getCurrentUser()
                        .then((user) => {
                            if (user) {
                                return wishlistService.addToWishlist(user.id, product.id);
                            }
                        })
                        .catch((err) => {
                            console.error('Wishlist sync add failed:', err);
                        });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.id !== productId) });
                // Fire-and-forget sync via service layer
                void getCurrentUser()
                    .then((user) => {
                        if (user) {
                            return wishlistService.removeFromWishlist(user.id, productId);
                        }
                    })
                    .catch((err) => {
                        console.error('Wishlist sync remove failed:', err);
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
                // Fire-and-forget sync via service layer
                void getCurrentUser()
                    .then((user) => {
                        if (user) {
                            return wishlistService.clearWishlist(user.id);
                        }
                    })
                    .catch((err) => {
                        console.error('Wishlist sync clear failed:', err);
                    });
            },

            syncToDb: async () => {
                const user = await getCurrentUser().catch(() => null);
                if (!user) return;
                const items = get().items;
                if (items.length === 0) return;
                
                await Promise.allSettled(
                    items.map((item) =>
                        wishlistService.addToWishlist(user.id, item.id).catch((err) => {
                            console.error('Wishlist batch add failed:', err);
                        })
                    )
                );
            },

            loadFromDb: async () => {
                const user = await getCurrentUser().catch(() => null);
                if (!user) return;
                
                const dbItems = await wishlistService.getWishlist(user.id).catch(() => []);
                if (!dbItems || dbItems.length === 0) return;

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
