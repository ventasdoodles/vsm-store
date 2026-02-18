import { Link } from 'react-router-dom';
import { Flame, Box, Leaf, Zap, ChevronRight } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

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
        <section className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold text-theme-primary">
                    Explora por Categoría
                </h2>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {FEATURED_CATEGORIES.map((category) => {
                    const gradientClass = isDark ? category.gradient : category.gradientLight;

                    return (
                        <Link
                            key={category.id}
                            to={`/${category.section}/${category.slug}`}
                            className="group relative h-64 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
                        >
                            {/* Background Image */}
                            <div className="absolute inset-0">
                                <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>

                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${gradientClass} transition-opacity duration-300 group-hover:opacity-90`} />

                            {/* Content */}
                            <div className="relative h-full flex flex-col justify-end p-6">
                                {/* Icon */}
                                <div className="mb-4 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white">
                                        {category.icon}
                                    </div>
                                </div>

                                {/* Text */}
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {category.name}
                                </h3>
                                <p className="text-white/80 text-sm">
                                    {category.productCount} productos
                                </p>

                                {/* Arrow indicator */}
                                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
};
