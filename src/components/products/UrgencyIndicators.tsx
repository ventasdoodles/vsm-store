import { Flame, TrendingUp, Check, PackageX, Activity, ShoppingBag } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * UrgencyIndicators — Modulo de urgencia y prueba social.
 *
 * Siempre muestra: estado de stock (vsm-status), personas viendo,
 * ultima compra, barra de vendidos y efecto de "se acaban de vender X".
 *
 * @module UrgencyIndicators
 * @independent No depende de contexto externo, solo props.
 * @props stock, viewCount?, className?
 */

/* ── Constantes ────────────────────────────────── */
const VIEWING_MIN = 3;
const VIEWING_MAX = 20;
const VIEWING_INTERVAL_MIN = 10_000;  // 10s
const VIEWING_INTERVAL_RANGE = 20_000; // +0..20s
const FLASH_SALE_INTERVAL_MIN = 25_000; // 25s
const FLASH_SALE_INTERVAL_RANGE = 35_000; // +0..35s
const FLASH_SALE_QTY_OPTIONS = [1, 2, 3, 5];
const FLASH_SALE_DURATION = 4_000; // 4s visible
const BASE_SOLD_HIGH = 55;   // stock > 10: empieza en ~55%
const BASE_SOLD_LOW = 80;    // stock ≤ 10: empieza en ~80%
const MAX_SOLD = 97;

interface UrgencyIndicatorsProps {
    stock: number;
    viewCount?: number;
    className?: string;
}

export const UrgencyIndicators = ({ stock, viewCount, className }: UrgencyIndicatorsProps) => {
    /* ── State ─────────────────────────────────── */
    const [viewing, setViewing] = useState(
        () => viewCount || Math.floor(Math.random() * (VIEWING_MAX - 5)) + 5
    );
    const [lastPurchaseTime] = useState(
        () => Math.floor(Math.random() * 180) + 30
    );
    const baseSold = stock > 10 ? BASE_SOLD_HIGH : BASE_SOLD_LOW;
    const [soldPercentage, setSoldPercentage] = useState(
        () => baseSold + Math.floor(Math.random() * 8)
    );
    const [flashSale, setFlashSale] = useState<number | null>(null);

    const lastPurchaseHours = Math.floor(lastPurchaseTime / 60);
    const lastPurchaseMinutes = lastPurchaseTime % 60;
    const isLow = stock <= 10;

    /* ── Viewing count: fluctua cada 10-30s ──── */
    useEffect(() => {
        const interval = setInterval(() => {
            const change = Math.random() > 0.5 ? 1 : -1;
            setViewing((prev) => Math.max(VIEWING_MIN, Math.min(VIEWING_MAX, prev + change)));
        }, Math.floor(Math.random() * VIEWING_INTERVAL_RANGE) + VIEWING_INTERVAL_MIN);
        return () => clearInterval(interval);
    }, []);

    /* ── Flash sale: "se vendieron X" cada 25-60s ── */
    const triggerFlashSale = useCallback(() => {
        const idx = Math.floor(Math.random() * FLASH_SALE_QTY_OPTIONS.length);
        const qty = FLASH_SALE_QTY_OPTIONS[idx] ?? 1;
        setFlashSale(qty);
        setSoldPercentage((prev) => Math.min(MAX_SOLD, prev + Math.floor(Math.random() * 3) + 1));
        setTimeout(() => setFlashSale(null), FLASH_SALE_DURATION);
    }, []);

    useEffect(() => {
        const interval = setInterval(
            triggerFlashSale,
            Math.floor(Math.random() * FLASH_SALE_INTERVAL_RANGE) + FLASH_SALE_INTERVAL_MIN
        );
        return () => clearInterval(interval);
    }, [triggerFlashSale]);

    /* ── Colors por nivel de stock ────────────── */
    const barColor = isLow
        ? 'bg-gradient-to-r from-orange-600 via-orange-500 to-red-500'
        : 'bg-gradient-to-r from-vape-600 via-vape-500 to-emerald-500';
    const accentColor = isLow ? 'text-orange-500' : 'text-vape-400';

    /* ── Out of stock ─────────────────────────── */
    if (stock === 0) {
        return (
            <div className={cn("vsm-status text-red-500 bg-red-500/10 border-red-500/20", className)}>
                <PackageX className="w-4 h-4" />
                <span>Agotado</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("vsm-surface vsm-stack bg-gradient-to-br from-theme-secondary/10 to-transparent", className)}
        >
            {/* 1. STOCK STATUS — vsm-status siempre */}
            {isLow ? (
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="vsm-status bg-orange-500/10 text-orange-500 border-orange-500/20"
                >
                    <Flame className="w-5 h-5 animate-pulse drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                    <span className="font-bold tracking-wide">
                        {stock <= 3
                            ? `\u00a1SOLO QUEDAN ${stock} EN STOCK!`
                            : `\u00a1\u00daltimas ${stock} unidades!`}
                    </span>
                </motion.div>
            ) : (
                <div className="vsm-status bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                    <Check className="w-5 h-5" />
                    <span className="font-bold tracking-wide">En stock y listo para enviar</span>
                </div>
            )}

            {/* 2. PEOPLE VIEWING */}
            <div className="vsm-info-row text-theme-secondary">
                <div className="relative flex h-3 w-3 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
                </div>
                <span className="text-sm">
                    <motion.span
                        key={viewing}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-black text-theme-primary inline-block"
                    >
                        {viewing}
                    </motion.span>{' '}
                    personas viendo esto ahora
                </span>
            </div>

            {/* 3. LAST PURCHASE */}
            <div className="vsm-info-row text-theme-secondary">
                <Activity className="w-4 h-4 text-accent-primary" />
                <span className="text-sm">
                    Última compra hace{' '}
                    <span className="font-semibold text-theme-primary">
                        {lastPurchaseHours > 0 ? `${lastPurchaseHours}h ` : ''}{lastPurchaseMinutes}m
                    </span>
                </span>
            </div>

            {/* 4. SOLD PROGRESS — siempre visible */}
            <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <TrendingUp className={cn("w-4 h-4", accentColor)} />
                        <span className="text-theme-secondary font-medium">Vendido</span>
                    </div>
                    <motion.span
                        key={soldPercentage}
                        initial={{ scale: 1.3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={cn("font-black", accentColor)}
                    >
                        {soldPercentage}%
                    </motion.span>
                </div>
                <div className="vsm-progress-track">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${soldPercentage}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={cn("vsm-progress-fill", barColor)}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] -translate-x-full animate-[shimmer_2s_infinite]" />
                    </motion.div>
                </div>
            </div>

            {/* 5. FLASH SALE TOAST — aparece y desaparece */}
            <AnimatePresence exitBeforeEnter>
                {flashSale !== null && (
                    <motion.div
                        key={`flash-${Date.now()}`}
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        className="vsm-status bg-red-500/10 text-red-400 border-red-500/20"
                    >
                        <ShoppingBag className="w-4 h-4 animate-bounce" />
                        <span className="font-bold tracking-wide text-sm">
                            {`\u00a1Se vendieron ${flashSale} unidades ahora mismo!`}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
