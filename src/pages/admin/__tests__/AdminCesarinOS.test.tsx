import { render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminCesarinOS } from '../AdminCesarinOS';

const supabaseMocks = vi.hoisted(() => ({
    from: vi.fn(),
    invoke: vi.fn(),
}));

function createSupabaseQuery(table: string) {
    const emptyListResponse = { data: [], error: null };
    const emptySingleResponse = { data: null, error: null };

    const query: Record<string, unknown> = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        ilike: vi.fn(() => query),
        update: vi.fn(() => query),
        insert: vi.fn(() => query),
        single: vi.fn(() => Promise.resolve(emptySingleResponse)),
        maybeSingle: vi.fn(() => Promise.resolve(emptySingleResponse)),
        order: vi.fn(() => (table === 'products' ? query : Promise.resolve(emptyListResponse))),
        limit: vi.fn(() => Promise.resolve(emptyListResponse)),
        then: (resolve: (value: unknown) => unknown, reject: (reason?: unknown) => void) => Promise.resolve(emptyListResponse).then(resolve, reject),
    };

    return query;
}

vi.mock('@/lib/supabase', () => ({
    supabase: {
        from: supabaseMocks.from,
        functions: {
            invoke: supabaseMocks.invoke,
        },
    },
}));

vi.mock('react-hot-toast', () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

vi.mock('framer-motion', () => ({
    AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
    motion: {
        div: ({ children, className, ...props }: any) => <div className={className} {...props}>{children}</div>,
        button: ({ children, className, ...props }: any) => <button className={className} {...props}>{children}</button>,
    },
}));

vi.mock('@/hooks/useStoreSettings', () => ({
    useStoreSettings: () => ({
        data: { is_ai_assistant_enabled: false },
        isLoading: false,
    }),
    useUpdateStoreSettings: () => ({
        mutateAsync: vi.fn(),
        isPending: false,
    }),
}));

vi.mock('@/hooks/useAuth', () => ({
    useAuth: () => ({ user: { email: 'operator@example.test' } }),
}));

vi.mock('@/hooks/useCesarinSignalStates', () => ({
    useCesarinSignalStates: () => ({
        signalStates: {},
        markSignal: vi.fn(),
    }),
}));

vi.mock('@/hooks/useCesarinActivityLog', () => ({
    useCesarinActivityLog: () => ({
        activityLog: [],
        logAction: vi.fn(),
        clearLog: vi.fn(),
    }),
}));

vi.mock('@/components/admin/cesarin/TabPersona', () => ({
    TabPersona: () => <div>Persona tab</div>,
}));

vi.mock('@/components/admin/cesarin/TabRules', () => ({
    TabRules: () => <div>Rules tab</div>,
}));

vi.mock('@/components/admin/cesarin/TabAnalytics', () => ({
    TabAnalytics: () => <div>Analytics tab</div>,
}));

vi.mock('@/components/admin/cesarin/TabKnowledge', () => ({
    TabKnowledge: () => <div>Knowledge tab</div>,
}));

vi.mock('@/components/admin/cesarin/TabPilot', () => ({
    TabPilot: () => <div>Pilot operator telemetry</div>,
}));

vi.mock('@/components/admin/cesarin/TabConcepts', () => ({
    TabConcepts: () => <div>Concepts tab</div>,
}));

vi.mock('@/components/admin/cesarin/TabImprovements', () => ({
    TabImprovements: () => <div>Improvements tab</div>,
}));

vi.mock('@/components/admin/cesarin/TabCaseDrafts', () => ({
    TabCaseDrafts: () => <div>Case drafts tab</div>,
}));

vi.mock('@/components/admin/cesarin/ReviewDrawer', () => ({
    ReviewDrawer: () => null,
}));

describe('AdminCesarinOS operator shell', () => {
    beforeEach(() => {
        supabaseMocks.from.mockReset();
        supabaseMocks.invoke.mockReset();
        supabaseMocks.from.mockImplementation((table: string) => createSupabaseQuery(table));
    });

    it('does not expose runtime probe or simulator surfaces in normal navigation', async () => {
        render(<AdminCesarinOS />);

        expect(screen.getByText(/Cesarin OS/i)).toBeInTheDocument();
        expect(screen.queryByText(/Simulador/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Laboratorio/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Calidad y QA/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Sonda del runtime real/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Paridad de runtime/i)).not.toBeInTheDocument();


        const touchedTables = supabaseMocks.from.mock.calls.map(([table]) => table);
        expect(touchedTables).not.toContain('ai_simulation_sessions');
        expect(touchedTables).not.toContain('ai_simulation_reports');
        expect(supabaseMocks.invoke).not.toHaveBeenCalled();
    });

    it('renders modern navigation cards for operator surfaces', async () => {
        render(<AdminCesarinOS />);

        const nav = within(screen.getByRole('navigation', { name: /Navegacion Cesarin OS/i }));
        
        // Assert the new cards exist
        expect(nav.getByRole('button', { name: /Interacciones/i })).toBeInTheDocument();
        expect(nav.getByRole('button', { name: /Material de Estudio/i })).toBeInTheDocument();
        expect(nav.getByRole('button', { name: /Reglas de Venta/i })).toBeInTheDocument();
        expect(nav.getByRole('button', { name: /Desempeño/i })).toBeInTheDocument();
    });
});
