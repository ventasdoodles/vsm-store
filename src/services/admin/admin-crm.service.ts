/**
 * Admin CRM Service — Inteligencia de Datos y Visión 360
 * 
 * Este servicio orquesta la agregación de datos para el panel de inteligencia CRM:
 * - Segmentación RFM (Recency, Frequency, Monetary)
 * - Timeline unificada (Órdenes, Notas, Puntos, Cupones)
 * - Indicadores de salud del cliente
 * 
 * @module services/admin
 */
import { supabase } from '@/lib/supabase';

// ─── Types ───────────────────────────────────────

export interface CustomerIntelligence {
    customer_id: string;
    full_name: string;
    recency_days: number | null;
    frequency: number;
    monetary: number;
    last_order_date: string | null;
    segment: 'Campeón' | 'Leal' | 'Nuevo' | 'En Riesgo' | 'Regular' | 'Prospecto';
    health_status: 'Saludable' | 'Estable' | 'Requiere Atención' | 'Sin Actividad';
}

export interface TimelineEvent {
    id: string;
    type: 'order' | 'note' | 'loyalty' | 'coupon' | 'system';
    title: string;
    description: string;
    date: string;
    amount?: number;
    status?: string;
    metadata?: any;
}

export interface CustomerInsight {
    type: 'success' | 'warning' | 'info' | 'critical';
    title: string;
    description: string;
    actionLabel?: string;
    actionUrl?: string; // Para el futuro enlace a WhatsApp o Cupones
}

export interface StrategicAIResponse {
    analysis: string;
    suggested_coupon?: {
        code: string;
        discount: number;
        reason: string;
    };
    next_steps: string[];
}

// ─── CRM Intelligence Data ──────────────────────

/**
 * Obtiene la inteligencia RFM y segmento para un cliente específico.
 */
export async function getCustomerIntelligence(customerId: string): Promise<CustomerIntelligence | null> {
    const { data, error } = await supabase
        .from('customer_intelligence_360')
        .select('*')
        .eq('customer_id', customerId)
        .maybeSingle();

    if (error) {
        console.error('Error fetching CRM intelligence:', error);
        return null;
    }
    return data as CustomerIntelligence;
}

/**
 * Motor de Inteligencia Proactiva (Fase A - Sin API)
 * Genera recomendaciones basadas en reglas de negocio para cada segmento.
 * Futura Fase B: Integración con Google Gemini para análisis narrativo.
 */
export function getCustomerInsights(intel: CustomerIntelligence): CustomerInsight[] {
    const insights: CustomerInsight[] = [];

    // Lógica por Segmento
    switch (intel.segment) {
        case 'Campeón':
            insights.push({
                type: 'success',
                title: 'Cliente VIP Detectado',
                description: 'Este cliente es uno de tus motores de ingresos. Considera enviarle una nota de agradecimiento personalizada o un acceso anticipado a nuevas colecciones.',
                actionLabel: 'Ver Puntos Lealtad'
            });
            break;
        case 'Leal':
            insights.push({
                type: 'info',
                title: 'Fomentar Repetición',
                description: 'Este cliente compra con frecuencia. Un pequeño incentivo o programa de referidos podría convertirlo en "Campeón".',
            });
            break;
        case 'Nuevo':
            insights.push({
                type: 'success',
                title: 'Bienvenida Crucial',
                description: 'Cliente reciente. Asegura una experiencia de unboxing perfecta para garantizar la segunda compra.',
            });
            break;
        case 'En Riesgo':
            insights.push({
                type: 'critical',
                title: '¡Peligro de Abandono!',
                description: `Han pasado ${intel.recency_days} días desde su última compra. Sugerencia: Envía un cupón de "Te extrañamos" del 15% vía WhatsApp.`,
                actionLabel: 'Preparar WhatsApp'
            });
            break;
        case 'Prospecto':
            insights.push({
                type: 'warning',
                title: 'Primera Conversión Pendiente',
                description: 'Usuario registrado sin compras. ¿Ha tenido problemas con el carrito? Intenta un contacto preventivo.',
            });
            break;
        default:
            insights.push({
                type: 'info',
                title: 'Mantener Interacción',
                description: 'Cliente regular. Mantén presencia con el newsletter semanal.',
            });
    }

    // Lógica por Salud (Independiente del segmento)
    if (intel.health_status === 'Requiere Atención') {
        insights.push({
            type: 'warning',
            title: 'Salud en Declive',
            description: 'La frecuencia de interacción ha bajado. Revisa si hay tickets de soporte abiertos o quejas previas.',
        });
    }

    return insights;
}

// ─── Timeline Aggregation ───────────────────────

/**
 * Consolida todos los eventos de un cliente en una línea de tiempo cronológica única.
 * Orquesta datos de orders, loyalty_points, admin_notes y coupons.
 */
export async function getCustomerTimeline(customerId: string): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    // 1. Obtener Órdenes
    const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, total, status, created_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    orders?.forEach(o => {
        events.push({
            id: o.id,
            type: 'order',
            title: `Pedido ${o.order_number}`,
            description: `Estado: ${o.status}. Total: $${o.total}`,
            date: o.created_at,
            amount: o.total,
            status: o.status
        });
    });

    // 2. Obtener Notas Administrativas
    const { data: adminData } = await supabase
        .from('admin_customer_notes')
        .select('notes, tags, updated_at')
        .eq('customer_id', customerId)
        .maybeSingle();

    if (adminData?.notes) {
        events.push({
            id: `note-${adminData.updated_at}`,
            type: 'note',
            title: 'Nota Administrativa',
            description: adminData.notes,
            date: adminData.updated_at,
            metadata: { tags: adminData.tags }
        });
    }

    // 3. Obtener Puntos de Lealtad
    const { data: points } = await supabase
        .from('loyalty_points')
        .select('id, points, transaction_type, description, created_at')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

    points?.forEach(p => {
        events.push({
            id: p.id,
            type: 'loyalty',
            title: p.transaction_type === 'earned' ? 'Puntos Ganados' : 'Puntos Canjeados',
            description: p.description,
            date: p.created_at,
            amount: p.points
        });
    });

    // 4. Obtener Cupones Usados
    const { data: coupons } = await supabase
        .from('customer_coupons')
        .select('id, coupon_code, used_at')
        .eq('customer_id', customerId)
        .order('used_at', { ascending: false });

    coupons?.forEach(c => {
        events.push({
            id: c.id,
            type: 'coupon',
            title: 'Cupón Utilizado',
            description: `Se aplicó el cupón: ${c.coupon_code}`,
            date: c.used_at
        });
    });

    // Ordenar todo por fecha descendente
    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
/**
 * Obtiene una narrativa generada por IA (Gemini) sobre el comportamiento del cliente.
 */
export async function getCustomerNarrative(customerId: string): Promise<string> {
    try {
        const { data, error } = await supabase.functions.invoke('customer-narrative', {
            body: { customerId }
        });

        if (error) throw error;
        return data.narrative || "No se pudo generar una narrativa.";
    } catch (error) {
        console.error('Error fetching CRM narrative:', error);
        return "La IA está descansando. Intenta de nuevo más tarde.";
    }
}
/**
 * Obtiene un análisis estratégico profundo y sugerencias de cupones (Gemini / Edge Function).
 */
export async function getStrategicLoyaltyAnalysis(customerId: string): Promise<StrategicAIResponse> {
    try {
        const { data, error } = await supabase.functions.invoke('loyalty-intelligence', {
            body: { customerId }
        });

        if (error) throw error;
        return data as StrategicAIResponse;
    } catch (error) {
        console.error('Error fetching Strategic CRM analysis:', error);
        throw error;
    }
}
