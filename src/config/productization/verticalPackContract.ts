import type { VerticalPackConfig } from './types';

export interface VerticalPackContractViolation {
    field: string;
    message: string;
}

export interface VerticalPackContractSummary {
    sectionSlugs: string[];
    sectionRoutePrefixes: string[];
    categorySlugs: string[];
    fixtureImageKeys: string[];
}

function getDuplicates(values: string[]) {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    for (const value of values) {
        if (seen.has(value)) {
            duplicates.add(value);
            continue;
        }

        seen.add(value);
    }

    return [...duplicates];
}

function getSortedKeys(record: Record<string, string[]>) {
    return Object.keys(record).sort((left, right) => left.localeCompare(right));
}

function pushDuplicateViolations(
    violations: VerticalPackContractViolation[],
    field: string,
    values: string[],
    messagePrefix: string,
) {
    for (const value of getDuplicates(values)) {
        violations.push({
            field,
            message: `${messagePrefix}: ${value}`,
        });
    }
}

export function summarizeVerticalPackContract(pack: VerticalPackConfig): VerticalPackContractSummary {
    return {
        sectionSlugs: pack.sections.map((section) => section.slug),
        sectionRoutePrefixes: pack.sections.map((section) => section.routePrefix),
        categorySlugs: pack.categoryTaxonomyHints.map((category) => category.slug),
        fixtureImageKeys: pack.categoryTaxonomyHints
            .map((category) => category.fixtureImageKey)
            .filter((fixtureImageKey): fixtureImageKey is string => Boolean(fixtureImageKey)),
    };
}

export function getVerticalPackContractViolations(pack: VerticalPackConfig): VerticalPackContractViolation[] {
    const violations: VerticalPackContractViolation[] = [];
    const summary = summarizeVerticalPackContract(pack);
    const sectionSlugSet = new Set(summary.sectionSlugs);
    const categorySlugSet = new Set(summary.categorySlugs);
    const fixtureImageKeySet = new Set(summary.fixtureImageKeys);

    pushDuplicateViolations(
        violations,
        'sections.slug',
        summary.sectionSlugs,
        'duplicate section slug',
    );
    pushDuplicateViolations(
        violations,
        'sections.routePrefix',
        summary.sectionRoutePrefixes,
        'duplicate section routePrefix',
    );
    pushDuplicateViolations(
        violations,
        'categoryTaxonomyHints.slug',
        summary.categorySlugs,
        'duplicate category taxonomy slug',
    );

    for (const section of pack.sections) {
        if (!section.routePrefix.trim()) {
            violations.push({
                field: 'sections.routePrefix',
                message: `missing routePrefix for section: ${section.slug}`,
            });
        }
    }

    for (const category of pack.categoryTaxonomyHints) {
        if (!sectionSlugSet.has(category.sectionSlug)) {
            violations.push({
                field: 'categoryTaxonomyHints.sectionSlug',
                message: `unknown sectionSlug for category ${category.slug}: ${category.sectionSlug}`,
            });
        }
    }

    for (const attributeHint of pack.productAttributeHints) {
        if (!sectionSlugSet.has(attributeHint.sectionSlug)) {
            violations.push({
                field: 'productAttributeHints.sectionSlug',
                message: `unknown sectionSlug for attribute hint ${attributeHint.categorySlug}: ${attributeHint.sectionSlug}`,
            });
        }
    }

    const defaultSpecSectionKeys = getSortedKeys(pack.attributeSchema.defaultSpecsBySectionSlug);
    const declaredSectionSlugs = [...summary.sectionSlugs].sort((left, right) => left.localeCompare(right));

    if (defaultSpecSectionKeys.join('|') !== declaredSectionSlugs.join('|')) {
        violations.push({
            field: 'attributeSchema.defaultSpecsBySectionSlug',
            message: `section keys must match declared section slugs: expected ${declaredSectionSlugs.join(', ')}, received ${defaultSpecSectionKeys.join(', ')}`,
        });
    }

    for (const category of pack.marketing.categoryShowcase.fallbackCategories) {
        if (!sectionSlugSet.has(category.sectionSlug)) {
            violations.push({
                field: 'marketing.categoryShowcase.fallbackCategories.sectionSlug',
                message: `unknown sectionSlug for fallback category ${category.slug}: ${category.sectionSlug}`,
            });
        }

        if (!categorySlugSet.has(category.slug)) {
            violations.push({
                field: 'marketing.categoryShowcase.fallbackCategories.slug',
                message: `fallback category is not present in taxonomy hints: ${category.slug}`,
            });
        }
    }

    for (const categorySlug of pack.fixtureMetadata.demoCategorySlugs) {
        if (!categorySlugSet.has(categorySlug)) {
            violations.push({
                field: 'fixtureMetadata.demoCategorySlugs',
                message: `demoCategorySlug is not present in taxonomy hints: ${categorySlug}`,
            });
        }
    }

    for (const fixtureImageKey of pack.fixtureMetadata.fallbackImageKeys) {
        if (!fixtureImageKeySet.has(fixtureImageKey)) {
            violations.push({
                field: 'fixtureMetadata.fallbackImageKeys',
                message: `fallbackImageKey is not present in taxonomy hints: ${fixtureImageKey}`,
            });
        }
    }

    return violations;
}

export function assertValidVerticalPackContract(pack: VerticalPackConfig): VerticalPackConfig {
    const violations = getVerticalPackContractViolations(pack);

    if (violations.length === 0) {
        return pack;
    }

    const details = violations.map((violation) => `${violation.field}: ${violation.message}`).join('\n');
    throw new Error(`Invalid vertical pack contract for "${pack.id}"\n${details}`);
}
