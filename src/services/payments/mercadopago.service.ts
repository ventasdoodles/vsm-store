import { supabase } from '@/lib/supabase'

interface CreatePaymentResponse {
    init_point: string
    preference_id: string
}

export const mercadopagoService = {
    /**
     * Crea una preferencia de pago en Mercado Pago y retorna la URL de checkout
     */
    async createPayment(orderId: string): Promise<CreatePaymentResponse> {
        const { data, error } = await supabase.functions.invoke('create-payment', {
            body: { order_id: orderId }
        })

        if (error) {
            console.error('Error creating payment:', error)
            throw new Error('No se pudo generar el link de pago. Intenta nuevamente.')
        }

        return data as CreatePaymentResponse
    }
}
