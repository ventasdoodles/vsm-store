import { Building, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Address } from '@/hooks/useAddresses';

interface ShippingAddressContentProps {
    isAuthenticated: boolean;
    shippingAddresses: Address[];
    useNewAddress: boolean;
    selectedAddressId: string;
    addressFormValue: string;
    errors: { address?: string };
    setSelectedAddressId: (id: string) => void;
    setUseNewAddress: (val: boolean) => void;
    setAddressFormValue: (val: string) => void;
}

export function ShippingAddressContent({
    isAuthenticated,
    shippingAddresses,
    useNewAddress,
    selectedAddressId,
    addressFormValue,
    errors,
    setSelectedAddressId,
    setUseNewAddress,
    setAddressFormValue
}: ShippingAddressContentProps) {
    if (isAuthenticated && shippingAddresses.length > 0 && !useNewAddress) {
        return (
            <div className="space-y-4">
                <div className="grid gap-3">
                    {shippingAddresses.map((a: Address) => (
                        <button
                            key={a.id}
                            onClick={() => setSelectedAddressId(a.id)}
                            className={cn(
                                "flex items-center gap-4 rounded-2xl border p-4 text-left transition-all",
                                selectedAddressId === a.id
                                    ? "border-vape-500 bg-vape-500/10 text-white"
                                    : "border-white/5 text-theme-secondary hover:bg-white/5"
                            )}
                        >
                            <div className={cn(
                                "flex h-8 w-8 items-center justify-center rounded-full border",
                                selectedAddressId === a.id ? "border-vape-400 bg-vape-400/20" : "border-white/10"
                            )}>
                                <Building className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-vape-400">{a.label}</p>
                                <p className="text-[11px] text-theme-tertiary">{a.street} #{a.number}, {a.colony}</p>
                            </div>
                            {selectedAddressId === a.id && <CheckCircle className="h-5 w-5 text-vape-400" />}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setUseNewAddress(true)}
                    className="text-xs font-bold text-vape-400 hover:text-vape-300 ml-2"
                >
                    + Agregar nueva dirección
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative group">
                <textarea
                    value={addressFormValue}
                    onChange={(e) => setAddressFormValue(e.target.value)}
                    placeholder="Calle, número, colonia, código postal y referencias..."
                    rows={4}
                    className={cn(
                        "w-full rounded-2xl border border-white/5 bg-black/20 p-4 text-sm text-white transition-all focus:border-vape-500/50 focus:outline-none",
                        errors.address && "border-red-500/50"
                    )}
                />
                {errors.address && <p className="mt-2 text-[11px] text-red-500 ml-2">{errors.address}</p>}
            </div>
            {isAuthenticated && (
                <button
                    onClick={() => setUseNewAddress(false)}
                    className="text-xs font-bold text-theme-tertiary hover:text-white"
                >
                    ← Volver a mis direcciones
                </button>
            )}
        </div>
    );
}
