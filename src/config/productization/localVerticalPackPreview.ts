import { secondVerticalProofConfig } from './secondVerticalProof';
import { secondVerticalProofProducts, type SecondVerticalProofProduct } from './secondVerticalProofFixtures';
import type { VerticalPackConfig } from './types';

export interface LocalVerticalPackPreview {
    routePrefix: string;
    pack: VerticalPackConfig;
    products: SecondVerticalProofProduct[];
}

const LOCAL_VERTICAL_PACK_PREVIEWS: LocalVerticalPackPreview[] = [
    {
        routePrefix: '/__qa/second-vertical-proof',
        pack: secondVerticalProofConfig,
        products: secondVerticalProofProducts,
    },
];

export function resolveLocalVerticalPackPreviewByRoutePrefix(routePrefix: string): LocalVerticalPackPreview | null {
    const normalizedRoutePrefix = routePrefix.trim();

    if (!normalizedRoutePrefix) {
        return null;
    }

    return (
        LOCAL_VERTICAL_PACK_PREVIEWS.find(
            (preview) =>
                normalizedRoutePrefix === preview.routePrefix ||
                normalizedRoutePrefix.startsWith(`${preview.routePrefix}/`),
        ) ?? null
    );
}
