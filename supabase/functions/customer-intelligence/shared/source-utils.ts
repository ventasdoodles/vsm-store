import { ToolResult } from '../tools.ts';

export type PublicSourceContext = {
    label: string;
    brief?: string;
    sources: Array<{ title: string; url: string }>;
};

export function extractPublicSourceUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
        const parsed = new URL(value.trim());
        return /^https?:$/.test(parsed.protocol) ? parsed.toString() : null;
    } catch {
        return null;
    }
}

export function normalizePublicSourceTitle(title: unknown, url: string): string {
    if (typeof title === 'string' && title.trim()) {
        return title.trim().slice(0, 80);
    }

    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return 'Fuente publica';
    }
}

export function buildPublicSourceContext(toolResults: ToolResult[]): PublicSourceContext | null {
    const publicToolResults = toolResults.filter((result) =>
        result.status === 'success'
        && (result.name === 'public_web_search' || result.name === 'public_url_context'),
    );

    if (publicToolResults.length === 0) return null;

    const sources: Array<{ title: string; url: string }> = [];
    const seenUrls = new Set<string>();

    for (const result of publicToolResults) {
        const metadata = (result as any)?.metadata ?? {};
        const rawEntries = result.name === 'public_web_search'
            ? (Array.isArray(metadata.sources) ? metadata.sources : [])
            : (Array.isArray(metadata.urls) ? metadata.urls : []);

        for (const entry of rawEntries) {
            const url = extractPublicSourceUrl(
                entry?.url
                ?? entry?.uri
                ?? entry?.retrieved_url
                ?? entry?.retrievedUrl,
            );
            if (!url || seenUrls.has(url)) continue;
            seenUrls.add(url);
            sources.push({
                title: normalizePublicSourceTitle(entry?.title, url),
                url,
            });

            if (sources.length >= 2) break;
        }

        if (sources.length >= 2) break;
    }

    const brief = sources.length > 0
        ? sources.map((source) => source.title).join(' · ')
        : undefined;

    return {
        label: 'Contexto publico',
        brief,
        sources,
    };
}

export function formatCompactSourceLines(lines: string[], fallback: string, maxLines = 3): string {
    const compactLines = lines
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .slice(0, maxLines);

    return compactLines.length > 0 ? compactLines.join('\n') : fallback;
}
