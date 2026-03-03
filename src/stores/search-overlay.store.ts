import { create } from 'zustand';

/** Store para controlar la visibilidad del overlay de búsqueda móvil */
interface SearchOverlayStore {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    toggle: () => void;
}

export const useSearchOverlay = create<SearchOverlayStore>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
