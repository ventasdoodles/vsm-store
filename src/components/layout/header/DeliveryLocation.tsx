// DeliveryLocation — Pill de "Envío a CP" con detección automática
import { useState, useRef, useEffect } from 'react';
import { MapPin, LocateFixed, Loader2, X, Check } from 'lucide-react';

const STORAGE_KEY = 'vsm_delivery_cp';

function useDeliveryLocation() {
    const [postalCode, setPostalCode] = useState<string | null>(() =>
        localStorage.getItem(STORAGE_KEY)
    );
    const [detecting, setDetecting] = useState(false);

    const detect = async () => {
        if (!navigator.geolocation) return;
        setDetecting(true);
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) =>
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
            );
            const { latitude, longitude } = position.coords;
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                { headers: { 'Accept-Language': 'es' } }
            );
            const data = await res.json();
            const cp = data?.address?.postcode ?? null;
            if (cp) {
                localStorage.setItem(STORAGE_KEY, cp);
                setPostalCode(cp);
            }
        } catch {
            // silent — user denied or timeout
        } finally {
            setDetecting(false);
        }
    };

    const save = (cp: string) => {
        const clean = cp.trim().slice(0, 10);
        if (clean) {
            localStorage.setItem(STORAGE_KEY, clean);
            setPostalCode(clean);
        }
    };

    return { postalCode, detecting, detect, save };
}

export function DeliveryLocation() {
    const { postalCode, detecting, detect, save } = useDeliveryLocation();
    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus input when popover opens
    useEffect(() => {
        if (open) {
            setInput(postalCode ?? '');
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open, postalCode]);

    const handleSave = () => {
        save(input);
        setOpen(false);
    };

    return (
        <div ref={containerRef} className="relative hidden lg:flex flex-shrink-0">
            {/* Pill button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className="group flex items-center gap-2 rounded-full px-4 py-2.5 text-sm border border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all duration-200"
            >
                {detecting ? (
                    <Loader2 className="h-4 w-4 text-accent-primary animate-spin flex-shrink-0" />
                ) : (
                    <MapPin className="h-4 w-4 text-emerald-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
                )}
                <div className="flex flex-col items-start leading-none">
                    <span className="text-[10px] text-white/40 font-medium">Envío a</span>
                    <span className="text-xs font-bold text-white/80 tracking-wide">
                        {postalCode ?? 'Detectar'}
                    </span>
                </div>
            </button>

            {/* Popover */}
            {open && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-xl bg-[#0f172a]/95 border border-white/15 shadow-2xl shadow-black/60 backdrop-blur-xl z-50 p-4 animate-fadeIn">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-white">Código postal</span>
                        <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            placeholder="Ej: 06600"
                            maxLength={10}
                            className="flex-1 h-9 px-3 rounded-lg bg-white/10 border border-white/10 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-accent-primary/50 transition-colors"
                        />
                        <button
                            onClick={handleSave}
                            className="h-9 w-9 flex items-center justify-center rounded-lg bg-accent-primary hover:bg-accent-primary/80 transition-colors"
                        >
                            <Check className="h-4 w-4 text-white" />
                        </button>
                    </div>

                    <button
                        onClick={() => { detect(); setOpen(false); }}
                        disabled={detecting}
                        className="mt-2 w-full flex items-center justify-center gap-2 h-8 rounded-lg text-xs text-white/60 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                    >
                        <LocateFixed className="h-3.5 w-3.5" />
                        Detectar mi ubicación
                    </button>
                </div>
            )}
        </div>
    );
}
