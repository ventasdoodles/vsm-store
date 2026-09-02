import { createContext, useContext, type ReactNode } from 'react';

export interface TestRouterContextValue {
    pathname: string;
    search: Record<string, string>;
    params: Record<string, string>;
}

export const TestRouterContext = createContext<TestRouterContextValue>({
    pathname: '/',
    search: {},
    params: {},
});

export function parseRoute(pattern: string, url: string): Record<string, string> {
    const urlPath = url.split('?')[0] ?? '/';
    const patternParts = pattern.split('/').filter(Boolean);
    const urlParts = urlPath.split('/').filter(Boolean);
    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
        const pPart = patternParts[i];
        const uPart = urlParts[i];
        if (!pPart || !uPart) continue;

        if (pPart.startsWith('$') || pPart.startsWith(':')) {
            const key = pPart.replace(/^[$:]/, '');
            params[key] = uPart;
        }
    }

    // Heurística de fallback si el patrón no capturó params
    if (Object.keys(params).length === 0) {
        if (urlParts.length === 3 && urlParts[1] === 'categoria') {
            const sec = urlParts[0];
            const slg = urlParts[2];
            if (sec && slg) {
                params.section = sec;
                params.slug = slg;
            }
        } else if (urlParts.length === 2 && urlParts[0] === 'orders') {
            const ord = urlParts[1];
            if (ord) params.orderId = ord;
        } else if (urlParts.length === 2 && urlParts[0] === 'products') {
            const prd = urlParts[1];
            if (prd) params.id = prd;
        } else if (urlParts.length === 1 && (urlParts[0] === 'vape' || urlParts[0] === '420')) {
            const sec = urlParts[0];
            if (sec) params.section = sec;
        }
    }

    return params;
}

export function parseSearch(url: string): Record<string, string> {
    const queryString = url.split('?')[1];
    if (!queryString) return {};
    const search: Record<string, string> = {};
    const pairs = queryString.split('&');
    for (const pair of pairs) {
        const [k, v] = pair.split('=');
        if (k) search[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
    return search;
}

export function TestRouter({
    children,
    initialEntries = ['/'],
    path = '/',
}: {
    initialEntries?: string[];
    children: ReactNode;
    path?: string;
}) {
    const currentUrl = initialEntries[0] || '/';
    const pathname = currentUrl.split('?')[0] || '/';
    const params = parseRoute(path, currentUrl);
    const search = parseSearch(currentUrl);

    return (
        <TestRouterContext.Provider value={{ pathname, search, params }}>
            {children}
        </TestRouterContext.Provider>
    );
}

export function useTestRouter() {
    return useContext(TestRouterContext);
}
