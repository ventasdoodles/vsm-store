/**
 * CustomerHeader — Hero del Perfil de Cliente
 * 
 * Muestra avatar con iniciales, nombre, badges VIP/Verificado,
 * datos de contacto (teléfono, email, WhatsApp) y acciones rápidas.
 * Detecta automáticamente si el cliente tiene la etiqueta VIP.
 * 
 * @module admin/customers/details
 */
import { ArrowLeft, Phone, Mail, Link as LinkIcon, ExternalLink, CalendarDays, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AdminCustomerDetail } from '@/services/admin';
import { useNotification } from '@/hooks/useNotification';

interface Props {
    customer: AdminCustomerDetail;
}

export function CustomerHeader({ customer }: Props) {
    const navigate = useNavigate();
    const notify = useNotification();

    const handleCopyId = () => {
        navigator.clipboard.writeText(customer.id);
        notify.success('Copiado', 'ID de cliente copiado al portapapeles');
    };

    const isVIP = customer.admin_notes?.tags?.includes('VIP') || false;
    const isVerified = customer.whatsapp ? true : false; // using whatsapp as simple verified proxy

    // Avatar initals
    const getInitials = (name?: string | null) => {
        if (!name) return '??';
        const parts = name.split(' ');
        if (parts.length >= 2) return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase() || '??';
        return name.substring(0, 2).toUpperCase();
    };

    const formattedDate = new Date(customer.created_at).toLocaleDateString('es-MX', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="relative group overflow-hidden bg-[#13141f]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 lg:p-8 hover:border-white/10 transition-colors shadow-2xl">
            {/* Ambient Base Glow */}
            <div className={`absolute top-0 right-0 w-96 h-96 ${isVIP ? 'bg-yellow-500/5' : 'bg-blue-500/5'} rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50 block`} />
            
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                
                {/* Back Button (Floating) */}
                <button 
                    onClick={() => navigate('/admin/customers')} 
                    className="absolute -top-2 -left-2 md:static md:top-auto md:left-auto flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-theme-secondary hover:text-white transition-colors border border-white/5 hover:border-white/10"
                    title="Volver al directorio"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Avatar / Identity */}
                <div className="hidden md:flex flex-shrink-0 relative">
                    <div className={`h-20 w-20 rounded-2xl flex items-center justify-center text-3xl font-black shadow-inner
                        ${isVIP ? 'bg-gradient-to-br from-yellow-400 to-amber-600 text-black shadow-amber-500/20' : 'bg-gradient-to-br from-[#1a1c29] to-[#2a2d3d] text-white border border-white/10'}
                    `}>
                        {getInitials(customer.full_name)}
                    </div>
                    {isVerified && (
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-[#1a1c29] rounded-full flex items-center justify-center border-2 border-[#13141f]">
                            <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Core Info */}
                <div className="flex-1 min-w-0 mt-8 md:mt-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight truncate">
                            {customer.full_name || 'Usuario Sincrónico'}
                        </h1>
                        {isVIP && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                ⭐️ Cliente VIP
                            </div>
                        )}
                        {!isVIP && customer.orders_summary?.total_spent > 0 && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold tracking-wider backdrop-blur-md">
                                Consumidor
                            </div>
                        )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm font-medium">
                        <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-theme-secondary hover:text-white transition-colors group/link cursor-pointer">
                            <Phone className="h-4 w-4 group-hover/link:text-green-400 transition-colors" />
                            <span className="font-mono">{customer.phone || 'Sin teléfono'}</span>
                        </a>
                        
                        {customer.email && (
                            <a href={`mailto:${customer.email}`} className="flex items-center gap-2 text-theme-secondary hover:text-white transition-colors group/link cursor-pointer">
                                <Mail className="h-4 w-4 group-hover/link:text-blue-400 transition-colors" />
                                <span>{customer.email}</span>
                            </a>
                        )}

                        <div className="flex items-center gap-2 text-theme-secondary/70">
                            <CalendarDays className="h-4 w-4" />
                            <span>Unido el {formattedDate}</span>
                        </div>
                    </div>
                </div>

                {/* Action Shortcuts */}
                <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                    <button 
                        onClick={handleCopyId}
                        className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl text-white text-sm font-medium transition-all group/btn"
                    >
                        <LinkIcon className="h-4 w-4 text-theme-secondary group-hover/btn:text-white transition-colors" />
                        <span>Copiar ID</span>
                    </button>
                    {customer.phone && (
                        <a 
                            href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 md:flex-none flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 hover:border-green-500/30 rounded-xl text-green-400 text-sm font-medium transition-all group/btn"
                        >
                            <ExternalLink className="h-4 w-4" />
                            <span>WhatsApp</span>
                        </a>
                    )}
                </div>

            </div>
        </div>
    );
}
