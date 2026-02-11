import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    timestamp: Date;
    actionUrl?: string;
    actionLabel?: string;
}

interface NotificationsState {
    notifications: Notification[];
    addNotification: (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearAll: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
    notifications: [],

    addNotification: (n) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification: Notification = {
            ...n,
            id,
            read: false,
            timestamp: new Date(),
        };
        set((state) => ({
            notifications: [newNotification, ...state.notifications].slice(0, 50), // Limit to 50
        }));
    },

    removeNotification: (id) =>
        set((state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
        })),

    markAsRead: (id) =>
        set((state) => ({
            notifications: state.notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            ),
        })),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
        })),

    clearAll: () => set({ notifications: [] }),
}));
