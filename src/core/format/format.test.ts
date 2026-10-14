import { describe, expect, it } from 'vitest';
import type { Entry } from './types';
import {
    createStore,
    deleteTag,
    deleteUntagged,
    isWebUrl,
    mergeStores,
    normalizeUrlInput,
    parseStore,
    presetError,
    renameTag,
    urlKey,
} from '.';

const NOW = '2026-10-14T00:00:00Z';

function entry(id: string, tags: string[]): Entry {
    return {
        id,
        url: `https://e.com/${id}`,
        note: null,
        tags,
        favorite: false,
        createdAt: NOW,
        updatedAt: NOW,
    };
}

function store() {
    return {
        ...createStore('t'),
        tags: { a: { label: 'Alpha' }, b: { label: null }, c: { label: null } },
        links: [entry('1', ['a']), entry('2', ['a', 'b']), entry('3', ['c'])],
    };
}

describe('renameTag', () => {
    it('renames key and keeps label', () => {
        const result = renameTag(store(), 'a', 'x', 'later');
        expect(result.tags).toEqual({
            x: { label: 'Alpha' },
            b: { label: null },
            c: { label: null },
        });
        expect(result.links[0]).toMatchObject({ tags: ['x'], updatedAt: 'later' });
        expect(result.links[2].updatedAt).toBe(NOW);
    });

    it('merges into an existing key without duplicates', () => {
        const result = renameTag(store(), 'b', 'a');
        expect(Object.keys(result.tags)).toEqual(['a', 'c']);
        expect(result.tags.a.label).toBe('Alpha');
        expect(result.links[1].tags).toEqual(['a']);
    });

    it('takes source label when target has none', () => {
        expect(renameTag(store(), 'a', 'c').tags.c.label).toBe('Alpha');
    });
});

describe('deleteTag', () => {
    it('removes tag from entries', () => {
        const result = deleteTag(store(), 'a', false);
        expect(result.tags.a).toBeUndefined();
        expect(result.links.map((item) => item.tags)).toEqual([[], ['b'], ['c']]);
    });

    it('removes entries with the tag', () => {
        expect(deleteTag(store(), 'a', true).links.map((item) => item.id)).toEqual(['3']);
    });
});

describe('deleteUntagged', () => {
    it('removes entries without tags and resets the label', () => {
        const result = deleteUntagged({ ...store(), noTagLabel: 'none' });
        expect(result.links.every((item) => item.tags.length > 0)).toBe(true);
        expect(result.noTagLabel).toBeNull();
    });
});

describe('normalizeUrlInput', () => {
    it('adds https when there is no scheme', () => {
        expect(normalizeUrlInput('  example.com/a ')).toBe('https://example.com/a');
        expect(normalizeUrlInput('localhost:3000')).toBe('https://localhost:3000');
        expect(normalizeUrlInput('example.com:8080/x')).toBe('https://example.com:8080/x');
    });

    it('keeps explicit schemes', () => {
        expect(normalizeUrlInput('http://a.com')).toBe('http://a.com');
        expect(normalizeUrlInput('mailto:a@b.com')).toBe('mailto:a@b.com');
        expect(normalizeUrlInput('tg://resolve?domain=x')).toBe('tg://resolve?domain=x');
    });

    it('returns empty for blank input', () => {
        expect(normalizeUrlInput('   ')).toBe('');
    });
});

describe('isWebUrl', () => {
    it('accepts only http and https', () => {
        expect(isWebUrl('https://a.com')).toBe(true);
        expect(isWebUrl('HTTP://a.com')).toBe(true);
        expect(isWebUrl('javascript:alert(1)')).toBe(false);
        expect(isWebUrl('mailto:a@b.com')).toBe(false);
    });
});

describe('urlKey', () => {
    it('ignores scheme, www, trailing slash and host case', () => {
        expect(urlKey('http://WWW.Example.com/')).toBe(urlKey('https://example.com'));
    });

    it('keeps path case and query', () => {
        expect(urlKey('https://a.com/Path?x=1')).toBe('a.com/Path?x=1');
    });
});

describe('parseStore', () => {
    const base = {
        format: 'linker',
        version: 1,
        name: 'n',
        createdAt: NOW,
        tags: {},
        links: [] as unknown[],
    };

    it('rejects broken json and foreign files', () => {
        expect(() => parseStore('{')).toThrow('not valid JSON');
        expect(() => parseStore('{"format":"x","version":1}')).toThrow('Not a Linker file');
    });

    it('refuses newer versions', () => {
        expect(() => parseStore(JSON.stringify({ ...base, version: 99 }))).toThrow(
            'Update the app',
        );
    });

    it('adds tags used by entries and repairs tag meta', () => {
        const store = parseStore(
            JSON.stringify({ ...base, tags: { a: null }, links: [entry('1', ['a', 'b'])] }),
        );
        expect(store.tags).toEqual({ a: { label: null }, b: { label: null } });
    });

    it('makes duplicate ids unique', () => {
        const store = parseStore(
            JSON.stringify({ ...base, links: [entry('1', []), entry('1', [])] }),
        );
        expect(new Set(store.links.map((item) => item.id)).size).toBe(2);
    });
});

describe('mergeStores', () => {
    it('adds new, replaces older, skips newer-or-equal', () => {
        const target = { ...createStore('t'), links: [entry('a', []), entry('b', [])] };
        const later = { ...entry('a', ['n']), updatedAt: 'z' };
        const source = {
            ...createStore('s'),
            tags: { n: { label: 'New' } },
            links: [later, entry('b', []), entry('c', [])],
        };
        const result = mergeStores(target, source);
        expect(result).toMatchObject({ added: 1, replaced: 1, skipped: 1 });
        expect(result.store.links).toHaveLength(3);
        expect(result.store.tags.n).toEqual({ label: 'New' });
    });

    it('keeps ids unique when the same id has another url', () => {
        const target = { ...createStore('t'), links: [entry('a', [])] };
        const moved = { ...entry('a', []), url: 'https://e.com/other' };
        const { store } = mergeStores(target, { ...createStore('s'), links: [moved] });
        expect(store.links).toHaveLength(2);
        expect(new Set(store.links.map((item) => item.id)).size).toBe(2);
    });

    it('replaces text-only entries by id when newer', () => {
        const text = { ...entry('t', []), url: null, note: 'old' };
        const target = { ...createStore('t'), links: [text] };
        const newer = { ...text, note: 'new', updatedAt: 'z' };
        const result = mergeStores(target, { ...createStore('s'), links: [newer] });
        expect(result).toMatchObject({ added: 0, replaced: 1, skipped: 0 });
        expect(result.store.links.map((item) => item.note)).toEqual(['new']);
    });
});

const preset = (id: string, tags: string[], favorite = false, name: string | null = null) => ({
    id,
    name,
    tags,
    favorite,
});

describe('presets', () => {
    it('validates emptiness, combo and name uniqueness', () => {
        const list = [preset('1', ['a', 'b'], false, 'Work')];
        expect(presetError({ name: null, tags: [], favorite: false }, list)?.kind).toBe('empty');
        expect(presetError({ name: null, tags: ['b', 'a'], favorite: false }, list)?.kind).toBe(
            'combo',
        );
        expect(presetError({ name: ' work ', tags: ['a'], favorite: false }, list)?.kind).toBe(
            'name',
        );
        expect(presetError({ name: null, tags: ['a'], favorite: true }, list)).toBeNull();
        expect(
            presetError({ name: 'Work', tags: ['a', 'b'], favorite: false }, list, '1'),
        ).toBeNull();
    });

    it('migrates v1 files to empty presets', () => {
        const store = parseStore(
            JSON.stringify({
                format: 'linker',
                version: 1,
                name: 'n',
                createdAt: NOW,
                tags: {},
                links: [],
            }),
        );
        expect(store).toMatchObject({ version: 2, presets: [] });
    });

    it('rename merges, delete drops emptied presets', () => {
        const base = {
            ...createStore('t'),
            tags: { a: { label: null }, b: { label: null } },
            presets: [preset('1', ['a']), preset('2', ['b']), preset('3', ['a'], true)],
        };
        expect(renameTag(base, 'a', 'b').presets.map((item) => item.id)).toEqual(['1', '3']);
        expect(deleteTag(base, 'a', false).presets.map((item) => item.id)).toEqual(['2', '3']);
    });

    it('merge skips presets with same name or combo', () => {
        const target = { ...createStore('t'), presets: [preset('1', ['a'], false, 'X')] };
        const source = {
            ...createStore('s'),
            presets: [preset('2', ['b'], false, 'x'), preset('3', ['a']), preset('4', ['c'])],
        };
        const { store } = mergeStores(target, source);
        expect(store.presets.map((item) => item.id)).toEqual(['1', '4']);
        expect(store.tags.c).toEqual({ label: null });
    });
});
