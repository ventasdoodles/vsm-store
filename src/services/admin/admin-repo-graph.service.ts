import repoGraphJson from '../../../graqle.json';

export interface RepoGraphChunk {
    text: string;
    type?: string;
}

export interface RepoGraphNode {
    id: string;
    label: string;
    type: string;
    description?: string;
    file_path?: string;
    chunks?: RepoGraphChunk[];
    chunk_count?: number;
}

export interface RepoGraphLink {
    relationship: string;
    source: string;
    target: string;
    weight?: number;
}

interface RepoGraphData {
    nodes: RepoGraphNode[];
    links: RepoGraphLink[];
}

export interface RepoGraphResolvedLink {
    relationship: string;
    weight?: number;
    source: RepoGraphNode;
    target: RepoGraphNode;
}

export interface RepoGraphChunkPreview {
    type: string;
    preview: string;
}

export interface RepoGraphInspector {
    node: RepoGraphNode;
    parentLinks: RepoGraphResolvedLink[];
    childLinks: RepoGraphResolvedLink[];
    nearbyNodes: RepoGraphNode[];
    chunkPreviews: RepoGraphChunkPreview[];
}

export interface RepoGraphOverview {
    totalNodes: number;
    totalLinks: number;
    relationshipTypes: string[];
    nodeTypes: string[];
}

const repoGraph = repoGraphJson as RepoGraphData;
const nodes = repoGraph.nodes ?? [];
const links = repoGraph.links ?? [];

const nodeById = new Map<string, RepoGraphNode>();
const incomingLinks = new Map<string, RepoGraphLink[]>();
const outgoingLinks = new Map<string, RepoGraphLink[]>();

for (const node of nodes) {
    nodeById.set(node.id, node);
}

for (const link of links) {
    const currentIncoming = incomingLinks.get(link.target) ?? [];
    currentIncoming.push(link);
    incomingLinks.set(link.target, currentIncoming);

    const currentOutgoing = outgoingLinks.get(link.source) ?? [];
    currentOutgoing.push(link);
    outgoingLinks.set(link.source, currentOutgoing);
}

function normalizeText(value: string | undefined): string {
    return (value ?? '').toLowerCase();
}

function buildChunkPreview(text: string): string {
    const compact = text.replace(/\s+/g, ' ').trim();
    if (compact.length <= 240) {
        return compact;
    }

    return `${compact.slice(0, 237)}...`;
}

function uniqueNodes(items: RepoGraphNode[]): RepoGraphNode[] {
    const seen = new Set<string>();
    return items.filter((item) => {
        if (seen.has(item.id)) {
            return false;
        }
        seen.add(item.id);
        return true;
    });
}

function resolveLinks(rawLinks: RepoGraphLink[]): RepoGraphResolvedLink[] {
    return rawLinks.flatMap((link) => {
        const source = nodeById.get(link.source);
        const target = nodeById.get(link.target);

        if (!source || !target) {
            return [];
        }

        return [{
            relationship: link.relationship,
            weight: link.weight,
            source,
            target,
        }];
    });
}

export const DEFAULT_REPO_GRAPH_NODE_ID = 'src/pages/admin/AdminCesarinOS.tsx';

export function getRepoGraphOverview(): RepoGraphOverview {
    return {
        totalNodes: nodes.length,
        totalLinks: links.length,
        relationshipTypes: Array.from(new Set(links.map((link) => link.relationship))).sort(),
        nodeTypes: Array.from(new Set(nodes.map((node) => node.type))).sort(),
    };
}

export function getRepoGraphNodeById(nodeId: string | null | undefined): RepoGraphNode | null {
    if (!nodeId) {
        return null;
    }

    return nodeById.get(nodeId) ?? null;
}

export function listRepoGraphNodes(options?: {
    search?: string;
    type?: string;
    limit?: number;
}): RepoGraphNode[] {
    const search = normalizeText(options?.search);
    const type = options?.type;
    const limit = options?.limit ?? 160;

    const filtered = nodes.filter((node) => {
        if (type && node.type !== type) {
            return false;
        }

        if (!search) {
            return true;
        }

        return [
            node.label,
            node.id,
            node.type,
            node.file_path,
            node.description,
        ].some((value) => normalizeText(value).includes(search));
    });

    filtered.sort((a, b) => {
        const aPath = a.file_path ?? a.id;
        const bPath = b.file_path ?? b.id;

        if (aPath === DEFAULT_REPO_GRAPH_NODE_ID) {
            return -1;
        }

        if (bPath === DEFAULT_REPO_GRAPH_NODE_ID) {
            return 1;
        }

        return aPath.localeCompare(bPath);
    });

    return filtered.slice(0, limit);
}

export function getRepoGraphInspector(nodeId: string): RepoGraphInspector | null {
    const node = nodeById.get(nodeId);
    if (!node) {
        return null;
    }

    const parentLinks = resolveLinks(incomingLinks.get(nodeId) ?? []);
    const childLinks = resolveLinks(outgoingLinks.get(nodeId) ?? []);

    const nearbyNodes = uniqueNodes(
        parentLinks.flatMap((link) => {
            const siblings = outgoingLinks.get(link.source.id) ?? [];
            return siblings
                .map((siblingLink) => nodeById.get(siblingLink.target))
                .filter((candidate): candidate is RepoGraphNode => candidate !== undefined && candidate.id !== nodeId);
        }),
    ).slice(0, 12);

    const chunkPreviews = (node.chunks ?? [])
        .filter((chunk) => chunk.text.trim().length > 0)
        .slice(0, 3)
        .map((chunk) => ({
            type: chunk.type ?? 'chunk',
            preview: buildChunkPreview(chunk.text),
        }));

    return {
        node,
        parentLinks,
        childLinks,
        nearbyNodes,
        chunkPreviews,
    };
}
