/**
 * Safe Storage Utility — VSM Store
 * Resilient, crash-proof wrappers around window.localStorage and window.sessionStorage
 * with in-memory fallback for environments with blocked storage, SSR, private browsing,
 * or exceeded storage quota.
 */

class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length(): number {
        return this.store.size;
    }

    clear(): void {
        this.store.clear();
    }

    getItem(key: string): string | null {
        return this.store.get(key) ?? null;
    }

    key(index: number): string | null {
        return Array.from(this.store.keys())[index] ?? null;
    }

    removeItem(key: string): void {
        this.store.delete(key);
    }

    setItem(key: string, value: string): void {
        this.store.set(key, String(value));
    }
}

const memoryLocalStorage = new MemoryStorage();
const memorySessionStorage = new MemoryStorage();

function getStorage(type: 'localStorage' | 'sessionStorage'): Storage {
    if (typeof window === 'undefined') {
        return type === 'localStorage' ? memoryLocalStorage : memorySessionStorage;
    }
    try {
        const storage = window[type];
        if (!storage) {
            return type === 'localStorage' ? memoryLocalStorage : memorySessionStorage;
        }
        const testKey = '__vsm_storage_test__';
        storage.setItem(testKey, '1');
        storage.removeItem(testKey);
        return storage;
    } catch {
        return type === 'localStorage' ? memoryLocalStorage : memorySessionStorage;
    }
}

export const safeLocalStorage = {
    getItem(key: string): string | null {
        try {
            return getStorage('localStorage').getItem(key);
        } catch {
            return memoryLocalStorage.getItem(key);
        }
    },
    setItem(key: string, value: string): boolean {
        try {
            getStorage('localStorage').setItem(key, value);
            return true;
        } catch {
            memoryLocalStorage.setItem(key, value);
            return false;
        }
    },
    removeItem(key: string): void {
        try {
            getStorage('localStorage').removeItem(key);
        } catch {
            memoryLocalStorage.removeItem(key);
        }
    },
    getJSON<T>(key: string, fallback: T): T {
        try {
            const raw = this.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw) as T;
        } catch {
            return fallback;
        }
    },
    setJSON<T>(key: string, value: T): boolean {
        try {
            return this.setItem(key, JSON.stringify(value));
        } catch {
            return false;
        }
    },
};

export const safeSessionStorage = {
    getItem(key: string): string | null {
        try {
            return getStorage('sessionStorage').getItem(key);
        } catch {
            return memorySessionStorage.getItem(key);
        }
    },
    setItem(key: string, value: string): boolean {
        try {
            getStorage('sessionStorage').setItem(key, value);
            return true;
        } catch {
            memorySessionStorage.setItem(key, value);
            return false;
        }
    },
    removeItem(key: string): void {
        try {
            getStorage('sessionStorage').removeItem(key);
        } catch {
            memorySessionStorage.removeItem(key);
        }
    },
    getJSON<T>(key: string, fallback: T): T {
        try {
            const raw = this.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw) as T;
        } catch {
            return fallback;
        }
    },
    setJSON<T>(key: string, value: T): boolean {
        try {
            return this.setItem(key, JSON.stringify(value));
        } catch {
            return false;
        }
    },
};
