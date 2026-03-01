/**
 * Z-index scale constants — VSM Store
 *
 * Centralised reference for the z-index layers used across the app.
 * Components currently use Tailwind utility classes (z-40, z-50, z-[100]).
 * This file documents the intended scale so future developers keep it consistent.
 *
 * Layer hierarchy (low → high):
 *   CONTENT    (z-30)  — In-flow elevated content (sticky headers, tooltips relative)
 *   FLOAT      (z-40)  — Floating UI: Header, WhatsApp FAB, ScrollToTop, StickyAddToCart,
 *                         SocialProofToast, CartSidebar overlay, NotificationCenter dropdown
 *   NAV        (z-50)  — Navigation overlays: BottomNavigation, SideDrawer, CartSidebar body,
 *                         ToastContainer, InstallPrompt, QuickViewModal, Dropdowns (Category, UserMenu)
 *   OVERLAY    (z-100) — Full-screen overlays: BottomSheet backdrop, SearchBar dropdown
 *   SHEET      (z-101) — Content sitting on top of overlays: BottomSheet body
 *   SKIP       (z-110) — Accessibility skip-to-main link (CSS)
 */

export const Z = {
    CONTENT: 30,
    FLOAT: 40,
    NAV: 50,
    OVERLAY: 100,
    SHEET: 101,
    SKIP: 110,
} as const;

export type ZLayer = keyof typeof Z;
