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
import { motion } from 'framer-motion';
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
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

export function Profile() {
    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="container-vsm py-12 space-y-8"
        >
            <SEO title="Mi perfil" description="Tu perfil de VSM Store" />

            {/* 1. HERO — Avatar + nombre + tier */}
            <motion.div variants={item}>
                <SectionErrorBoundary name="ProfileHero">
                    <ProfileHero />
                </SectionErrorBoundary>
            </motion.div>

            {/* 2. STATS — 4 tarjetas de estadísticas */}
            <motion.div variants={item}>
                <SectionErrorBoundary name="ProfileStats">
                    <ProfileStats />
                </SectionErrorBoundary>
            </motion.div>

            {/* 3. QUICK LINKS — Accesos rápidos */}
            <motion.div variants={item}>
                <SectionErrorBoundary name="ProfileQuickLinks">
                    <ProfileQuickLinks />
                </SectionErrorBoundary>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 4. INFO — Información personal (Solo lectura) */}
                <motion.div variants={item}>
                    <SectionErrorBoundary name="ProfileInfo">
                        <ProfileInfo />
                    </SectionErrorBoundary>
                </motion.div>

                {/* 5. FORM — Editar información personal */}
                <motion.div variants={item}>
                    <SectionErrorBoundary name="ProfileForm">
                        <ProfileForm />
                    </SectionErrorBoundary>
                </motion.div>
            </div>

            {/* 6. ACTIONS — Cerrar sesión */}
            <motion.div variants={item}>
                <SectionErrorBoundary name="ProfileActions">
                    <ProfileActions />
                </SectionErrorBoundary>
            </motion.div>
        </motion.div>
    );
}
