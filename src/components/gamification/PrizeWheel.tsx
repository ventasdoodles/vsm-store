/**
 * // ─── COMPONENTE: PrizeWheel ───
 * // Arquitectura: Dumb Component (Visual) — gamificación premium con SVG
 * // Proposito principal: Ruleta de premios con segmentos SVG de arco perfecto.
 *    Sin clip-path triangulares. Cada segmento es un `path` de arco SVG preciso.
 *    Usa useWheelConfig (hook) y usePrizeWheel (hook). NO importa services.
 * // Regla / Notas: Props tipadas. Sin `any`. Usa cn(), tema vape-500. exitBeforeEnter framer v6.
 */
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Zap, Gift, RefreshCcw, Trophy, Coins, Star, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePrizeWheel } from '@/hooks/usePrizeWheel';
import { useWheelConfig } from '@/hooks/useWheelConfig';
import { useWheelAudio } from '@/hooks/useWheelAudio';
import { formatPrizeValue } from '@/lib/domain/wheel';
import { cn } from '@/lib/utils';
import type { WheelPrize } from '@/services';

/* ─── Constantes de diseño ─── */
const WHEEL_SIZE = 320;   // px del SVG viewBox
const CENTER = WHEEL_SIZE / 2;
const RADIUS = CENTER - 8; // radio externo del arco
const INNER_RADIUS = 36;   // radio del círculo central

/* ─── Helpers de tipo ─── */
const PRIZE_ICON: Record<WheelPrize['type'], typeof Gift> = {
    points: Coins,
    coupon: Ticket,
    empty:  Gift,
};

const PRIZE_GLOW: Record<WheelPrize['type'], string> = {
    points: 'rgba(234,179,8,0.7)',
    coupon: 'rgba(59,130,246,0.7)',
    empty:  'rgba(100,100,120,0.5)',
};

/* ─── Generador de path de arco SVG ─── */
function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function buildSegmentPath(
    cx: number, cy: number,
    outerR: number, innerR: number,
    startAngle: number, endAngle: number,
): string {
    const outerStart = polarToXY(cx, cy, outerR, startAngle);
    const outerEnd   = polarToXY(cx, cy, outerR, endAngle);
    const innerStart = polarToXY(cx, cy, innerR, endAngle);
    const innerEnd   = polarToXY(cx, cy, innerR, startAngle);
    const largeArc   = endAngle - startAngle > 180 ? 1 : 0;

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerStart.x} ${innerStart.y}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
        'Z',
    ].join(' ');
}

/* ─── Label en el arco ─── */
function SegmentLabel({
    prize, cx, cy, startAngle, endAngle, radius,
}: {
    prize: WheelPrize;
    cx: number; cy: number;
    startAngle: number; endAngle: number;
    radius: number;
}) {
    const mid = (startAngle + endAngle) / 2;
    const pos = polarToXY(cx, cy, radius * 0.68, mid);
    const rotation = mid - 90; // girar texto hacia afuera

    return (
        <text
            x={pos.x}
            y={pos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="8.5"
            fontWeight="900"
            fontFamily="inherit"
            fill="rgba(255,255,255,0.95)"
            transform={`rotate(${rotation}, ${pos.x}, ${pos.y})`}
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)', letterSpacing: '-0.3px', textTransform: 'uppercase' }}
        >
            {prize.label.length > 12 ? prize.label.slice(0, 11) + '…' : prize.label}
        </text>
    );
}

/* ─── Main Component ─── */
export function PrizeWheel() {
    const { prizes, isLoading } = useWheelConfig();
    const { isSpinning, rotation, result, error, spin, reset } = usePrizeWheel();
    const { playTick, playWin } = useWheelAudio();
    
    const pointerControls = useAnimation();
    const lastSegment = useRef<number | null>(null);

    const ResultIcon = result ? PRIZE_ICON[result.type] : Gift;

    // Disparar confetti espectacular al ganar
    useEffect(() => {
        if (result && result.type !== 'empty') {
            playWin(result.type);
            const duration = 2500;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 4,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: [result.color, '#ffffff', '#eab308']
                });
                confetti({
                    particleCount: 4,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: [result.color, '#ffffff', '#eab308']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [result, playWin]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-72 h-72 rounded-full bg-white/5 animate-pulse border border-white/10" />
            </div>
        );
    }
    if (prizes.length === 0) return null;

    const segmentAngle = 360 / prizes.length;

    return (
        <div className="relative flex flex-col items-center gap-6 py-10 px-4 max-w-lg mx-auto select-none">

            {/* ── Background glow ── */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-vape-500/8 blur-[100px]" />
                <div className="absolute top-16 left-1/3 w-40 h-40 rounded-full bg-yellow-500/6 blur-[70px]" />
                <div className="absolute top-16 right-1/3 w-40 h-40 rounded-full bg-blue-500/6 blur-[70px]" />
            </div>

            {/* ── Header ── */}
            <div className="text-center space-y-2">
                <motion.div
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-vape-600/30 to-orange-500/20 border border-vape-500/30"
                >
                    <Zap className="w-3 h-3 text-vape-400 fill-current" />
                    <span className="text-[10px] font-black text-vape-300 uppercase tracking-[0.2em]">Giro Diario Gratis</span>
                </motion.div>

                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                    The Wheel of{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-vape-400 to-orange-400">
                        VSM
                    </span>
                </h2>
                <p className="text-white/40 text-xs font-medium">
                    Gira para ganar V-Coins, cupones exclusivos y premios sorpresa.
                </p>
            </div>

            {/* ── Wheel ── */}
            <div className="relative">
                {/* Outer decorative rings */}
                <div className={cn(
                    'absolute -inset-3 rounded-full border-2 transition-all duration-700',
                    isSpinning
                        ? 'border-vape-500/50 shadow-[0_0_50px_rgba(234,88,12,0.5)]'
                        : 'border-white/8 shadow-[0_0_20px_rgba(234,88,12,0.08)]',
                )} />
                <div className="absolute -inset-6 rounded-full border border-white/[0.04]" />

                {/* Pointer con Físicas */}
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-30 origin-top"
                    animate={pointerControls}
                    initial={{ rotate: 0 }}
                >
                    <div className="flex flex-col items-center gap-0">
                        <div
                            className="w-5 h-6 shadow-[0_0_14px_rgba(234,88,12,0.9)]"
                            style={{
                                clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)',
                                background: 'linear-gradient(to bottom, #fb923c, #ea580c)',
                            }}
                        />
                        <div className="w-3 h-3 rounded-full bg-vape-500 border-2 border-white/40 -mt-0.5 shadow-[0_0_10px_rgba(234,88,12,1)]" />
                    </div>
                </motion.div>

                {/* SVG Wheel */}
                <motion.div
                    animate={{ rotate: rotation }}
                    transition={{ duration: 5.5, ease: [0.12, 0.88, 0.3, 1.0] }}
                    onUpdate={(latest) => {
                        if (typeof latest.rotate === 'number') {
                            const currentAngle = latest.rotate % 360;
                            // Calcular el segmento actual en el Top (0 grados)
                            const segmentIndex = Math.floor(((360 - currentAngle) % 360) / segmentAngle);
                            
                            if (isSpinning && segmentIndex !== lastSegment.current) {
                                lastSegment.current = segmentIndex;
                                playTick('high');
                                
                                // Física reactiva del puntero (salta hacia atrás y rebota)
                                pointerControls.start({
                                    rotate: [-35, 0],
                                    transition: { type: 'spring', stiffness: 600, damping: 15 }
                                });
                            }
                        }
                    }}
                    style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
                    className="relative rounded-full shadow-2xl overflow-hidden"
                >
                    <svg
                        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                        width={WHEEL_SIZE}
                        height={WHEEL_SIZE}
                        style={{ display: 'block' }}
                    >
                        <defs>
                            {prizes.map((prize) => (
                                <radialGradient
                                    key={`grad-${prize.id}`}
                                    id={`grad-${prize.id}`}
                                    cx="50%" cy="50%" r="50%"
                                >
                                    <stop offset="0%" stopColor={prize.color} stopOpacity="1" />
                                    <stop offset="100%" stopColor={prize.color} stopOpacity="0.75" />
                                </radialGradient>
                            ))}
                            {/* Shine overlay gradient */}
                            <radialGradient id="shine" cx="35%" cy="25%" r="65%">
                                <stop offset="0%" stopColor="white" stopOpacity="0.18" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Background */}
                        <circle cx={CENTER} cy={CENTER} r={RADIUS + 4} fill="#0a0b14" />

                        {/* Segments */}
                        {prizes.map((prize, i) => {
                            const startAngle = i * segmentAngle;
                            const endAngle   = startAngle + segmentAngle;
                            const path = buildSegmentPath(CENTER, CENTER, RADIUS, INNER_RADIUS, startAngle, endAngle);

                            return (
                                <g key={prize.id}>
                                    {/* Colored segment */}
                                    <path
                                        d={path}
                                        fill={`url(#grad-${prize.id})`}
                                        stroke="rgba(0,0,0,0.25)"
                                        strokeWidth="1.5"
                                    />
                                    {/* Label */}
                                    <SegmentLabel
                                        prize={prize}
                                        cx={CENTER} cy={CENTER}
                                        startAngle={startAngle}
                                        endAngle={endAngle}
                                        radius={RADIUS}
                                    />
                                </g>
                            );
                        })}

                        {/* Shine overlay over all segments */}
                        <circle cx={CENTER} cy={CENTER} r={RADIUS} fill="url(#shine)" />

                        {/* Center cap */}
                        <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS} fill="#0d0e1a" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
                        <circle cx={CENTER} cy={CENTER} r={INNER_RADIUS - 2} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    </svg>

                    {/* Trophy icon over center (DOM — absolute) */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
                        </motion.div>
                    </div>
                </motion.div>

                {/* Orbital spinning dots when spinning */}
                {isSpinning && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                    >
                        {[0, 90, 180, 270].map((deg, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full bg-vape-400"
                                style={{
                                    top: '50%', left: '50%',
                                    transform: `rotate(${deg}deg) translate(${WHEEL_SIZE / 2 + 14}px, -50%)`,
                                    boxShadow: '0 0 8px rgba(234,88,12,1)',
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* ── Preview chips ── */}
            <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                {prizes.filter(p => p.type !== 'empty').slice(0, 6).map((p) => (
                    <div
                        key={p.id}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-white/70 border border-white/10 bg-white/[0.03]"
                    >
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        {p.label}
                    </div>
                ))}
            </div>

            {/* ── Action Area ── */}
            <div className="relative w-full max-w-sm space-y-4 z-40">

                <AnimatePresence exitBeforeEnter>
                    {error ? (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2"
                        >
                            <p className="text-red-400 text-sm font-bold">{error}</p>
                            <button onClick={reset} className="text-[10px] text-white/40 hover:text-white/60 underline">Cerrar</button>
                        </motion.div>
                    ) : result ? (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 18 }}
                            className="relative overflow-hidden p-6 rounded-3xl border text-center space-y-3"
                            style={{
                                borderColor: PRIZE_GLOW[result.type].replace('0.7', '0.5'),
                                background: `radial-gradient(ellipse at top, ${PRIZE_GLOW[result.type].replace('0.7', '0.12')} 0%, transparent 70%)`,
                                boxShadow: `0 0 50px ${PRIZE_GLOW[result.type]}`,
                            }}
                        >
                            <motion.div animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.25, 1.1, 1.2, 1] }} transition={{ duration: 0.5 }} className="flex justify-center">
                                <ResultIcon className="w-12 h-12" style={{ color: result.color }} />
                            </motion.div>
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-white/35 mb-1">¡Felicidades!</div>
                                <div className="text-2xl font-black text-white uppercase tracking-tight">{result.label}</div>
                                <div className="text-lg font-black mt-0.5" style={{ color: result.color }}>{formatPrizeValue(result)}</div>
                            </div>
                            <div className="text-[10px] text-white/25 font-medium">Tu premio ha sido aplicado a tu perfil.</div>
                            <button onClick={reset} className="text-[10px] text-white/30 hover:text-white/60 underline">Volver</button>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="spin"
                            whileHover={{ scale: isSpinning ? 1 : 1.02 }}
                            whileTap={{ scale: isSpinning ? 1 : 0.97 }}
                            onClick={() => spin(prizes)}
                            disabled={isSpinning}
                            className={cn(
                                'relative w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-white overflow-hidden transition-all',
                                isSpinning
                                    ? 'bg-white/5 border border-white/10 cursor-not-allowed'
                                    : 'border border-orange-400/30 shadow-[0_8px_32px_rgba(234,88,12,0.4)] hover:shadow-[0_12px_40px_rgba(234,88,12,0.65)]',
                            )}
                            style={isSpinning ? {} : {
                                background: 'linear-gradient(135deg, #ea580c 0%, #f97316 50%, #ea580c 100%)',
                                backgroundSize: '200% 100%',
                            }}
                        >
                            {/* Shimmer */}
                            {!isSpinning && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2.2, repeat: Infinity, ease: 'linear', repeatDelay: 1.2 }}
                                />
                            )}
                            <span className="relative flex items-center justify-center gap-3 text-sm">
                                {isSpinning
                                    ? <><RefreshCcw className="w-5 h-5 animate-spin" />Girando el destino...</>
                                    : <><Zap className="w-5 h-5 fill-current" />¡Girar Ahora!</>
                                }
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>

                {!result && !error && (
                    <p className="text-center text-[10px] text-white/20 italic">
                        Un giro gratis cada 24 horas · Solo para usuarios registrados
                    </p>
                )}
            </div>

            {/* Stars decoration */}
            <motion.div
                className="absolute top-32 left-4 pointer-events-none"
                animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
            >
                <Star className="w-4 h-4 text-yellow-400/40" />
            </motion.div>
            <motion.div
                className="absolute top-48 right-4 pointer-events-none"
                animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
                <Star className="w-3 h-3 text-blue-400/30" />
            </motion.div>
        </div>
    );
}
