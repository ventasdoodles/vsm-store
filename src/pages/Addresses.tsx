// Página de direcciones - VSM Store
import { useEffect, useState } from 'react';
import { MapPin, Package, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { AddressList } from '@/components/addresses/AddressList';

type TabType = 'shipping' | 'billing';

export function Addresses() {
    const { user } = useAuth();
    const [tab, setTab] = useState<TabType>('shipping');

    useEffect(() => {
        document.title = 'Mis direcciones | VSM Store';
        return () => { document.title = 'VSM Store'; };
    }, []);

    if (!user) return null;

    const tabs: { value: TabType; label: string; icon: React.ReactNode }[] = [
        { value: 'shipping', label: 'Envío', icon: <Package className="h-3.5 w-3.5" /> },
        { value: 'billing', label: 'Facturación', icon: <FileText className="h-3.5 w-3.5" /> },
    ];

    return (
        <div className="container-vsm py-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-vape-500/10">
                    <MapPin className="h-5 w-5 text-vape-400" />
                </div>
                <h1 className="text-xl font-bold text-primary-100">Mis direcciones</h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 rounded-xl bg-primary-900/50 p-1 border border-primary-800">
                {tabs.map((t) => (
                    <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        className={cn(
                            'flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium transition-all',
                            tab === t.value
                                ? 'bg-primary-800 text-primary-100 shadow-sm'
                                : 'text-primary-500 hover:text-primary-300'
                        )}
                    >
                        {t.icon}
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Lista */}
            <AddressList customerId={user.id} type={tab} />
        </div>
    );
}
