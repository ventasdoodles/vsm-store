import { RouterProvider, createRouter, createRootRoute, createRoute, createMemoryHistory } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export function TestRouter({ initialEntries = ['/'], children, path = '/*' }: { initialEntries?: string[], children: ReactNode, path?: string }) {
    const history = createMemoryHistory({ initialEntries });
    const rootRoute = createRootRoute();
    const route = createRoute({
        getParentRoute: () => rootRoute,
        path,
        validateSearch: (search: Record<string, unknown>) => search,
        component: () => <>{children}</>
    });
    const router = createRouter({ routeTree: rootRoute.addChildren([route]), history });
    return <RouterProvider router={router} />;
}
