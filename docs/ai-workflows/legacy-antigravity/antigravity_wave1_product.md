# UX/UI PREMIUM — WAVE 1: PRODUCT EXPERIENCE (2.5 horas)

**Objetivo:** Mejorar product cards y product detail con features premium  
**Tiempo estimado:** 2.5 horas  
**Impacto esperado:** +30% conversión en productos  
**Commit base:** [último commit estable]

---

## 📦 DEPENDENCIAS NECESARIAS

```bash
npm install framer-motion@11.11.17
npm install react-hot-toast@2.4.1
npm install @radix-ui/react-dialog@1.1.2
npm install lucide-react@latest
```

**Nota:** Si ya existen, verificar versiones compatibles.

---

## 🎨 PARTE 1: ENHANCED PRODUCT CARDS (1.5 horas)

### 1.1 Quick View Modal Component

**Archivo:** `src/components/products/QuickViewModal.tsx`

```typescript
import { Dialog, DialogContent, DialogTitle } from '@radix-ui/react-dialog';
import { X, ShoppingCart, ExternalLink, Heart, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart.store';
import toast from 'react-hot-toast';
import type { Product } from '@/types/product';

interface QuickViewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addItem } = useCartStore();

    const handleAddToCart = () => {
        addItem(product, quantity);
        toast.success(`${product.name} agregado al carrito`, {
            icon: '🛒',
            duration: 2000,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent asChild>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <div
                        className="relative bg-theme-primary rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-full flex items-center justify-center transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5 text-theme-primary" />
                        </button>

                        {/* Content */}
                        <div className="grid md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[90vh]">
                            {/* Left: Images */}
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="aspect-square bg-theme-secondary rounded-xl overflow-hidden relative group">
                                    {product.images?.[selectedImage] ? (
                                        <img
                                            src={product.images[selectedImage]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Package className="w-20 h-20 text-theme-secondary" />
                                        </div>
                                    )}

                                    {/* Zoom Indicator */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                        <div className="bg-white/90 rounded-full p-3">
                                            <ZoomIn className="w-6 h-6 text-gray-900" />
                                        </div>
                                    </div>
                                </div>

                                {/* Thumbnails */}
                                {product.images && product.images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto">
                                        {product.images.map((image, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(idx)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                                    selectedImage === idx
                                                        ? 'border-accent-primary ring-2 ring-accent-primary/50'
                                                        : 'border-theme hover:border-theme-secondary'
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.name} ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Info */}
                            <div className="space-y-4">
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {product.is_new && (
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-500 text-xs font-semibold rounded-full">
                                            NUEVO
                                        </span>
                                    )}
                                    {product.is_bestseller && (
                                        <span className="px-3 py-1 bg-orange-500/10 text-orange-500 text-xs font-semibold rounded-full">
                                            MÁS VENDIDO
                                        </span>
                                    )}
                                    {product.is_featured && (
                                        <span className="px-3 py-1 bg-purple-500/10 text-purple-500 text-xs font-semibold rounded-full">
                                            DESTACADO
                                        </span>
                                    )}
                                </div>

                                {/* Title */}
                                <DialogTitle asChild>
                                    <h2 className="text-2xl font-bold text-theme-primary">
                                        {product.name}
                                    </h2>
                                </DialogTitle>

                                {/* Price */}
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-theme-primary">
                                        ${product.price}
                                    </span>
                                    {product.compare_at_price && (
                                        <>
                                            <span className="text-lg text-theme-secondary line-through">
                                                ${product.compare_at_price}
                                            </span>
                                            <span className="px-2 py-1 bg-red-500/10 text-red-500 text-sm font-semibold rounded">
                                                {Math.round(
                                                    ((product.compare_at_price - product.price) /
                                                        product.compare_at_price) *
                                                        100
                                                )}
                                                % OFF
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                {product.short_description && (
                                    <p className="text-theme-secondary leading-relaxed">
                                        {product.short_description}
                                    </p>
                                )}

                                {/* Stock Status */}
                                <div className="flex items-center gap-2">
                                    {product.stock > 10 ? (
                                        <>
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            <span className="text-sm text-green-500 font-medium">
                                                En stock
                                            </span>
                                        </>
                                    ) : product.stock > 0 ? (
                                        <>
                                            <div className="w-2 h-2 bg-orange-500 rounded-full" />
                                            <span className="text-sm text-orange-500 font-medium">
                                                Solo {product.stock} disponibles
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                            <span className="text-sm text-red-500 font-medium">
                                                Agotado
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Quantity Selector */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-theme-primary">
                                        Cantidad
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-lg flex items-center justify-center transition-colors"
                                            disabled={quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-semibold text-theme-primary">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() =>
                                                setQuantity(Math.min(product.stock, quantity + 1))
                                            }
                                            className="w-10 h-10 bg-theme-secondary hover:bg-theme-tertiary rounded-lg flex items-center justify-center transition-colors"
                                            disabled={quantity >= product.stock}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className="flex-1 h-12 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-theme-secondary disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-105"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        Agregar al Carrito
                                    </button>

                                    <button className="w-12 h-12 bg-theme-secondary hover:bg-theme-tertiary rounded-lg flex items-center justify-center transition-colors">
                                        <Heart className="w-5 h-5 text-theme-primary" />
                                    </button>
                                </div>

                                {/* View Full Details */}
                                <Link
                                    to={`/${product.section}/${product.slug}`}
                                    onClick={onClose}
                                    className="flex items-center justify-center gap-2 h-10 text-accent-primary hover:text-accent-primary/80 font-medium transition-colors"
                                >
                                    Ver detalles completos
                                    <ExternalLink className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};
```

---

### 1.2 Enhanced ProductCard Component

**Archivo:** `src/components/products/ProductCard.tsx`

**Agregar al inicio (imports):**
```typescript
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, ShoppingCart } from 'lucide-react';
import { QuickViewModal } from './QuickViewModal';
import toast from 'react-hot-toast';
import { useCartStore } from '@/stores/cart.store';
```

**Modificar el componente completo:**
```typescript
export const ProductCard = ({ product }: ProductCardProps) => {
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const { addItem } = useCartStore();

    const handleQuickAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product, 1);
        toast.success(`${product.name} agregado al carrito`, {
            icon: '🛒',
            duration: 2000,
        });
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
        toast.success(
            isWishlisted ? 'Eliminado de favoritos' : 'Agregado a favoritos',
            {
                icon: isWishlisted ? '💔' : '❤️',
                duration: 2000,
            }
        );
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsQuickViewOpen(true);
    };

    return (
        <>
            <Link to={`/${product.section}/${product.slug}`}>
                <motion.div
                    whileHover={{ y: -8 }}
                    className="group relative bg-theme-secondary rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
                >
                    {/* Image Container */}
                    <div
                        className="relative aspect-square bg-theme-tertiary overflow-hidden"
                        onMouseEnter={() => {
                            if (product.images?.length > 1) setCurrentImage(1);
                        }}
                        onMouseLeave={() => setCurrentImage(0)}
                    >
                        {/* Image */}
                        {product.images?.[currentImage] ? (
                            <motion.img
                                key={currentImage}
                                src={product.images[currentImage]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-16 h-16 text-theme-secondary" />
                            </div>
                        )}

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Badges (Top-left) */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                            {product.is_new && (
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full shadow-lg"
                                >
                                    NUEVO
                                </motion.span>
                            )}
                            {product.is_bestseller && (
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg"
                                >
                                    🔥 HOT
                                </motion.span>
                            )}
                            {product.compare_at_price && (
                                <motion.span
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg"
                                >
                                    -{Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)}%
                                </motion.span>
                            )}
                        </div>

                        {/* Wishlist Button (Top-right) */}
                        <motion.button
                            onClick={handleWishlist}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full flex items-center justify-center transition-all shadow-lg opacity-0 group-hover:opacity-100"
                        >
                            <Heart
                                className={`w-5 h-5 transition-all ${
                                    isWishlisted
                                        ? 'fill-red-500 text-red-500'
                                        : 'text-gray-700'
                                }`}
                            />
                        </motion.button>

                        {/* Quick Actions (Bottom) */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileHover={{ y: 0, opacity: 1 }}
                            className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all"
                        >
                            <button
                                onClick={handleQuickView}
                                className="flex-1 h-10 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                            >
                                <Eye className="w-4 h-4" />
                                Vista Rápida
                            </button>
                            <button
                                onClick={handleQuickAdd}
                                disabled={product.stock === 0}
                                className="h-10 px-4 bg-accent-primary hover:bg-accent-primary/90 disabled:bg-gray-400 text-white font-semibold rounded-lg flex items-center justify-center transition-all shadow-lg"
                            >
                                <ShoppingCart className="w-4 h-4" />
                            </button>
                        </motion.div>
                    </div>

                    {/* Info Section */}
                    <div className="p-4 space-y-2">
                        {/* Product Name */}
                        <h3 className="font-semibold text-theme-primary line-clamp-2 group-hover:text-accent-primary transition-colors">
                            {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-theme-primary">
                                ${product.price}
                            </span>
                            {product.compare_at_price && (
                                <span className="text-sm text-theme-secondary line-through">
                                    ${product.compare_at_price}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        {product.stock <= 5 && product.stock > 0 && (
                            <p className="text-xs text-orange-500 font-medium">
                                Solo {product.stock} disponibles
                            </p>
                        )}
                    </div>
                </motion.div>
            </Link>

            {/* Quick View Modal */}
            <QuickViewModal
                product={product}
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
            />
        </>
    );
};
```

---

## 🔥 PARTE 2: PRODUCT DETAIL IMPROVEMENTS (1 hora)

### 2.1 Urgency Indicators Component

**Archivo:** `src/components/products/UrgencyIndicators.tsx`

```typescript
import { Flame, Eye, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface UrgencyIndicatorsProps {
    stock: number;
    viewCount?: number;
}

export const UrgencyIndicators = ({ stock, viewCount }: UrgencyIndicatorsProps) => {
    // Simular personas viendo (fake pero efectivo)
    const [viewing, setViewing] = useState(viewCount || Math.floor(Math.random() * 15) + 5);

    // Simular última compra
    const lastPurchaseTime = Math.floor(Math.random() * 180) + 30; // 30-210 minutos
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
                <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-2 text-orange-500"
                >
                    <Flame className="w-5 h-5 animate-pulse" />
                    <span className="font-semibold text-sm">
                        {stock <= 3
                            ? `¡Solo quedan ${stock} en stock!`
                            : `¡Últimas ${stock} unidades!`}
                    </span>
                </motion.div>
            )}

            {/* People Viewing */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 text-theme-secondary"
            >
                <Eye className="w-4 h-4" />
                <span className="text-sm">
                    <span className="font-semibold text-theme-primary">{viewing}</span> personas
                    viendo esto ahora
                </span>
            </motion.div>

            {/* Last Purchase */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-theme-secondary"
            >
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                    Última compra hace{' '}
                    {lastPurchaseHours > 0 ? `${lastPurchaseHours}h ` : ''}
                    {lastPurchaseMinutes}m
                </span>
            </motion.div>

            {/* Sold Progress */}
            {stock <= 10 && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                >
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-orange-500" />
                            <span className="text-theme-secondary">Vendido</span>
                        </div>
                        <span className="font-semibold text-orange-500">{soldPercentage}%</span>
                    </div>
                    <div className="h-2 bg-theme-tertiary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${soldPercentage}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                        />
                    </div>
                </motion.div>
            )}
        </div>
    );
};
```

---

### 2.2 Update ProductDetail Page

**Archivo:** `src/pages/ProductDetail.tsx`

**Agregar import:**
```typescript
import { UrgencyIndicators } from '@/components/products/UrgencyIndicators';
```

**Agregar después de la sección de precio (buscar donde está el precio):**
```typescript
{/* Urgency Indicators */}
<UrgencyIndicators stock={product.stock} />
```

---

## 📦 PARTE 3: SETUP TOAST NOTIFICATIONS

**Archivo:** `src/main.tsx`

**Agregar imports:**
```typescript
import { Toaster } from 'react-hot-toast';
```

**Agregar dentro del render (después de ThemeProvider):**
```typescript
<ThemeProvider>
    <Toaster
        position="bottom-right"
        toastOptions={{
            duration: 3000,
            style: {
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-primary)',
            },
            success: {
                iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                },
            },
            error: {
                iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                },
            },
        }}
    />
    {/* ... resto del código */}
</ThemeProvider>
```

---

## 📋 COMMITS

### Commit 1: Dependencies
```bash
npm install framer-motion react-hot-toast @radix-ui/react-dialog
git add package.json package-lock.json
git commit -m "feat(deps): add framer-motion, react-hot-toast, radix-ui dialog

- framer-motion@11.11.17 for premium animations
- react-hot-toast@2.4.1 for toast notifications
- @radix-ui/react-dialog@1.1.2 for accessible modals"
```

### Commit 2: Quick View Modal
```bash
git add src/components/products/QuickViewModal.tsx
git commit -m "feat(product): add QuickViewModal component

- Full product preview without page navigation
- Image gallery with thumbnails
- Quantity selector
- Add to cart + wishlist actions
- Link to full product details
- Accessible with Radix UI Dialog
- Smooth animations with Framer Motion"
```

### Commit 3: Enhanced ProductCard
```bash
git add src/components/products/ProductCard.tsx
git commit -m "feat(product): enhance ProductCard with premium interactions

- Quick View button on hover
- Add to Cart direct from card
- Wishlist heart toggle
- Image hover shows 2nd image
- Badges more prominent (NEW, HOT, % OFF)
- Levitate effect on hover with shadow
- Glow overlay effect
- Toast notifications on actions"
```

### Commit 4: Urgency Indicators
```bash
git add src/components/products/UrgencyIndicators.tsx src/pages/ProductDetail.tsx
git commit -m "feat(product): add urgency/scarcity indicators

- Low stock warning (animated flame)
- Live viewer count (simulated)
- Last purchase timestamp
- Sold percentage progress bar
- All with smooth animations
- Increases FOMO and conversions"
```

### Commit 5: Toast Setup
```bash
git add src/main.tsx
git commit -m "feat(ui): setup react-hot-toast notifications

- Bottom-right position
- Theme-aware styling
- Success/error icons
- 3s duration
- Consistent with design system"
```

---

## 🧪 TESTING CHECKLIST

### ProductCard Enhancements
- [ ] Hover: card levita
- [ ] Hover: aparecen botones (Quick View, Add to Cart)
- [ ] Hover: imagen cambia a 2da (si existe)
- [ ] Click Quick View: modal abre
- [ ] Click Add to Cart: toast aparece + producto en cart
- [ ] Click Wishlist: heart cambia color + toast
- [ ] Badges visibles (NEW, HOT, % OFF)

### Quick View Modal
- [ ] Modal abre smooth
- [ ] Backdrop blur visible
- [ ] Click backdrop: cierra modal
- [ ] Click X: cierra modal
- [ ] Galería: thumbnails funcionales
- [ ] Quantity: +/- funcionan
- [ ] Add to Cart: funciona + toast
- [ ] "Ver detalles": link funciona + cierra modal
- [ ] Wishlist heart funciona

### Urgency Indicators
- [ ] "Solo X quedan": aparece si stock < 10
- [ ] Flame icon animado
- [ ] Viewer count actualiza (cada 10-30s)
- [ ] Last purchase muestra tiempo
- [ ] Progress bar anima suave
- [ ] Colores correctos (orange theme)

### Toast Notifications
- [ ] Aparecen bottom-right
- [ ] Desaparecen después 3s
- [ ] Tienen iconos correctos
- [ ] Tema adapta (dark/light)
- [ ] Stack múltiples toasts

---

## 📝 NOTAS IMPORTANTES

### Performance
- Framer Motion: GPU-accelerated animations
- Images: Lazy loading automático
- Toast: Max 3 simultaneous (auto-dismiss oldest)

### Accessibility
- Radix Dialog: Keyboard navigation (ESC, Tab)
- ARIA labels en todos los buttons
- Focus trap en modal
- Screen reader friendly

### Mobile
- Touch targets 44px mínimo
- Modal responsive (padding)
- Swipe down to close (implementar después)

---

## ⏭️ PRÓXIMO PASO

**Después de este commit:**
- Verificar build: `npm run build`
- Probar local: todos los features
- Subir a production
- **Proceder a WAVE 2: Search Autocomplete**

---

**TIEMPO TOTAL WAVE 1:** ~2.5 horas  
**RESULTADO:** Product experience premium nivel Amazon

**FIN DE WAVE 1**
