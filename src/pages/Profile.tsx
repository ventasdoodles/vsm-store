/**
 * // ─── PÁGINA: PROFILE ───
 * // Propósito: Centro de gestión de cuenta, lealtad y configuración del usuario.
 * // Arquitectura: Orquestación modular de sub-módulos independientes (§1.3).
 * // Composición: ProfileHero, ProfileStats, ProfileQuickLinks, ProfileInfo, ProfileForm.
 */
import { m } from 'framer-motion';
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

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 100 } },
};

export function Profile() {
    return (
        <m.div
            variants={container}
            initial="hidden"
            animate="show"
            className="container-vsm py-12 space-y-8"
        >
            <SEO title="Mi perfil" description="Tu perfil de VSM Store" />

            {/* 1. HERO — Avatar + nombre + tier */}
            <m.div variants={item}>
                <SectionErrorBoundary name="ProfileHero">
                    <ProfileHero />
                </SectionErrorBoundary>
            </m.div>

            {/* 2. STATS — 4 tarjetas de estadísticas */}
            <m.div variants={item}>
                <SectionErrorBoundary name="ProfileStats">
                    <ProfileStats />
                </SectionErrorBoundary>
            </m.div>

            {/* 3. QUICK LINKS — Accesos rápidos */}
            <m.div variants={item}>
                <SectionErrorBoundary name="ProfileQuickLinks">
                    <ProfileQuickLinks />
                </SectionErrorBoundary>
            </m.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 4. INFO — Información personal (Solo lectura) */}
                <m.div variants={item}>
                    <SectionErrorBoundary name="ProfileInfo">
                        <ProfileInfo />
                    </SectionErrorBoundary>
                </m.div>

                {/* 5. FORM — Editar información personal */}
                <m.div variants={item}>
                    <SectionErrorBoundary name="ProfileForm">
                        <ProfileForm />
                    </SectionErrorBoundary>
                </m.div>
            </div>

            {/* 6. ACTIONS — Cerrar sesión */}
            <m.div variants={item}>
                <SectionErrorBoundary name="ProfileActions">
                    <ProfileActions />
                </SectionErrorBoundary>
            </m.div>
        </m.div>
    );
}
