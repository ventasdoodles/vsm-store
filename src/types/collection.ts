// ─── TYPE DEFINITION: Collection ───
// Arquitectura: Data Model
// Proposito principal: Definición de colecciones transversales.

export interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
    created_at: string;
}

export type CollectionInsert = Omit<Collection, 'id' | 'created_at'>;
export type CollectionUpdate = Partial<CollectionInsert>;
