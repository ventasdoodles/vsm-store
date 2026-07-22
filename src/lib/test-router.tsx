import type { ReactNode } from 'react';

export function TestRouter({ children }: { initialEntries?: string[], children: ReactNode, path?: string }) {
    return <>{children}</>;
}
