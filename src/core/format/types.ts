export type Entry = {
    id: string;
    url: string | null;
    note: string | null;
    tags: string[];
    favorite: boolean;
    createdAt: string;
    updatedAt: string;
};

export type TagMeta = {
    label: string | null;
};

export type Preset = {
    id: string;
    name: string | null;
    tags: string[];
    favorite: boolean;
};

export type StoreFile = {
    format: 'linker';
    version: number;
    name: string;
    createdAt: string;
    tags: Record<string, TagMeta>;
    noTagLabel?: string | null;
    links: Entry[];
    presets: Preset[];
};

export type EntryDraft = Pick<Entry, 'url' | 'note' | 'tags' | 'favorite'>;

export type PresetDraft = Pick<Preset, 'name' | 'tags' | 'favorite'>;

export type PresetError = { kind: 'empty' | 'name' | 'combo'; existing?: Preset };
