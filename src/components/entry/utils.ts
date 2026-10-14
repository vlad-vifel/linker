import { type Entry, normalizeUrlInput } from '@/core/format';
import type { EntryDraft } from '@/core/format';
import type { EntryFormState } from './types';

export function emptyForm(): EntryFormState {
    return { url: '', note: '', tags: [], favorite: false };
}

export function formFromEntry(entry: Entry): EntryFormState {
    return {
        url: entry.url ?? '',
        note: entry.note ?? '',
        tags: [...entry.tags],
        favorite: entry.favorite,
    };
}

export function draftFromForm(form: EntryFormState): EntryDraft {
    return {
        url: normalizeUrlInput(form.url) || null,
        note: form.note.trim() || null,
        tags: form.tags,
        favorite: form.favorite,
    };
}
