import { ArrowLeft } from 'lucide-react';

interface CheckoutHeaderProps {
    onBack: () => void;
}

export function CheckoutHeader({ onBack }: CheckoutHeaderProps) {
    return (
        <div className="mb-8 flex items-center gap-4">
            <button
                onClick={onBack}
                className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-theme-secondary hover:bg-vape-500/10 hover:border-vape-500/30 hover:text-vape-400 transition-all active:scale-95"
            >
                <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            </button>
            <div>
                <h1 className="text-3xl font-black tracking-tight text-white">Checkout</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-vape-400 opacity-70">Finalizar compra</p>
            </div>
        </div>
    );
}
