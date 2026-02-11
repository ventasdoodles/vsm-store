// Servicio de direcciones - VSM Store
import { supabase } from '@/lib/supabase';

export interface AddressData {
    customer_id: string;
    type: 'shipping' | 'billing';
    label: string;
    full_name: string;
    street: string;
    number: string;
    colony: string;
    city?: string;
    state?: string;
    zip_code: string;
    phone?: string;
    notes?: string;
    is_default?: boolean;
}

export interface Address extends AddressData {
    id: string;
    created_at: string;
}

// ─── Obtener todas las direcciones del cliente ───
export async function getAddresses(customerId: string) {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Address[];
}

// ─── Obtener dirección por defecto ───────────────
export async function getDefaultAddress(customerId: string, type: 'shipping' | 'billing') {
    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId)
        .eq('type', type)
        .eq('is_default', true)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as Address | null;
}

// ─── Crear dirección ─────────────────────────────
export async function createAddress(data: AddressData) {
    // Si es default, quitar default de las demás del mismo tipo
    if (data.is_default) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('customer_id', data.customer_id)
            .eq('type', data.type);
    }

    const { data: created, error } = await supabase
        .from('addresses')
        .insert({
            ...data,
            city: data.city ?? 'Xalapa',
            state: data.state ?? 'Veracruz',
        })
        .select()
        .single();

    if (error) throw error;
    return created as Address;
}

// ─── Actualizar dirección ────────────────────────
export async function updateAddress(id: string, data: Partial<AddressData>) {
    const { error } = await supabase
        .from('addresses')
        .update(data)
        .eq('id', id);

    if (error) throw error;
}

// ─── Eliminar dirección ──────────────────────────
export async function deleteAddress(id: string) {
    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

// ─── Establecer dirección predeterminada ─────────
export async function setDefaultAddress(id: string, customerId: string, type: 'shipping' | 'billing') {
    // Quitar default de las demás
    await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId)
        .eq('type', type);

    // Marcar esta como default
    const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

    if (error) throw error;
}

// ─── Formatear dirección como texto ──────────────
export function formatAddress(addr: Address): string {
    return `${addr.street} #${addr.number}, ${addr.colony}, ${addr.city ?? 'Xalapa'}, ${addr.state ?? 'Veracruz'} CP ${addr.zip_code}`;
}
