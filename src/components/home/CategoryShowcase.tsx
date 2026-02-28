/**
 * CategoryShowcase — Interactive and Fluid Category Grid using Framer Motion.
 */
import { Link } from 'react-router-dom';
import { Flame, Box, Leaf, Zap, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
};

interface CategoryCard {
    id: string;
    name: string;
    slug: string;
    section: 'vape' | '420';
    icon: JSX.Element;
    productCount: number;
    image: string;
    gradient: string;
    gradientLight: string;
}

const FEATURED_CATEGORIES: CategoryCard[] = [
    {
        id: '1',
        name: 'Líquidos',
        slug: 'liquidos',
        section: 'vape',
        icon: <Flame className="w-8 h-8" />,
        productCount: 127,
        image: 'https://images.unsplash.com/photo-1569437061238-3cf61084f487?w=800',
        gradient: 'from-orange-500/80 to-red-600/80',
        gradientLight: 'from-orange-400/60 to-red-500/60',
    },
    {
        id: '2',
        name: 'Pods & Mods',
        slug: 'pods',
        section: 'vape',
        icon: <Box className="w-8 h-8" />,
        productCount: 85,
        image: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800',
        gradient: 'from-blue-500/80 to-purple-600/80',
        gradientLight: 'from-blue-400/60 to-purple-500/60',
    },
    {
        id: '3',
        name: 'Cannabis Premium',
        slug: 'cannabis',
        section: '420',
        icon: <Leaf className="w-8 h-8" />,
        productCount: 64,
        image: 'https://images.unsplash.com/photo-1605928015870-644a025ed0d2?w=800',
        gradient: 'from-green-500/80 to-emerald-600/80',
        gradientLight: 'from-green-400/60 to-emerald-500/60',
    },
    {
        id: '4',
        name: 'Accesorios',
        slug: 'accesorios',
        section: 'vape',
        icon: <Zap className="w-8 h-8" />,
        productCount: 43,
        image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800',
        gradient: 'from-yellow-500/80 to-orange-600/80',
        gradientLight: 'from-yellow-400/60 to-orange-500/60',
    },
];

export const CategoryShowcase = () => {
    const { isDark } = useTheme();

    return (
        <section className="space-y-8">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <div className="h-8 w-1.5 rounded-full bg-vape-500 shadow-[0_0_15px_rgba(234,88,12,0.8)]" />
                    <h2 className="text-3xl font-black text-theme-primary tracking-tighter uppercase italic">
                        Explora Categorías
                    </h2>
                </div>
            </motion.div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-10%' }}
                className="grid grid-cols-2 lg:grid-cols-4 gap-6"
            >
                {FEATURED_CATEGORIES.map((category) => {
                    const gradientClass = isDark ? category.gradient : category.gradientLight;
                    return (
                        <motion.div variants={itemVariants} key={category.id} className="block relative">
                            <Link
                                to={`/${category.section}/${category.slug}`}
                                className="group relative block h-80 rounded-[2.5rem] overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-2 border border-theme/20"
                            >
                                <div className="absolute inset-0">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-theme-primary/40 group-hover:bg-theme-primary/20 transition-colors duration-500" />
                                </div>

                                <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} mix-blend-multiply opacity-60 group-hover:opacity-40 transition-opacity duration-500`} />
                                <div className="absolute inset-0 bg-gradient-to-t from-theme-primary/90 via-theme-primary/20 to-transparent" />

                                <div className="relative h-full flex flex-col justify-end p-8 z-10">
                                    <motion.div 
                                        initial={{ y: 0 }}
                                        whileHover={{ y: -10, rotate: [0, -5, 5, 0] }}
                                        transition={{ duration: 0.4 }}
                                        className="mb-6"
                                    >
                                        <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-xl">
                                            {category.icon}
                                        </div>
                                    </motion.div>

                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic line-clamp-1 group-hover:text-vape-400 transition-colors">
                                            {category.name}
                                        </h3>
                                        <p className="text-white/80 text-[10px] font-black uppercase tracking-[0.2em]">
                                            {category.productCount} Productos
                                        </p>
                                    </div>

                                    <div className="absolute top-6 right-6 w-10 h-10 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0 group-hover:border-vape-400 group-hover:bg-vape-500/20">
                                        <ChevronRight className="w-5 h-5 text-white" />
                                    </div>
                                </div>

                                <div className="absolute inset-0 rounded-[2.5rem] border border-white/5 group-hover:border-vape-500/50 transition-colors duration-500 pointer-events-none" />
                            </Link>
                        </motion.div>
                    );
                })}
            </motion.div>
        </section>
    );
};
