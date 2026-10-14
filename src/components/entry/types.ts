import type { EntryDraft } from '@/core/format';

export type EntryFormState = {
    url: string;
    note: string;
    tags: string[];
    favorite: boolean;
};

export type EntrySubmit = {
    draft: EntryDraft;
    replaceId?: string;
};
