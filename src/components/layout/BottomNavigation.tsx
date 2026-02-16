import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/stores/cart.store';
import { useHaptic } from '@/hooks/useHaptic';
import { useSearchOverlay } from '@/components/search/MobileSearchOverlay';

export function BottomNavigation() {
    const { pathname } = useLocation();
    const cartCount = useCartStore((s) => s.items.reduce((acc, item) => acc + item.quantity, 0));
    const openSearch = useSearchOverlay((s) => s.open);
    const isCartOpen = useCartStore((s) => s.isOpen);
    const openCart = useCartStore((s) => s.openCart);
    const { trigger } = useHaptic();

    const navItems = [
        {
            label: 'Inicio',
            icon: Home,
            href: '/',
            isActive: pathname === '/',
            onClick: () => trigger('light'),
        },
        {
            label: 'Buscar',
            icon: Search,
            href: '#search',
            isActive: false,
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                trigger('light');
                openSearch();
            },
        },
        {
            label: 'Carrito',
            icon: ShoppingCart,
            href: '#cart',
            isActive: isCartOpen,
            badge: cartCount > 0 ? cartCount : null,
            onClick: (e: React.MouseEvent) => {
                e.preventDefault();
                trigger('light');
                openCart();
            },
        },
        {
            label: 'Perfil',
            icon: User,
            href: '/profile',
            isActive: pathname === '/profile' || pathname === '/login',
            onClick: () => trigger('light'),
        },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-primary-800/60 bg-primary-950/90 backdrop-blur-xl pb-safe md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => (
                    <Link
                        key={item.label}
                        to={item.href}
                        onClick={item.onClick}
                        className={cn(
                            'relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-90',
                            item.isActive ? 'text-vape-400' : 'text-primary-500 hover:text-primary-300'
                        )}
                    >
                        <div className={cn(
                            'relative p-1.5 rounded-xl transition-all',
                            item.isActive && 'bg-vape-500/10'
                        )}>
                            <item.icon className={cn('h-6 w-6', item.isActive && 'fill-current')} strokeWidth={item.isActive ? 2.5 : 2} />

                            {/* Badge para carrito */}
                            {item.badge && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-vape-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-primary-950 animate-bounce-in">
                                    {item.badge > 9 ? '9+' : item.badge}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}
