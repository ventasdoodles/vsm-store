import { create } from 'zustand';

export interface ConfirmState {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    type: 'danger' | 'warning' | 'info';
    resolve: ((value: boolean) => void) | null;
}

interface ConfirmActions {
    openConfirm: (options: Omit<ConfirmState, 'isOpen' | 'resolve'>) => Promise<boolean>;
    closeConfirm: (result: boolean) => void;
}

export const useConfirmStore = create<ConfirmState & ConfirmActions>((set, get) => ({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'warning',
    resolve: null,

    openConfirm: (options) => {
        return new Promise((resolve) => {
            set({
                ...options,
                isOpen: true,
                resolve,
            });
        });
    },

    closeConfirm: (result) => {
        const { resolve } = get();
        if (resolve) {
            resolve(result);
        }
        // Retrasamos el reset para permitir la animación de cierre
        set({ isOpen: false });
        setTimeout(() => {
            set({ resolve: null });
        }, 300);
    },
}));
