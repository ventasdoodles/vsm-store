import type { Section } from '@/types/constants';
import type { VerticalPackConfig, VerticalSectionConfig } from './types';
import { vape420VerticalPackConfig } from './vape420VerticalPack';

export interface AdminSectionCatalogEntry extends VerticalSectionConfig {
    slug: Section;
    displayLabel: string;
    filterLabel: string;
    formLabel: string;
    badgeClassName: string;
    guideClassName: string;
    ringClassName: string;
    selectedButtonClassName: string;
    idleButtonClassName: string;
}

export interface AdminSectionCatalog {
    sections: AdminSectionCatalogEntry[];
    bySlug: Record<Section, AdminSectionCatalogEntry>;
}

type SectionTonePreset = {
    displayEmoji: string;
    filterEmoji: string;
    formEmoji: string;
    badgeClassName: string;
    guideClassName: string;
    ringClassName: string;
    selectedButtonClassName: string;
    idleButtonClassName: string;
};

const SECTION_TONE_PRESETS: Record<string, SectionTonePreset> = {
    vape: {
        displayEmoji: '💨',
        filterEmoji: '🌬️',
        formEmoji: '🌬️',
        badgeClassName: 'bg-violet-500/10 text-violet-400 ring-violet-500/20',
        guideClassName: 'from-violet-500/30 to-violet-500/0',
        ringClassName: 'ring-violet-500/30',
        selectedButtonClassName: 'border-violet-500/50 bg-violet-500/10 text-violet-400',
        idleButtonClassName: 'border-theme bg-theme-primary/60 text-theme-secondary',
    },
    herbal: {
        displayEmoji: '🌿',
        filterEmoji: '🌿',
        formEmoji: '🌿',
        badgeClassName: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
        guideClassName: 'from-emerald-500/30 to-emerald-500/0',
        ringClassName: 'ring-emerald-500/30',
        selectedButtonClassName: 'border-herbal-500/50 bg-herbal-500/10 text-herbal-400',
        idleButtonClassName: 'border-theme bg-theme-primary/60 text-theme-secondary',
    },
};

const DEFAULT_TONE_PRESET: SectionTonePreset = {
    displayEmoji: '◆',
    filterEmoji: '◆',
    formEmoji: '◆',
    badgeClassName: 'bg-white/10 text-white/60 ring-white/20',
    guideClassName: 'from-white/20 to-white/0',
    ringClassName: 'ring-white/20',
    selectedButtonClassName: 'border-white/20 bg-white/10 text-white',
    idleButtonClassName: 'border-theme bg-theme-primary/60 text-theme-secondary',
};

function getTonePreset(themeToken: string): SectionTonePreset {
    return SECTION_TONE_PRESETS[themeToken] ?? DEFAULT_TONE_PRESET;
}

function buildAdminSectionEntry(section: VerticalSectionConfig): AdminSectionCatalogEntry {
    const tone = getTonePreset(section.themeToken);

    return {
        ...section,
        slug: section.slug as Section,
        displayLabel: `${tone.displayEmoji} ${section.shortLabel}`,
        filterLabel: `${tone.filterEmoji} ${section.shortLabel} (Contexto)`,
        formLabel: `${tone.formEmoji} Sólo ${section.shortLabel}`,
        badgeClassName: tone.badgeClassName,
        guideClassName: tone.guideClassName,
        ringClassName: tone.ringClassName,
        selectedButtonClassName: tone.selectedButtonClassName,
        idleButtonClassName: tone.idleButtonClassName,
    };
}

export function buildAdminSectionCatalog(
    pack: VerticalPackConfig = vape420VerticalPackConfig,
): AdminSectionCatalog {
    const sections = pack.sections.map(buildAdminSectionEntry);

    return {
        sections,
        bySlug: sections.reduce<Record<Section, AdminSectionCatalogEntry>>((accumulator, section) => {
            accumulator[section.slug] = section;
            return accumulator;
        }, {} as Record<Section, AdminSectionCatalogEntry>),
    };
}

export function getAdminSectionCatalogEntry(
    sectionSlug: Section,
    pack: VerticalPackConfig = vape420VerticalPackConfig,
): AdminSectionCatalogEntry | null {
    return buildAdminSectionCatalog(pack).bySlug[sectionSlug] ?? null;
}

export function buildAdminSectionCounts<T extends { section?: string | null }>(
    items: readonly T[],
    pack: VerticalPackConfig = vape420VerticalPackConfig,
): Record<Section, number> {
    const catalog = buildAdminSectionCatalog(pack);
    const counts = catalog.sections.reduce<Record<Section, number>>((accumulator, section) => {
        accumulator[section.slug] = 0;
        return accumulator;
    }, {} as Record<Section, number>);

    for (const item of items) {
        if (item.section) {
            const section = catalog.bySlug[item.section as Section];

            if (section) {
                counts[section.slug] = (counts[section.slug] ?? 0) + 1;
            }
        }
    }

    return counts;
}
