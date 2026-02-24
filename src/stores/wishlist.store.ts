import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';

interface WishlistState {
    items: Product[];
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    toggleItem: (product: Product) => void;
    isInWishlist: (productId: string) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product) => {
                const currentItems = get().items;
                if (!currentItems.find((item) => item.id === product.id)) {
                    set({ items: [...currentItems, product] });
                }
            },
            removeItem: (productId) => {
                set({ items: get().items.filter((item) => item.id !== productId) });
            },
            toggleItem: (product) => {
                const currentItems = get().items;
                const exists = currentItems.find((item) => item.id === product.id);
                if (exists) {
                    set({ items: currentItems.filter((item) => item.id !== product.id) });
                } else {
                    set({ items: [...currentItems, product] });
                }
            },
            isInWishlist: (productId) => {
                return get().items.some((item) => item.id === productId);
            },
            clearWishlist: () => set({ items: [] }),
        }),
        {
            name: 'vsm-wishlist',
        }
    )
);
