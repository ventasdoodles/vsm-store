# VSM STORE - COMPLETE PROJECT CONTEXT

Generated: 2026-02-12
Status: MVP Functional (98%)
Stack: React 18, TypeScript, Supabase, Tailwind, Zustand, React Query

--------------------------------------------------------------------------------

PART 1: EXECUTIVE SUMMARY & ARCHITECTURE (From Knowledge Base)
--------------------------------------------------------------------------------

## INFORMACIÓN DEL PROYECTO

**Nombre:** VSM Store
**Tipo:** E-commerce B2C (Vape & Cannabis)
**Cliente:** VSM (Vape Store Mexico)
**Ubicación:** Xalapa, Veracruz, México
**Estado:** MVP Funcional (98% completo)
**URLs:**

- Prod: vsm-store.pages.dev
- Repo: github.com/ventasdoodles/vsm-store

## STACK TECNOLÓGICO

**Frontend:** React 18.3, TypeScript 5.5, Vite 5.4, Tailwind CSS 3.4
**State:** React Query 5.56 (Server), Zustand 5.0 (Client)
**Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
**Hosting:** Cloudflare Pages

## DATABASE SCHEMA (SUPABASE)

1. `categories`: Hierarchical (parent_id), slugs per section
2. `products`: Main catalog, images[], tags[], enums
3. `customer_profiles`: Extended user data, automated tiers
4. `addresses`: Shipping/Billing variants, defaults
5. `orders`: JSONB items, order_number generation, status tracking
6. `coupons`: Discount system (fixed/percent)
7. `loyalty_points`: Earn/burn history capability

## FEATURES IMPLEMENTED

- **Catalog**: 40 products, 13 cats, search, filters
- **User System**: Auth, Profiles, Addresses, Orders History
- **Cart & Checkout**: Persistent cart, WhatsApp integration, Guest checkout
- **Loyalty**: 4 Tiers, Points system, Dashboard
- **PWA**: Installable, Offline basics, Service Worker

--------------------------------------------------------------------------------

PART 2: PROJECT DIRECTORY STRUCTURE
--------------------------------------------------------------------------------

vsm-store/
├── public/                 # Static assets (icons, manifest)
├── src/
│   ├── components/         # UI Components
│   │   ├── auth/           # Login/Register modals
│   │   ├── cart/           # Sidebar, Checkout logic
│   │   ├── categories/     # Category cards
│   │   ├── layout/         # Header, Footer
│   │   ├── loyalty/        # Loyalty badges/dashboard
│   │   ├── notifications/  # Toasts system
│   │   ├── products/       # Product cards, details
│   │   ├── search/         # Search overlay
│   │   ├── social/         # Social links
│   │   └── ui/             # Generic UI (skeletons)
│   ├── config/             # Global config (site.ts)
│   ├── contexts/           # React Contexts (Auth)
│   ├── hooks/              # Custom Hooks (React Query wrappers)
│   ├── lib/                # Utilities (supabase client, formatters)
│   ├── pages/              # Route components
│   ├── services/           # API interaction layer
│   ├── stores/             # Global state (Zustand)
│   └── types/              # TypeScript definitions
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js

--------------------------------------------------------------------------------

PART 3: SOURCE CODE - CRITICAL CONFIGURATION & TYPES
--------------------------------------------------------------------------------

=== FILE: src/config/site.ts ===
import type { Order } from '@/types/cart';

export const SITE_CONFIG = {
    name: 'VSM Store',
    description: 'Tu tienda de vape y productos 420',
    whatsapp: {
        number: '5212281234567',
        defaultMessage: 'Hola, vengo de VSM Store y quiero hacer un pedido',
    },
    location: {
        address: 'Av. Principal #123, Col. Centro',
        city: 'Xalapa',
        state: 'Veracruz',
        zipCode: '91000',
        country: 'México',
    },
    social: {
        facebook: '<https://www.facebook.com/vsmstore>',
        instagram: '<https://www.instagram.com/vsmstore>',
        youtube: '<https://www.youtube.com/@vsmstore>',
        whatsapp: '<https://wa.me/5212281234567>',
    },
    store: {
        currency: 'MXN',
        currencySymbol: '$',
        locale: 'es-MX',
        timezone: 'America/Mexico_City',
    },
    orderWhatsApp: {
        enabled: true,
        generateMessage: (order: Order): string => {
            // Logic to generate whatsapp message from order
            return `Pedido ${order.order_number}...`;
        }
    }
};

=== FILE: src/types/product.ts ===
export type Section = 'vape' | '420';
export type ProductStatus = 'active' | 'legacy' | 'discontinued' | 'coming_soon';

export interface Product {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    short_description: string | null;
    price: number;
    compare_at_price: number | null;
    stock: number;
    sku: string | null;
    section: Section;
    category_id: string;
    tags: string[];
    status: ProductStatus;
    images: string[];
    is_featured: boolean;
    is_new: boolean;
    is_bestseller: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

=== FILE: src/lib/supabase.ts ===
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
    supabaseUrl || '<https://placeholder.supabase.co>',
    supabaseAnonKey || 'placeholder-key'
);

--------------------------------------------------------------------------------

PART 4: CORE STATE MANAGEMENT
--------------------------------------------------------------------------------

=== FILE: src/stores/cart.store.ts ===
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';

interface CartState {
    items: CartItem[];
    isOpen: boolean;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    // ... getters
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,
            addItem: (product, quantity = 1) => {
                set((state) => {
                    const existingIndex = state.items.findIndex(i => i.product.id === product.id);
                    if (existingIndex >= 0) {
                        const updated = [...state.items];
                        updated[existingIndex].quantity += quantity;
                        return { items: updated };
                    }
                    return { items: [...state.items, { product, quantity }] };
                });
            },
            // ... other implementations
            removeItem: (id) => set(s => ({ items: s.items.filter(i => i.product.id !== id) })),
            clearCart: () => set({ items: [] }),
        }),
        { name: 'vsm-cart' }
    )
);

--------------------------------------------------------------------------------

PART 5: ROADMAP TO PRODUCTION (From ROADMAP.md)
--------------------------------------------------------------------------------

## CRÍTICO (20 horas)

1. **ADMIN PANEL (6h)**: App separada para gestión. Ver Part 6.
2. **PASARELA DE PAGOS (4h)**: Mercado Pago / Stripe integration.
3. **IMÁGENES REALES (3h)**: Reemplazar placeholders de Unsplash.
4. **INVENTARIO REAL (2h)**: Stock quantity management.
5. **SISTEMA DE ENVÍOS (3h)**: FedEx/DHL API integration.
6. **FACTURACIÓN FISCAL (2h)**: CFDI para México.

## IMPORTANTE (12 horas)

7. Landing Page Épica
2. Email Notifications (SendGrid/Resend)
3. Reviews & Ratings system
4. Wishlist persistence

--------------------------------------------------------------------------------

PART 6: ADMIN PANEL PLAN (From ADMIN_PANEL.md)
--------------------------------------------------------------------------------

## ARQUITECTURA

- **Proyecto separado**: `vsm-admin` (repo y deploy aparte)
- **Backend compartido**: Misma instancia de Supabase
- **Seguridad**: RLS policies específicas para admin role

## FASES DE IMPLEMENTACIÓN

1. **Setup & Auth**: Login de admin, protección de rutas.
2. **Dashboard**: Métricas clave, gráficas de ventas.
3. **Productos**: CRUD completo, upload de imágenes.
4. **Pedidos**: Lista, detalle, actualización de status, impresión.
5. **Inventario**: Ajustes de stock, historial de movimientos.
6. **Usuarios & Cupones**: CRM básico y gestión de promociones.

## SCHEMA EXTENSIONS

- Table `admin_users` para roles y permisos.
- Policies `Admins can do everything` en todas las tablas principales.

--------------------------------------------------------------------------------

END OF CONTEXT FILE
--------------------------------------------------------------------------------
