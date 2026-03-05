/**
 * AdminCustomerDetails — Orquestador de Perfil CRM Premium
 * 
 * Punto de entrada para la vista detallada de un cliente.
 * Coordina todos los sub-componentes "Lego" del CRM:
 * Header, Stats, Timeline, Marketing, Notes, Evidence, Address, Preferences y GodMode.
 * 
 * @module admin/customers/details
 */
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAdminCustomerDetails } from '@/services/admin';

import { Loader2 } from 'lucide-react';

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
import { CustomerWishlist } from '@/components/admin/customers/details/CustomerWishlist';

export function AdminCustomerDetails() {
    const { id } = useParams<{ id: string }>();

    const { data: customer, isLoading } = useQuery({
        queryKey: ['admin', 'customer', id],
        queryFn: () => getAdminCustomerDetails(id!),
        enabled: !!id,
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-theme-secondary font-medium tracking-wide">Cargando perfil del cliente...</p>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-[#13141f] rounded-[2rem] border border-white/5 mx-auto max-w-2xl mt-10">
                <div className="text-4xl">🕵️</div>
                <h2 className="text-xl font-black text-theme-primary">Cliente no encontrado</h2>
                <p className="text-sm text-theme-secondary">El ID proporcionado no pertenece a ningún usuario registrado.</p>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <CustomerHeader customer={customer} />

            {/* Quick Metrics */}
            <CustomerStats customer={customer} />

            {/* Main Orchestrator Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6 xl:gap-8 xl:items-start pl-1 pr-1">
                
                {/* Left Column (Operations & Evidence) */}
                <div className="space-y-6 flex flex-col min-w-0">
                    
                    {/* Activity Timeline (First because it's the core story of the customer) */}
                    <CustomerTimeline customer={customer} />
                    
                    {/* Orders Evidence List */}
                    <CustomerEvidence customer={customer} />

                    {/* Addresses (Secondary operational data) */}
                    <CustomerAddress customer={customer} />

                    {/* Wishlist — Productos favoritos del cliente */}
                    <CustomerWishlist customer={customer} />

                </div>

                {/* Right Column (CRM, Retention, Actions) */}
                <div className="space-y-6 flex flex-col xl:sticky xl:top-[120px] min-w-0">
                    
                    {/* Retention & Marketing Machine */}
                    <CustomerMarketing customer={customer} />
                    
                    {/* Customer Specific Notes (Notion Style) */}
                    <CustomerNotes customer={customer} />

                    {/* Preferences & Tags */}
                    <CustomerPreferences customer={customer} />

                    {/* Critical Controls (Danger Zone) */}
                    <CustomerGodMode customer={customer} />
                    
                </div>
            </div>
        </div>
    );
}
