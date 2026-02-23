import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminCustomerDetails } from '@/services/admin';

// Importar los Legos (Sub-componentes)
import { CustomerHeader } from '@/components/admin/customers/details/CustomerHeader';
import { CustomerStats } from '@/components/admin/customers/details/CustomerStats';
import { CustomerTimeline } from '@/components/admin/customers/details/CustomerTimeline';
import { CustomerMarketing } from '@/components/admin/customers/details/CustomerMarketing';
import { CustomerNotes } from '@/components/admin/customers/details/CustomerNotes';
import { CustomerEvidence } from '@/components/admin/customers/details/CustomerEvidence';
import { CustomerAddress } from '@/components/admin/customers/details/CustomerAddress';
import { CustomerGodMode } from '@/components/admin/customers/details/CustomerGodMode';
import { CustomerPreferences } from '@/components/admin/customers/details/CustomerPreferences';

export function AdminCustomerDetails() {
    const { id } = useParams<{ id: string }>();

    const { data: customer, isLoading } = useQuery({
        queryKey: ['admin', 'customer', id],
        queryFn: () => getAdminCustomerDetails(id!),
        enabled: !!id,
    });

    if (isLoading) return <div className="p-8 text-center text-theme-secondary">Cargando perfil...</div>;
    if (!customer) return <div className="p-8 text-center text-red-400">Cliente no encontrado</div>;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <CustomerHeader customer={customer} />

            {/* Stats Grid */}
            <CustomerStats stats={customer.orders_summary} />

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Col: CRM Controls & Timeline */}
                <div className="md:col-span-2 space-y-6">
                    {/* Lego: Línea de Tiempo */}
                    <CustomerTimeline customerId={customer.id} />

                    {/* Lego: Notas y Etiquetas */}
                    <CustomerNotes customer={customer} />
                </div>

                {/* Right Col: Marketing, Evidence & Info */}
                <div className="space-y-6">
                    {/* Lego: Acciones de Marketing */}
                    <CustomerMarketing customerId={customer.id} />

                    {/* Lego: Preferencias de Consumo */}
                    <CustomerPreferences customerId={customer.id} />

                    {/* Lego: Evidencia */}
                    <CustomerEvidence customer={customer} />

                    {/* Lego: Dirección */}
                    <CustomerAddress customer={customer} />
                </div>
            </div>

            {/* God Mode Actions */}
            <CustomerGodMode customer={customer} />
        </div>
    );
}
