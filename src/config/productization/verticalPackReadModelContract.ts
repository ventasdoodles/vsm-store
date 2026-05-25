import type { VerticalPackConfig } from './types';
import {
    buildVerticalPackReadModel,
    buildVerticalPackRouteManifest,
    resolveVerticalPackSection,
} from './verticalPackReadModel';

export interface VerticalPackReadModelContractViolation {
    field: string;
    message: string;
}

export interface VerticalPackReadModelContractSummary {
    packId: string;
    sectionSlugs: string[];
    routeManifestRootRoutes: string[];
    routeManifestSlugRoutePatterns: string[];
    sectionReadModelSlugs: string[];
    sectionProductCounts: number[];
    localProductSectionSlugs: string[];
    hasLocalProducts: boolean;
}

function pushViolation(
    violations: VerticalPackReadModelContractViolation[],
    field: string,
    message: string,
) {
    violations.push({
        field,
        message,
    });
}

export function summarizeVerticalPackReadModelContract<TProduct extends { sectionSlug: string }>(
    pack: VerticalPackConfig,
    products: readonly TProduct[] = [],
): VerticalPackReadModelContractSummary {
    const readModel = buildVerticalPackReadModel(pack, products);

    return {
        packId: pack.id,
        sectionSlugs: pack.sections.map((section) => section.slug),
        routeManifestRootRoutes: readModel.routeManifest.map((route) => route.rootRoute),
        routeManifestSlugRoutePatterns: readModel.routeManifest.map((route) => route.slugRoutePattern),
        sectionReadModelSlugs: readModel.sections.map((section) => section.slug),
        sectionProductCounts: readModel.sectionProductGroups.map((group) => group.productCount),
        localProductSectionSlugs: Object.entries(readModel.productsBySectionSlug)
            .filter(([, localProducts]) => localProducts.length > 0)
            .map(([sectionSlug]) => sectionSlug),
        hasLocalProducts: readModel.hasLocalProducts,
    };
}

export function getVerticalPackReadModelContractViolations<TProduct extends { sectionSlug: string }>(
    pack: VerticalPackConfig,
    products: readonly TProduct[] = [],
): VerticalPackReadModelContractViolation[] {
    const violations: VerticalPackReadModelContractViolation[] = [];
    const readModel = buildVerticalPackReadModel(pack, products);
    const routeManifest = buildVerticalPackRouteManifest(pack);
    const declaredSectionSlugs = new Set(pack.sections.map((section) => section.slug));

    if (routeManifest.length !== pack.sections.length) {
        pushViolation(
            violations,
            'routeManifest.length',
            `expected ${pack.sections.length} routes, received ${routeManifest.length}`,
        );
    }

    if (readModel.sections.length !== pack.sections.length) {
        pushViolation(
            violations,
            'sections.length',
            `expected ${pack.sections.length} read model sections, received ${readModel.sections.length}`,
        );
    }

    if (readModel.sectionProductGroups.length !== pack.sections.length) {
        pushViolation(
            violations,
            'sectionProductGroups.length',
            `expected ${pack.sections.length} section product groups, received ${readModel.sectionProductGroups.length}`,
        );
    }

    pack.sections.forEach((section, index) => {
        const route = routeManifest[index];
        const readModelSection = readModel.sections[index];
        const group = readModel.sectionProductGroups[index];
        const localProducts = readModel.productsBySectionSlug[section.slug] ?? [];
        const nestedRoute = `${section.routePrefix}/proof-slug`;

        if (!route) {
            pushViolation(violations, `routeManifest[${index}]`, `missing route manifest for section ${section.slug}`);
        } else {
            if (route.sectionSlug !== section.slug) {
                pushViolation(
                    violations,
                    `routeManifest[${index}].sectionSlug`,
                    `expected ${section.slug}, received ${route.sectionSlug}`,
                );
            }

            if (route.rootRoute !== section.routePrefix) {
                pushViolation(
                    violations,
                    `routeManifest[${index}].rootRoute`,
                    `expected ${section.routePrefix}, received ${route.rootRoute}`,
                );
            }

            const expectedSlugRoutePattern = `${section.routePrefix}/:slug`;

            if (route.slugRoutePattern !== expectedSlugRoutePattern) {
                pushViolation(
                    violations,
                    `routeManifest[${index}].slugRoutePattern`,
                    `expected ${expectedSlugRoutePattern}, received ${route.slugRoutePattern}`,
                );
            }
        }

        if (!readModelSection) {
            pushViolation(
                violations,
                `sections[${index}]`,
                `missing read model section for ${section.slug}`,
            );
        } else {
            if (readModelSection.slug !== section.slug) {
                pushViolation(
                    violations,
                    `sections[${index}].slug`,
                    `expected ${section.slug}, received ${readModelSection.slug}`,
                );
            }

            const expectedSlugRoutePattern = `${section.routePrefix}/:slug`;

            if (readModelSection.slugRoutePattern !== expectedSlugRoutePattern) {
                pushViolation(
                    violations,
                    `sections[${index}].slugRoutePattern`,
                    `expected ${expectedSlugRoutePattern}, received ${readModelSection.slugRoutePattern}`,
                );
            }

            if (readModelSection.localProductCount !== localProducts.length) {
                pushViolation(
                    violations,
                    `sections[${index}].localProductCount`,
                    `expected ${localProducts.length}, received ${readModelSection.localProductCount}`,
                );
            }

            if (readModelSection.hasLocalProducts !== (localProducts.length > 0)) {
                pushViolation(
                    violations,
                    `sections[${index}].hasLocalProducts`,
                    `expected ${localProducts.length > 0}, received ${readModelSection.hasLocalProducts}`,
                );
            }

            const resolvedBySlug = resolveVerticalPackSection(readModel.sections, section.slug);
            const resolvedByRootRoute = resolveVerticalPackSection(readModel.sections, section.routePrefix);
            const resolvedByNestedRoute = resolveVerticalPackSection(readModel.sections, nestedRoute);

            if (resolvedBySlug?.slug !== section.slug) {
                pushViolation(
                    violations,
                    `sections[${index}].lookup.slug`,
                    `expected ${section.slug}, received ${resolvedBySlug?.slug ?? 'null'}`,
                );
            }

            if (resolvedByRootRoute?.slug !== section.slug) {
                pushViolation(
                    violations,
                    `sections[${index}].lookup.rootRoute`,
                    `expected ${section.slug}, received ${resolvedByRootRoute?.slug ?? 'null'}`,
                );
            }

            if (resolvedByNestedRoute?.slug !== section.slug) {
                pushViolation(
                    violations,
                    `sections[${index}].lookup.nestedRoute`,
                    `expected ${section.slug}, received ${resolvedByNestedRoute?.slug ?? 'null'}`,
                );
            }
        }

        if (!group) {
            pushViolation(violations, `sectionProductGroups[${index}]`, `missing product group for ${section.slug}`);
            return;
        }

        if (group.section.slug !== section.slug) {
            pushViolation(
                violations,
                `sectionProductGroups[${index}].section.slug`,
                `expected ${section.slug}, received ${group.section.slug}`,
            );
        }

        if (group.productCount !== localProducts.length) {
            pushViolation(
                violations,
                `sectionProductGroups[${index}].productCount`,
                `expected ${localProducts.length}, received ${group.productCount}`,
            );
        }

        if (group.hasLocalProducts !== (localProducts.length > 0)) {
            pushViolation(
                violations,
                `sectionProductGroups[${index}].hasLocalProducts`,
                `expected ${localProducts.length > 0}, received ${group.hasLocalProducts}`,
            );
        }

        if (group.products.length !== localProducts.length) {
            pushViolation(
                violations,
                `sectionProductGroups[${index}].products.length`,
                `expected ${localProducts.length}, received ${group.products.length}`,
            );
        }
    });

    for (const product of products) {
        if (!declaredSectionSlugs.has(product.sectionSlug)) {
            pushViolation(
                violations,
                'products.sectionSlug',
                `unknown sectionSlug: ${product.sectionSlug}`,
            );
        }
    }

    const assignedProductCount = readModel.sectionProductGroups.reduce(
        (count, group) => count + group.productCount,
        0,
    );

    if (readModel.hasLocalProducts !== (assignedProductCount > 0)) {
        pushViolation(
            violations,
            'hasLocalProducts',
            `expected ${assignedProductCount > 0}, received ${readModel.hasLocalProducts}`,
        );
    }

    return violations;
}

export function assertValidVerticalPackReadModelContract<TProduct extends { sectionSlug: string }>(
    pack: VerticalPackConfig,
    products: readonly TProduct[] = [],
): VerticalPackConfig {
    const violations = getVerticalPackReadModelContractViolations(pack, products);

    if (violations.length === 0) {
        return pack;
    }

    const details = violations.map((violation) => `${violation.field}: ${violation.message}`).join('\n');
    throw new Error(`Invalid vertical pack read model contract for "${pack.id}"\n${details}`);
}
