import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import { cn, optimizeImage } from '@/lib/utils';
import { useCategoriesWithChildren } from '@/hooks/useCategories';
import type { Section } from '@/types/constants';
import type { CategoryWithChildren } from '@/types/category';

interface MegaMenuProps {
    section: Section;
    label: string;
    icon: React.ReactNode;
    colorClass: string;
    compact?: boolean;
}

const MENU_VARIANTS = {
    hidden: { opacity: 0, y: 10, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
            staggerChildren: 0.05
        }
    },
    exit: {
        opacity: 0,
        y: 10,
        scale: 0.98,
        transition: { duration: 0.2 }
    }
};

const ITEM_VARIANTS = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
};

export function MegaMenu({ section, label, icon, colorClass, compact = false }: MegaMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<CategoryWithChildren | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const { data: categories = [] } = useCategoriesWithChildren(section);

    // Initial select first category as active when data loads
    useEffect(() => {
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0] ?? null);
        }
    }, [categories, activeCategory]);

    const handleEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsOpen(true);
    };

    const handleLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 150);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <button
                className={cn(
                    'flex items-center gap-1.5 rounded-full py-2 text-sm font-medium tracking-wide text-white/70 transition-all duration-300',
                    compact ? 'px-2.5' : 'px-5',
                    'hover:bg-white/10 hover:text-white',
                    isOpen && 'bg-white/10 text-white',
                    colorClass
                )}
            >
                {icon}
                {!compact && label}
                {!compact && (
                    <ChevronDown className={cn(
                        'h-3 w-3 transition-transform duration-300',
                        isOpen && 'rotate-180'
                    )} />
                )}
            </button>

            <AnimatePresence>
                {isOpen && categories.length > 0 && (
                    <motion.div
                        variants={MENU_VARIANTS}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute left-1/2 top-full z-50 mt-3 w-[800px] -translate-x-1/2 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f172a]/95 p-1 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    >
                        <div className="flex bg-white/[0.02] rounded-[1.8rem] overflow-hidden">

                            {/* COL 1: Main Categories */}
                            <div className="w-1/3 border-r border-white/5 bg-white/[0.02] p-4">
                                <div className="mb-4 px-4 pt-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Explorar {label}</span>
                                </div>
                                <div className="space-y-1">
                                    {categories.map((cat) => (
                                        <motion.div
                                            key={cat.id}
                                            variants={ITEM_VARIANTS}
                                            onMouseEnter={() => {
                                                if (cat) setActiveCategory(cat);
                                            }}
                                            className={cn(
                                                "relative flex items-center justify-between rounded-xl px-4 py-3 transition-all cursor-pointer group",
                                                activeCategory?.id === cat.id
                                                    ? "bg-white/10 text-white"
                                                    : "text-white/50 hover:bg-white/5 hover:text-white/80"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "h-1.5 w-1.5 rounded-full transition-all",
                                                    activeCategory?.id === cat.id ? "bg-vape-500 scale-125" : "bg-white/10"
                                                )} />
                                                <span className="text-sm font-bold tracking-tight">{cat.name}</span>
                                            </div>
                                            {activeCategory?.id === cat.id && (
                                                <motion.div layoutId="arrow" className="text-vape-400">
                                                    <ArrowRight className="h-4 w-4" />
                                                </motion.div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>

                                <Link
                                    to={`/${section}`}
                                    onClick={() => setIsOpen(false)}
                                    className="mt-6 flex items-center justify-between rounded-xl bg-gradient-to-r from-vape-600/20 to-vape-400/20 border border-vape-500/20 px-4 py-4 group transition-all hover:from-vape-600/30 hover:to-vape-400/30"
                                >
                                    <div>
                                        <p className="text-xs font-black uppercase text-vape-400">Ver Colección</p>
                                        <p className="text-[10px] text-white/40">Todos los productos {label}</p>
                                    </div>
                                    <Sparkles className="h-5 w-5 text-vape-400 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                                </Link>
                            </div>

                            {/* COL 2: Subcategories (Dynamic) */}
                            <div className="flex-1 p-8">
                                <AnimatePresence exitBeforeEnter>
                                    <motion.div
                                        key={activeCategory?.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="mb-8 border-b border-white/5 pb-4">
                                            <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{activeCategory?.name}</h3>
                                            <p className="text-sm text-white/40 font-medium leading-relaxed max-w-xs">{activeCategory?.description || `Explora nuestra selección premium de ${activeCategory?.name}.`}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                            {activeCategory?.children.map((sub) => (
                                                <Link
                                                    key={sub.id}
                                                    to={`/${section}/${sub.slug}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="group flex items-center justify-between rounded-lg py-2 text-sm text-white/60 transition-all hover:text-white"
                                                >
                                                    <span className="font-bold tracking-tight">{sub.name}</span>
                                                    <div className="h-px flex-1 mx-4 bg-white/5 scale-x-0 origin-right transition-transform group-hover:scale-x-100 group-hover:bg-white/10" />
                                                    <ChevronRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                                                </Link>
                                            ))}
                                            {activeCategory?.children.length === 0 && (
                                                <div className="col-span-2 flex flex-col items-center justify-center py-10 opacity-30 italic">
                                                    <p className="text-xs">No hay subcategorías disponibles</p>
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            to={`/${section}/${activeCategory?.slug}`}
                                            onClick={() => setIsOpen(false)}
                                            className="mt-10 inline-flex items-center gap-2 group"
                                        >
                                            <span className="text-xs font-black uppercase tracking-widest text-vape-400 group-hover:underline underline-offset-8 transition-all">Explorar {activeCategory?.name}</span>
                                            <ArrowRight className="h-4 w-4 text-vape-400 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* COL 3: Visual/Highlight */}
                            <div className="w-[240px] border-l border-white/5 p-6 bg-black/20 flex flex-col items-center justify-center text-center">
                                <div className="relative mb-6 h-32 w-32 group">
                                    <div className="absolute inset-0 rounded-3xl bg-vape-500/20 blur-2xl transition-all group-hover:blur-3xl group-hover:bg-vape-500/40" />
                                    <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                                        <img
                                            src={optimizeImage(activeCategory?.image_url || '', { width: 300, height: 300, quality: 80 })}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-125"
                                            alt=""
                                            onError={(e) => (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1550584552-4412c3cb15bf?auto=format&fit=crop&q=80&w=300'}
                                        />
                                    </div>
                                    <div className="absolute -bottom-3 -right-3 rounded-2xl bg-slate-900 border border-white/10 px-3 py-1 shadow-2xl">
                                        <TrendingUp className="h-4 w-4 text-herbal-400" />
                                    </div>
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/50 mb-2 italic">Destacado</h4>
                                <p className="text-xs font-bold text-white leading-relaxed px-4">Calidad premium garantizada en cada producto de {activeCategory?.name}.</p>
                            </div>

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
