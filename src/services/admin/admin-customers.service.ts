// ─── Admin Customers Service ─────────────────────
import { supabase } from '@/lib/supabase';
import type { AddressData } from '@/services/addresses.service';

// ─── Types ───────────────────────────────────────
export interface AdminCustomer {
    id: string;
    full_name: string | null;
    phone: string | null;
    whatsapp: string | null;
    birthdate: string | null;
    created_at: string;
    total_orders?: number;
    total_spent?: number;
}

export interface AdminCustomerDetail extends AdminCustomer {
    email?: string;
    account_status?: 'active' | 'suspended' | 'banned';
    suspension_end?: string | null;
    addresses: AddressData[];
    orders_summary: {
        total_spent: number;
        total_orders: number;
        aov: number;
        last_order_date: string | null;
    };
    admin_notes: {
        notes: string;
        tags: string[];
        custom_fields: Record<string, string>;
    } | null;
    evidence: {
        id: string;
        url: string;
        file_name: string;
        uploaded_at: string;
    }[];
}

export interface CreateCustomerData {
    email: string;
    password?: string;
    full_name: string;
    phone: string;
    whatsapp: string;
    address: Omit<AddressData, 'customer_id'>;
}

// ─── List & Detail ──────────────────────────────
export async function getAllCustomers() {
    const { data, error } = await supabase
        .from('customer_profiles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as AdminCustomer[]) ?? [];
}

export async function getCustomerOrders(customerId: string) {
    const { data, error } = await supabase
        .from('orders')
        .select('id, created_at, status, total')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) throw error;
    return data ?? [];
}

export async function getAdminCustomerDetails(customerId: string): Promise<AdminCustomerDetail> {
    // 1. Get Profile
    const { data: profile, error: profileError } = await supabase
        .from('customer_profiles')
        .select('*')
        .eq('id', customerId)
        .single();
    if (profileError) throw profileError;

    // 2. Get Admin Notes
    const { data: notes } = await supabase
        .from('admin_customer_notes')
        .select('*')
        .eq('customer_id', customerId)
        .single();

    // 3. Get Addresses
    const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId);

    // 4. Get Orders Stats
    const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .eq('customer_id', customerId)
        .not('status', 'eq', 'cancelado');

    const total_orders = orders?.length ?? 0;
    const total_spent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0;
    const aov = total_orders > 0 ? total_spent / total_orders : 0;
    const last_order_date = orders?.[0]?.created_at ?? null;

    // 5. Get Evidence Files
    const { data: files } = await supabase.storage
        .from('customer-evidence')
        .list(customerId);

    const evidence = files?.map(f => ({
        name: f.name,
        url: supabase.storage.from('customer-evidence').getPublicUrl(`${customerId}/${f.name}`).data.publicUrl,
        created_at: f.created_at,
    })) ?? [];

    return {
        ...profile,
        addresses: addresses ?? [],
        admin_notes: {
            tags: notes?.tags ?? [],
            custom_fields: notes?.custom_fields ?? {},
            notes: notes?.notes ?? '',
        },
        orders_summary: {
            total_orders,
            total_spent,
            last_order_date,
            aov,
        },
        evidence,
    };
}

// ─── Create Customer ─────────────────────────────
// Uses the shared supabase client with anon key.
// Note: createCustomerWithDetails creates a separate auth session
// to register a new user without logging out the admin.
// This is safe because it only uses the anon key, NOT the service role key.
export async function createCustomerWithDetails(data: CreateCustomerData) {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const tempClient = createClient(supabaseUrl, supabaseAnonKey);

    const password = data.password || 'Temporal123!';

    const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: data.email,
        password: password,
        options: {
            data: {
                full_name: data.full_name,
                phone: data.phone,
            },
        },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    const userId = authData.user.id;

    const { error: profileError } = await tempClient
        .from('customer_profiles')
        .upsert({
            id: userId,
            full_name: data.full_name,
            phone: data.phone,
            whatsapp: data.whatsapp,
        });

    if (profileError) {
        console.error('Error creando perfil:', profileError);
    }

    const { error: addressError } = await tempClient
        .from('addresses')
        .insert({
            ...data.address,
            customer_id: userId,
            city: data.address.city ?? 'Xalapa',
            state: data.address.state ?? 'Veracruz',
            is_default: true,
        });

    if (addressError) {
        console.error('Error creando dirección:', addressError);
    }
    return authData.user;
}

// ─── CRM Operations ─────────────────────────────
export async function updateAdminCustomerNotes(
    customerId: string,
    data: { tags?: string[]; custom_fields?: Record<string, string>; notes?: string }
) {
    const { error } = await supabase
        .from('admin_customer_notes')
        .upsert({
            customer_id: customerId,
            ...data,
            updated_at: new Date().toISOString(),
        });

    if (error) throw error;
}

export async function uploadCustomerEvidence(customerId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${customerId}/${fileName}`;

    const { error } = await supabase.storage
        .from('customer-evidence')
        .upload(filePath, file);

    if (error) throw error;
    return filePath;
}

export async function updateCustomerStatus(
    customerId: string,
    status: 'active' | 'suspended' | 'banned',
    suspensionEnd?: string | null
) {
    const { error } = await supabase
        .from('customer_profiles')
        .update({
            account_status: status,
            suspension_end: suspensionEnd || null
        })
        .eq('id', customerId);

    if (error) throw error;
}

export async function sendCustomerNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'warning' | 'alert' | 'success' = 'info'
) {
    const { error } = await supabase
        .from('user_notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
        });

    if (error) throw error;
}
