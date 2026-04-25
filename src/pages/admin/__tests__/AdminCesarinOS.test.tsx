import { render, screen, waitFor, within } from '@testing-library/react';
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

    const query: any = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        ilike: vi.fn(() => query),
        update: vi.fn(() => query),
        insert: vi.fn(() => query),
        single: vi.fn(() => Promise.resolve(emptySingleResponse)),
        maybeSingle: vi.fn(() => Promise.resolve(emptySingleResponse)),
        order: vi.fn(() => (table === 'products' ? query : Promise.resolve(emptyListResponse))),
        limit: vi.fn(() => Promise.resolve(emptyListResponse)),
        then: (resolve: any, reject: any) => Promise.resolve(emptyListResponse).then(resolve, reject),
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

        expect(screen.getByText(/Pilot operator telemetry/i)).toBeInTheDocument();
        expect(screen.queryByText(/Simulador/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Laboratorio/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Calidad y QA/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Sonda del runtime real/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Paridad de runtime/i)).not.toBeInTheDocument();

        await waitFor(() => {
            expect(supabaseMocks.from).toHaveBeenCalledWith('products');
        });

        const touchedTables = supabaseMocks.from.mock.calls.map(([table]) => table);
        expect(touchedTables).not.toContain('ai_simulation_sessions');
        expect(touchedTables).not.toContain('ai_simulation_reports');
        expect(supabaseMocks.invoke).not.toHaveBeenCalled();
    });

    it('prioritizes daily operator navigation and keeps secondary and advanced surfaces separate', async () => {
        render(<AdminCesarinOS />);

        const dailyNav = within(screen.getByRole('region', { name: /Diario visible/i }));
        expect(dailyNav.getByRole('button', { name: /Abrir Operacion/i })).toBeInTheDocument();
        expect(dailyNav.getByRole('button', { name: /Abrir Mejoras/i })).toBeInTheDocument();
        expect(dailyNav.getByRole('button', { name: /Abrir Conocimiento/i })).toBeInTheDocument();

        const secondaryNav = within(screen.getByRole('region', { name: /Secundario/i }));
        expect(secondaryNav.getByRole('button', { name: /Abrir Historico/i })).toBeInTheDocument();
        expect(secondaryNav.getByRole('button', { name: /Abrir Casos/i })).toBeInTheDocument();

        const advancedNav = within(screen.getByRole('region', { name: /Avanzado \/ settings/i }));
        expect(advancedNav.getByRole('button', { name: /Abrir Reglas/i })).toBeInTheDocument();
        expect(advancedNav.getByRole('button', { name: /Abrir Conceptos/i })).toBeInTheDocument();
        expect(advancedNav.getByRole('button', { name: /Abrir Persona/i })).toBeInTheDocument();

        expect(screen.queryByRole('button', { name: /Abrir Learning/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Abrir Interventions/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Abrir Quality/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Abrir Simulator/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /PilotParityDiagnostics/i })).not.toBeInTheDocument();

        await waitFor(() => {
            expect(supabaseMocks.from).toHaveBeenCalledWith('products');
        });
    });
});
