// Servicio de administración - VSM Store
// Funciones exclusivas para el panel de admin
import { supabase } from '@/lib/supabase';
import type { Product, Section } from '@/types/product';
import type { Category } from '@/types/category';

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
export interface DashboardStats {
    salesToday: number;
    pendingOrders: number;
    lowStockProducts: number;
    totalCustomers: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
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

    return {
        salesToday,
        pendingOrders: pendingOrders ?? 0,
        lowStockProducts: lowStockProducts ?? 0,
        totalCustomers: totalCustomers ?? 0,
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
    is_featured: boolean;
    is_new: boolean;
    is_bestseller: boolean;
    is_active: boolean;
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

export interface CategoryFormData {
    name: string;
    slug: string;
    section: Section;
    parent_id: string | null;
    description: string;
    order_index: number;
    is_active: boolean;
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

// ─── Recent Orders (Dashboard) ───────────────────
export async function getRecentOrders(limit = 10) {
    const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;
    return data ?? [];
}
