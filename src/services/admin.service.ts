import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { Product, Section } from '@/types/product';
import type { Category } from '@/types/category';
import type { AddressData } from '@/services/addresses.service';

// ─── Auth Admin ──────────────────────────────────
export async function checkIsAdmin(userId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', userId)
        .single();

    if (error || !data) return false;
    return true;
}

// ─── Dashboard Stats ─────────────────────────────
export interface DailySales {
    date: string;
    total: number;
    count: number;
}

export interface TopProduct {
    name: string;
    sold: number;
    revenue: number;
}

export interface DashboardStats {
    salesToday: number;
    pendingOrders: number;
    lowStockProducts: number;
    totalCustomers: number;
    totalProducts: number;
    totalOrders: number;
    salesLast7Days: DailySales[];
    topProducts: TopProduct[];
}

export async function getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    const start = startDate ? new Date(startDate) : new Date();
    if (!startDate) start.setDate(start.getDate() - 6); // Default 7 days
    start.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ventas del día
    const { data: todayOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', today.toISOString());

    const salesToday = todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0;

    // Pedidos pendientes
    const { count: pendingOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pendiente', 'confirmado', 'preparando']);

    // Productos con stock bajo (< 5)
    const { count: lowStockProducts } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
        .lt('stock', 5);

    // Total clientes
    const { count: totalCustomers } = await supabase
        .from('customer_profiles')
        .select('id', { count: 'exact', head: true });

    // Total productos activos
    const { count: totalProducts } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true);

    // Total pedidos
    const { count: totalOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });

    // Ventas en Rango (Chart)
    const { data: rangeOrders } = await supabase
        .from('orders')
        .select('total, created_at')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .not('status', 'eq', 'cancelado');

    // Group by day using a loop from start to end
    const dayMap = new Map<string, { total: number; count: number }>();
    const loopDate = new Date(start);
    while (loopDate <= end) {
        dayMap.set(loopDate.toISOString().slice(0, 10), { total: 0, count: 0 });
        loopDate.setDate(loopDate.getDate() + 1);
    }
    for (const o of rangeOrders ?? []) {
        const day = o.created_at?.slice(0, 10);
        if (day && dayMap.has(day)) {
            const entry = dayMap.get(day)!;
            entry.total += o.total || 0;
            entry.count += 1;
        }
    }
    const salesLast7Days: DailySales[] = Array.from(dayMap.entries()).map(
        ([date, { total, count }]) => ({ date, total, count })
    );

    // Top 5 productos by revenue (in range)
    const { data: ordersInRange } = await supabase
        .from('orders')
        .select('items')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .not('status', 'eq', 'cancelado');

    const productMap = new Map<string, { sold: number; revenue: number }>();
    for (const order of ordersInRange ?? []) {
        const items = (order.items as OrderItem[]) ?? [];
        for (const item of items) {
            const name = item.name || item.product_name || 'Sin nombre';
            const existing = productMap.get(name) ?? { sold: 0, revenue: 0 };
            existing.sold += item.quantity || 0;
            existing.revenue += (item.price || 0) * (item.quantity || 0);
            productMap.set(name, existing);
        }
    }
    const topProducts: TopProduct[] = Array.from(productMap.entries())
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return {
        salesToday,
        pendingOrders: pendingOrders ?? 0,
        lowStockProducts: lowStockProducts ?? 0,
        totalCustomers: totalCustomers ?? 0,
        totalProducts: totalProducts ?? 0,
        totalOrders: totalOrders ?? 0,
        salesLast7Days,
        topProducts,
    };
}

// ─── Orders (Admin) ──────────────────────────────
export type OrderStatus = 'pendiente' | 'confirmado' | 'preparando' | 'enviado' | 'entregado' | 'cancelado';

export const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'pendiente', label: 'Pendiente', color: '#f59e0b' },
    { value: 'confirmado', label: 'Confirmado', color: '#3b82f6' },
    { value: 'preparando', label: 'Preparando', color: '#8b5cf6' },
    { value: 'enviado', label: 'Enviado', color: '#06b6d4' },
    { value: 'entregado', label: 'Entregado', color: '#10b981' },
    { value: 'cancelado', label: 'Cancelado', color: '#ef4444' },
];

export async function getAllOrders(statusFilter?: OrderStatus) {
    let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    if (statusFilter) {
        query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

    if (error) throw error;
}

// ─── Products (Admin CRUD) ───────────────────────
export interface ProductFormData {
    name: string;
    slug: string;
    description: string;
    short_description: string;
    price: number;
    compare_at_price: number | null;
    stock: number;
    sku: string;
    section: Section;
    category_id: string;
    tags: string[];
    status: string;
    images: string[];
    cover_image: string | null;
    is_featured: boolean;
    is_featured_until: string | null;
    is_new: boolean;
    is_new_until: string | null;
    is_bestseller: boolean;
    is_bestseller_until: string | null;
    is_active: boolean;
}

export interface CategoryFormData {
    name: string;
    slug: string;
    section: Section;
    parent_id: string | null;
    is_active: boolean;
    description?: string;
    order_index?: number;
}

export async function getAllProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as Product[]) ?? [];
}

export async function createProduct(product: ProductFormData) {
    const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

    if (error) throw error;
    return data as Product;
}

export async function updateProduct(id: string, product: Partial<ProductFormData>) {
    const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Product;
}

export async function deleteProduct(id: string) {
    // Soft delete: marcar como inactivo
    const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

export async function toggleProductFlag(id: string, flag: 'is_featured' | 'is_new' | 'is_bestseller' | 'is_active', value: boolean) {
    const { error } = await supabase
        .from('products')
        .update({ [flag]: value })
        .eq('id', id);

    if (error) throw error;
}

// ─── Categories (Admin CRUD) ─────────────────────
export async function getAllCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('section', { ascending: true })
        .order('order_index', { ascending: true });

    if (error) throw error;
    return (data as Category[]) ?? [];
}

export async function createCategory(category: CategoryFormData) {
    const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

    if (error) throw error;
    return data as Category;
}

export async function updateCategory(id: string, category: Partial<CategoryFormData>) {
    const { data, error } = await supabase
        .from('categories')
        .update(category)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as Category;
}

export async function deleteCategory(id: string) {
    const { error } = await supabase
        .from('categories')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}

export async function toggleCategoryActive(id: string, flag: boolean) {
    const { error } = await supabase
        .from('categories')
        .update({ is_active: flag })
        .eq('id', id);

    if (error) throw error;
}

// ─── Recent Orders (Dashboard) ───────────────────
export interface OrderItem {
    product_id?: string;
    name?: string;
    product_name?: string;
    quantity: number;
    price: number;
    image?: string;
}

export interface AdminOrder {
    id: string;
    created_at: string;
    status: OrderStatus;
    total: number;
    customer_name: string | null;
    customer_phone?: string | null;
    delivery_address?: string | null;
    payment_method?: string | null;
    delivery_method?: string | null;
    coupon_code?: string | null;
    items?: OrderItem[];
}

export async function getRecentOrders(limit = 10) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return (data as AdminOrder[]) ?? [];
}

// ─── Single Product (For Edit) ───────────────────
export async function getProductById(id: string) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

    if (error) throw error;
    return data as Product;
}

// ─── Customers (Admin) ──────────────────────────
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

// ─── Create Customer (Admin) ─────────────────────
export interface CreateCustomerData {
    email: string;
    password?: string;
    full_name: string;
    phone: string;
    whatsapp: string;
    address: Omit<AddressData, 'customer_id'>;
}

export async function createCustomerWithDetails(data: CreateCustomerData) {
    // 1. Crear cliente temporal para Auth (para no desloguear al admin)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const tempClient = createClient(supabaseUrl, supabaseAnonKey);

    const password = data.password || 'Temporal123!';

    // 2. Sign Up
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

    // 3. Crear Profile (usando tempClient para asegurar permisos de insert propio si RLS lo pide)
    // Nota: Si existe un trigger que crea el profile automáticamente, esto podría dar error de duplicado.
    // Intentaremos upsert por si acaso.
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
        // No lanzamos error fatal, ya que el usuario se creó
    }

    // 4. Crear Dirección
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

// ─── CRM Features (Rich Profiles) ────────────────
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

    // 3. Get Auth Email (Admin function needed or strict RLS)
    // Note: client-side we can't get other user's email easily without an Edge Function or stored in profile.
    // For now, assuming email might be in profile or we skip it.

    // 4. Get Addresses
    const { data: addresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', customerId);

    // 5. Get Orders Stats
    const { data: orders } = await supabase
        .from('orders')
        .select('total, created_at, status')
        .eq('customer_id', customerId)
        .not('status', 'eq', 'cancelado');

    const total_orders = orders?.length ?? 0;
    const total_spent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) ?? 0;
    const aov = total_orders > 0 ? total_spent / total_orders : 0;
    const last_order_date = orders && orders.length > 0 ? orders[0].created_at : null;

    // 6. Get Evidence Files
    const { data: files } = await supabase.storage
        .from('customer-evidence')
        .list(customerId); // Folder per customer

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

// ─── Coupons (Admin CRUD) ───────────────────────
export interface AdminCoupon {
    id: string;
    code: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    valid_from: string | null;
    valid_until: string | null;
    created_at?: string;
}

export interface CouponFormData {
    code: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    min_purchase: number;
    max_uses: number | null;
    is_active: boolean;
    valid_from: string | null;
    valid_until: string | null;
}

export async function getAllCoupons() {
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as AdminCoupon[]) ?? [];
}

export async function createCoupon(coupon: CouponFormData) {
    const { data, error } = await supabase
        .from('coupons')
        .insert({ ...coupon, current_uses: 0 })
        .select()
        .single();

    if (error) throw error;
    return data as AdminCoupon;
}

export async function updateCoupon(id: string, coupon: Partial<CouponFormData>) {
    const { data, error } = await supabase
        .from('coupons')
        .update(coupon)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return data as AdminCoupon;
}

export async function deleteCoupon(id: string) {
    const { error } = await supabase
        .from('coupons')
        .update({ is_active: false })
        .eq('id', id);

    if (error) throw error;
}
