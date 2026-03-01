import { ArrowLeft, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminCustomerDetail } from '@/services/admin';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerHeader({ customer }: Props) {
    const navigate = useNavigate();

    return (
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/customers')} className="rounded-xl p-2 hover:bg-theme-primary/50 text-theme-secondary">
                <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
                <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
                    {customer.full_name || 'Sin Nombre'}
                    {customer.admin_notes?.tags?.includes('VIP') && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-500/30">VIP</span>
                    )}
                </h1>
                <div className="flex gap-4 text-sm text-theme-secondary mt-1">
                    <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {customer.phone || '--'}</span>
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {customer.email || 'No email'}</span>
                </div>
            </div>
        </div>
    );
}
