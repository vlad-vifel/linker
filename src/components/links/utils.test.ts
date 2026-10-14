import { describe, expect, it } from 'vitest';
import { type Entry, NO_TAG } from '@/core/format';
import { filterEntries, firstLine, openableUrl } from './utils';

function entry(id: string, patch: Partial<Entry> = {}): Entry {
    return {
        id,
        url: `https://e.com/${id}`,
        note: null,
        tags: [],
        favorite: false,
        createdAt: `2026-01-0${id}T00:00:00Z`,
        updatedAt: `2026-01-0${id}T00:00:00Z`,
        ...patch,
    };
}

const entries = [
    entry('1', { tags: ['a'], note: 'Hello World' }),
    entry('2', { tags: ['a', 'b'], favorite: true }),
    entry('3'),
];
const base = { tags: [], favoritesOnly: false, newestFirst: true, query: '' };
const ids = (items: Entry[]) => items.map((item) => item.id);

describe('filterEntries', () => {
    it('sorts newest first and oldest first', () => {
        expect(ids(filterEntries(entries, base))).toEqual(['3', '2', '1']);
        expect(ids(filterEntries(entries, { ...base, newestFirst: false }))).toEqual([
            '1',
            '2',
            '3',
        ]);
    });

    it('uses AND logic for tags', () => {
        expect(ids(filterEntries(entries, { ...base, tags: ['a', 'b'] }))).toEqual(['2']);
    });

    it('filters entries without tags', () => {
        expect(ids(filterEntries(entries, { ...base, tags: [NO_TAG] }))).toEqual(['3']);
    });

    it('filters favorites', () => {
        expect(ids(filterEntries(entries, { ...base, favoritesOnly: true }))).toEqual(['2']);
    });

    it('searches url and note case-insensitively', () => {
        expect(ids(filterEntries(entries, { ...base, query: 'hello' }))).toEqual(['1']);
        expect(ids(filterEntries(entries, { ...base, query: 'E.COM/3' }))).toEqual(['3']);
    });
});

describe('openableUrl', () => {
    it('returns only http urls', () => {
        expect(openableUrl('https://a.com')).toBe('https://a.com');
        expect(openableUrl('javascript:alert(1)')).toBeNull();
        expect(openableUrl(null)).toBeNull();
    });
});

describe('firstLine', () => {
    it('adds an ellipsis for multiline text', () => {
        expect(firstLine('one\ntwo')).toBe('one…');
        expect(firstLine('one')).toBe('one');
    });
});
