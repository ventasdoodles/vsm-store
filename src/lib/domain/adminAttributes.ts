import type { Section } from '@/types/constants';
import type { ProductAttribute } from '@/types/variant';

export type AttributeApplicability = ProductAttribute['applicability'];

export interface AttributeUpdatePayload {
    id: string;
    updates: {
        name?: string;
        is_variant_capable?: boolean;
        applicability?: AttributeApplicability;
    };
}

export function normalizeAttributeTextInput(value: string): string | null {
    const trimmed = value.trim();
    return trimmed || null;
}

export function buildAttributeUpdatePayload(
    id: string,
    updates: AttributeUpdatePayload['updates'],
): AttributeUpdatePayload {
    return { id, updates };
}

function cloneApplicability(applicability?: AttributeApplicability): AttributeApplicability {
    if (!applicability) return { sections: [] };

    if (applicability.categories !== undefined) {
        return {
            sections: [...applicability.sections],
            categories: [...applicability.categories],
        };
    }

    return {
        sections: [...applicability.sections],
    };
}

export function toggleAttributeSection(
    applicability: AttributeApplicability | undefined,
    section: Section,
): AttributeApplicability {
    const currentSections = applicability?.sections ?? [];
    const nextSections = currentSections.includes(section)
        ? currentSections.filter((item) => item !== section)
        : [...currentSections, section];

    const next = cloneApplicability(applicability);
    next.sections = nextSections;
    return next;
}

export function toggleAttributeCategory(
    applicability: AttributeApplicability | undefined,
    categoryId: string,
): AttributeApplicability {
    const currentCategories = applicability?.categories ?? [];
    const nextCategories = currentCategories.includes(categoryId)
        ? currentCategories.filter((item) => item !== categoryId)
        : [...currentCategories, categoryId];

    const next = cloneApplicability(applicability);
    next.categories = nextCategories;
    return next;
}

export function clearAttributeCategories(applicability: AttributeApplicability | undefined): AttributeApplicability {
    const next = cloneApplicability(applicability);
    next.categories = [];
    return next;
}
