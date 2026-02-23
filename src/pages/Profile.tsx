/**
 * Profile Page — VSM Store
 *
 * Composición pura de sub-componentes independientes.
 * Cada sección está envuelta en SectionErrorBoundary para aislamiento.
 *
 * Secciones (en orden):
 * 1. ProfileHero       — Avatar, nombre, email, tier badge
 * 2. ProfileStats      — 4 stat cards (pedidos, gastado, puntos, nivel)
 * 3. ProfileQuickLinks — Grid de accesos rápidos
 * 4. ProfileInfo       — Información personal (teléfono, WhatsApp, etc.)
 * 5. ProfileActions    — Cerrar sesión
 */
import { SEO } from '@/components/seo/SEO';
import { SectionErrorBoundary } from '@/components/ui/SectionErrorBoundary';
import {
    ProfileHero,
    ProfileStats,
    ProfileQuickLinks,
    ProfileInfo,
    ProfileForm,
    ProfileActions,
} from '@/components/profile';

export function Profile() {
    return (
        <div className="container-vsm py-8 space-y-6">
            <SEO title="Mi perfil" description="Tu perfil de VSM Store" />

            {/* 1. HERO — Avatar + nombre + tier */}
            <SectionErrorBoundary name="ProfileHero">
                <ProfileHero />
            </SectionErrorBoundary>

            {/* 2. STATS — 4 tarjetas de estadísticas */}
            <SectionErrorBoundary name="ProfileStats">
                <ProfileStats />
            </SectionErrorBoundary>

            {/* 3. QUICK LINKS — Accesos rápidos */}
            <SectionErrorBoundary name="ProfileQuickLinks">
                <ProfileQuickLinks />
            </SectionErrorBoundary>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 4. INFO — Información personal (Solo lectura) */}
                <SectionErrorBoundary name="ProfileInfo">
                    <ProfileInfo />
                </SectionErrorBoundary>

                {/* 5. FORM — Editar información personal */}
                <SectionErrorBoundary name="ProfileForm">
                    <ProfileForm />
                </SectionErrorBoundary>
            </div>

            {/* 6. ACTIONS — Cerrar sesión */}
            <SectionErrorBoundary name="ProfileActions">
                <ProfileActions />
            </SectionErrorBoundary>
        </div>
    );
}
