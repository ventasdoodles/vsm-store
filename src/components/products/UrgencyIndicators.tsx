import { Flame, Eye, Clock, TrendingUp } from 'lucide-react';

import { useState, useEffect } from 'react';

interface UrgencyIndicatorsProps {
    stock: number;
    viewCount?: number;
}

export const UrgencyIndicators = ({ stock, viewCount }: UrgencyIndicatorsProps) => {
    // Simular personas viendo (fake pero efectivo)
    const [viewing, setViewing] = useState(() => viewCount || Math.floor(Math.random() * 15) + 5);

    // Simular última compra
    const [lastPurchaseTime] = useState(() => Math.floor(Math.random() * 180) + 30); // 30-210 minutos
    const lastPurchaseHours = Math.floor(lastPurchaseTime / 60);
    const lastPurchaseMinutes = lastPurchaseTime % 60;

    // Actualizar viewing count cada 10-30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1;
            setViewing((prev) => Math.max(3, Math.min(20, prev + change)));
        }, Math.floor(Math.random() * 20000) + 10000);

        return () => clearInterval(interval);
    }, []);

    // Calcular porcentaje vendido (simulado)
    const soldPercentage = stock > 10 ? 60 : 85;

    return (
        <div className="space-y-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
            {/* Low Stock Warning */}
            {stock <= 10 && stock > 0 && (
                <div
                    className="flex items-center gap-2 text-orange-500 animate-scaleIn"
                >
                    <Flame className="w-5 h-5 animate-pulse" />
                    <span className="font-semibold text-sm">
                        {stock <= 3
                            ? `¡Solo quedan ${stock} en stock!`
                            : `¡Últimas ${stock} unidades!`}
                    </span>
                </div>
            )}

            {/* People Viewing */}
            <div
                className="flex items-center gap-2 text-theme-secondary animate-slideIn"
                style={{ animationDelay: '0.1s' }}
            >
                <Eye className="w-4 h-4" />
                <span className="text-sm">
                    <span className="font-semibold text-theme-primary">{viewing}</span> personas
                    viendo esto ahora
                </span>
            </div>

            {/* Last Purchase */}
            <div
                className="flex items-center gap-2 text-theme-secondary animate-slideIn"
                style={{ animationDelay: '0.2s' }}
            >
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                    Última compra hace{' '}
                    {lastPurchaseHours > 0 ? `${lastPurchaseHours}h ` : ''}
                    {lastPurchaseMinutes}m
                </span>
            </div>

            {/* Sold Progress */}
            {stock <= 10 && (
                <div
                    className="space-y-2 animate-slideIn"
                    style={{ animationDelay: '0.3s' }}
                >
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span className="text-theme-secondary">Vendido</span>
                        </div>
                        <span className="font-semibold text-orange-500">{soldPercentage}%</span>
                    </div>
                    <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                        <div
                            style={{ width: `${soldPercentage}%`, transition: 'width 1s ease-out 0.5s' }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
