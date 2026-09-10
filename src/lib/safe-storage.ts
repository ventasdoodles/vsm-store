/**
 * Safe Storage Utility — VSM Store
 * Resilient, crash-proof wrappers around window.localStorage and window.sessionStorage
 * with in-memory fallback for environments with blocked storage, SSR, private browsing,
 * or exceeded storage quota.
 *
 * Design note: Never performs write-tests on read operations, ensuring zero I/O overhead
 * and preserving reads of existing stored values even under QuotaExceededError conditions.
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

export const safeLocalStorage = {
    getItem(key: string): string | null {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const val = window.localStorage.getItem(key);
                if (val !== null) return val;
            }
        } catch {
            // Storage access blocked or restricted (e.g. strict private mode)
        }
        return memoryLocalStorage.getItem(key);
    },
    setItem(key: string, value: string): boolean {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
                return true;
            }
        } catch {
            // QuotaExceededError or security policy restriction
        }
        memoryLocalStorage.setItem(key, value);
        return false;
    },
    removeItem(key: string): void {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        } catch {
            // noop
        }
        memoryLocalStorage.removeItem(key);
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
            if (typeof window !== 'undefined' && window.sessionStorage) {
                const val = window.sessionStorage.getItem(key);
                if (val !== null) return val;
            }
        } catch {
            // Storage access blocked or restricted
        }
        return memorySessionStorage.getItem(key);
    },
    setItem(key: string, value: string): boolean {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.setItem(key, value);
                return true;
            }
        } catch {
            // QuotaExceededError or security policy restriction
        }
        memorySessionStorage.setItem(key, value);
        return false;
    },
    removeItem(key: string): void {
        try {
            if (typeof window !== 'undefined' && window.sessionStorage) {
                window.sessionStorage.removeItem(key);
            }
        } catch {
            // noop
        }
        memorySessionStorage.removeItem(key);
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
