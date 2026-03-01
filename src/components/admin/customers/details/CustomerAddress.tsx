import { MapPin } from 'lucide-react';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerAddress({ customer }: Props) {
    if (!customer.addresses?.[0]) return null;

    return (
        <div className="rounded-2xl border border-theme bg-theme-primary/20 p-5">
            <h3 className="text-sm font-semibold text-herbal-400 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Dirección Principal
            </h3>
            <div className="text-sm text-theme-secondary">
                <p>{customer.addresses[0].street} #{customer.addresses[0].number}</p>
                <p>{customer.addresses[0].colony}</p>
                <p>{customer.addresses[0].city}, {customer.addresses[0].state}</p>
                {customer.addresses[0].references && (
                    <p className="mt-2 text-xs text-theme-secondary italic">"{customer.addresses[0].references}"</p>
                )}
            </div>
        </div>
    );
}
