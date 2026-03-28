import type { InternalResolvedProduct } from '@/types/ai-capsule';
import type { Product } from '@/types/product';

export interface CesarinPreferenceSummary {
    confirmed_likes: string[];
    explicit_likes: string[];
    weak_tendencies: string[];
    rejected_preferences: string[];
    format_preferences: string[];
    brand_affinity: string[];
    budget_posture: string | null;
    intensity_posture: string | null;
    experience_posture: string | null;
}

type CesarinRankableProduct =
    | Pick<Product, 'id' | 'name' | 'slug' | 'section' | 'price' | 'description'> & {
        ai_sales_note?: string | null;
        display_price?: string | null;
        specs?: unknown | null;
    }
    | Pick<InternalResolvedProduct, 'id' | 'name' | 'slug' | 'section' | 'display_price' | 'ai_sales_note' | 'description' | 'specs'> & {
        price?: number;
    };

type QuerySignals = {
    normalizedQuery: string;
    hasFlavorSignal: boolean;
    hasBudgetSignal: boolean;
    hasFormatSignal: boolean;
    hasIntensitySignal: boolean;
    hasExperienceSignal: boolean;
    mentionedTerms: string[];
};

const FLAVOR_TERMS = [
    'frutal',
    'dulce',
    'fresco',
    'menta',
    'ice',
    'tabaco',
    'cremoso',
    'tropical',
    'mango',
    'fresa',
    'sandia',
    'melon',
    'uva',
    'mora',
    'cereza',
    'caramelo',
];

const FORMAT_TERMS = ['desechable', 'pod', 'sales', 'liquido', 'cartucho', 'kit', 'mod'];
function normalizeText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function hasMeaningfulPreferenceSummary(summary?: CesarinPreferenceSummary | null): boolean {
    if (!summary) return false;

    return [
        summary.confirmed_likes.length,
        summary.explicit_likes.length,
        summary.weak_tendencies.length,
        summary.rejected_preferences.length,
        summary.format_preferences.length,
        summary.brand_affinity.length,
        summary.budget_posture ? 1 : 0,
        summary.intensity_posture ? 1 : 0,
        summary.experience_posture ? 1 : 0,
    ].some((count) => count > 0);
}

function collectMentionedTerms(query: string): string[] {
    const normalized = normalizeText(query);

    return [
        ...FLAVOR_TERMS.filter((term) => normalized.includes(term)),
        ...FORMAT_TERMS.filter((term) => normalized.includes(term)),
    ];
}

function extractQuerySignals(query: string): QuerySignals {
    const normalized = normalizeText(query);

    return {
        normalizedQuery: normalized,
        hasFlavorSignal: FLAVOR_TERMS.some((term) => normalized.includes(term)),
        hasBudgetSignal: /(barato|economico|economica|presupuesto|no tan caro|premium|algo mas pro|mas pro|subirle un poco)/.test(normalized),
        hasFormatSignal: FORMAT_TERMS.some((term) => normalized.includes(term)),
        hasIntensitySignal: /(suave|tranqui|leve|fuerte|intenso|pegador)/.test(normalized),
        hasExperienceSignal: /(simple|sencillo|facil|sin tanto rollo|avanzado|algo mas avanzado|pro)/.test(normalized),
        mentionedTerms: collectMentionedTerms(normalized),
    };
}

function productSearchText(product: CesarinRankableProduct): string {
    return normalizeText(
        [
            product.name,
            product.ai_sales_note ?? '',
            product.description ?? '',
            typeof product.specs === 'string' ? product.specs : JSON.stringify(product.specs ?? {}),
        ].join(' '),
    );
}

function productMatchesTerm(productText: string, term: string): boolean {
    const normalizedTerm = normalizeText(term);
    if (!normalizedTerm) return false;

    return productText.includes(normalizedTerm);
}

function extractProductPrice(product: CesarinRankableProduct): number | null {
    if (typeof product.price === 'number' && Number.isFinite(product.price)) {
        return product.price;
    }

    const displayPrice = typeof product.display_price === 'string' ? product.display_price : '';
    const numericPrice = Number(displayPrice.replace(/[^0-9.]/g, ''));

    return Number.isFinite(numericPrice) && numericPrice > 0 ? numericPrice : null;
}

function queryAlreadyOverridesPreference(querySignals: QuerySignals, preference: string): boolean {
    const normalizedPreference = normalizeText(preference);

    if (!normalizedPreference) return false;
    if (querySignals.normalizedQuery.includes(normalizedPreference)) return true;
    if (querySignals.mentionedTerms.includes(normalizedPreference)) return true;
    if (normalizedPreference.includes('precio')) return querySignals.hasBudgetSignal;
    if (normalizedPreference.includes('suave') || normalizedPreference.includes('intenso')) {
        return querySignals.hasIntensitySignal;
    }
    if (normalizedPreference.includes('simple') || normalizedPreference.includes('avanzado')) {
        return querySignals.hasExperienceSignal;
    }

    return false;
}

function scoreBudgetPosture(
    budgetPosture: string | null | undefined,
    prices: number[],
    currentPrice: number | null,
): number {
    if (!budgetPosture || currentPrice === null || prices.length < 2) return 0;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    if (minPrice === maxPrice) return 0;

    const normalizedBudget = normalizeText(budgetPosture);
    const midpoint = (minPrice + maxPrice) / 2;
    const range = maxPrice - minPrice;

    if (normalizedBudget.includes('cuida precio') || normalizedBudget.includes('barato')) {
        return Math.round(((midpoint - currentPrice) / range) * 6);
    }

    if (normalizedBudget.includes('subirle') || normalizedBudget.includes('premium')) {
        return Math.round(((currentPrice - midpoint) / range) * 4);
    }

    return 0;
}

function scoreTextPreferences(
    productText: string,
    preferences: string[],
    querySignals: QuerySignals,
    score: number,
    delta: number,
): number {
    return preferences.reduce((nextScore, preference) => {
        if (queryAlreadyOverridesPreference(querySignals, preference)) return nextScore;
        return productMatchesTerm(productText, preference) ? nextScore + delta : nextScore;
    }, score);
}

function scorePosture(productText: string, posture: string | null | undefined, queryOverrides: boolean): number {
    if (!posture || queryOverrides) return 0;

    const normalizedPosture = normalizeText(posture);

    if (normalizedPosture.includes('suaves') || normalizedPosture.includes('suave')) {
        return productMatchesTerm(productText, 'suave') ? 2 : 0;
    }

    if (normalizedPosture.includes('intensos') || normalizedPosture.includes('intenso')) {
        return productMatchesTerm(productText, 'intenso') || productMatchesTerm(productText, 'fuerte') ? 2 : 0;
    }

    if (normalizedPosture.includes('sencillo') || normalizedPosture.includes('simple')) {
        return productMatchesTerm(productText, 'simple') || productMatchesTerm(productText, 'facil') ? 2 : 0;
    }

    if (normalizedPosture.includes('avanzado')) {
        return productMatchesTerm(productText, 'avanzado') || productMatchesTerm(productText, 'pro') ? 2 : 0;
    }

    return 0;
}

export function rerankCesarinSuggestedProducts<T extends CesarinRankableProduct>(input: {
    query: string;
    products: T[];
    preferenceSummary?: CesarinPreferenceSummary | null;
}): T[] {
    const { products, preferenceSummary } = input;

    if (products.length <= 1 || !hasMeaningfulPreferenceSummary(preferenceSummary)) {
        return products;
    }

    const querySignals = extractQuerySignals(input.query);
    const prices = products
        .map((product) => extractProductPrice(product))
        .filter((price): price is number => price !== null);

    const scoredProducts = products.map((product, index) => {
        const productText = productSearchText(product);
        let score = 0;

        if (!querySignals.hasFlavorSignal) {
            score = scoreTextPreferences(productText, preferenceSummary?.confirmed_likes ?? [], querySignals, score, 6);
            score = scoreTextPreferences(productText, preferenceSummary?.explicit_likes ?? [], querySignals, score, 4);
            score = scoreTextPreferences(productText, preferenceSummary?.weak_tendencies ?? [], querySignals, score, 2);
        }

        score = scoreTextPreferences(productText, preferenceSummary?.rejected_preferences ?? [], querySignals, score, -7);

        if (!querySignals.hasFormatSignal) {
            score = scoreTextPreferences(productText, preferenceSummary?.format_preferences ?? [], querySignals, score, 4);
        }

        score = scoreTextPreferences(productText, preferenceSummary?.brand_affinity ?? [], querySignals, score, 3);

        score += scorePosture(productText, preferenceSummary?.intensity_posture, querySignals.hasIntensitySignal);
        score += scorePosture(productText, preferenceSummary?.experience_posture, querySignals.hasExperienceSignal);

        if (!querySignals.hasBudgetSignal) {
            score += scoreBudgetPosture(preferenceSummary?.budget_posture, prices, extractProductPrice(product));
        }

        return { product, index, score };
    });

    const highestScore = Math.max(...scoredProducts.map((entry) => Math.abs(entry.score)));
    if (highestScore === 0) {
        return products;
    }

    return [...scoredProducts]
        .sort((left, right) => right.score - left.score || left.index - right.index)
        .map((entry) => entry.product);
}
