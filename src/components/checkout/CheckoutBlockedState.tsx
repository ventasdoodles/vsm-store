import { ShoppingBag } from 'lucide-react';
import { m } from 'framer-motion';

interface CheckoutBlockedStateProps {
    headline: string;
    detail: string;
    onGoToCatalog: () => void;
}

export function CheckoutBlockedState({ headline, detail, onGoToCatalog }: CheckoutBlockedStateProps) {
    return (
        <m.div 
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative overflow-hidden rounded-[2.5rem] border border-red-500/30 bg-black/40 p-8 sm:p-12 text-center shadow-[0_0_50px_rgba(239,68,68,0.15)] backdrop-blur-3xl"
        >
            <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-red-600/10 blur-[80px] pointer-events-none" />
            <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-orange-600/10 blur-[80px] pointer-events-none" />
            
            <m.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, delay: 0.2 }}
                className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 shadow-inner"
            >
                <ShoppingBag className="h-10 w-10 text-red-400 drop-shadow-[0_0_15px_rgba(248,113,113,0.5)]" />
            </m.div>
            
            <h2 className="relative z-10 text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
                {headline}
            </h2>
            <p className="relative z-10 mt-4 text-sm sm:text-base font-medium leading-relaxed text-red-100/70 max-w-md mx-auto">
                {detail}
            </p>
            
            <m.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGoToCatalog}
                className="relative z-10 mt-10 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-orange-600 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_-10px_rgba(239,68,68,0.5)] transition-all hover:shadow-[0_15px_40px_-10px_rgba(239,68,68,0.7)]"
            >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 skew-x-12 rounded-2xl" />
                Volver al catálogo
            </m.button>
        </m.div>
    );
}
