import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { createStore } from '@/core/format';
import { useEntriesStore } from './entries';
import { useTagsStore } from './tags';
import { useVaultStore } from './vault';

const NOW = '2026-10-14T00:00:00Z';

beforeEach(() => {
    setActivePinia(createPinia());
    const vault = useVaultStore();
    vault.data = {
        ...createStore('t'),
        tags: { a: { label: null }, b: { label: null } },
        links: [
            {
                id: '1',
                url: 'https://e.com/1',
                note: null,
                tags: ['a'],
                favorite: false,
                createdAt: NOW,
                updatedAt: NOW,
            },
            {
                id: '2',
                url: 'https://e.com/2',
                note: null,
                tags: ['b'],
                favorite: false,
                createdAt: NOW,
                updatedAt: NOW,
            },
        ],
    };
});

const counts = () => Object.fromEntries(useTagsStore().options.map((o) => [o.key, o.count]));

describe('tag counts', () => {
    it('update after merge', () => {
        const tags = useTagsStore();
        expect(counts()).toEqual({ a: 1, b: 1 });
        tags.rename('a', 'b');
        expect(counts()).toEqual({ b: 2 });
    });

    it('update after add', () => {
        const entries = useEntriesStore();
        expect(counts()).toEqual({ a: 1, b: 1 });
        entries.add({ url: 'https://e.com/3', note: null, tags: ['a'], favorite: false });
        expect(counts()).toEqual({ a: 2, b: 1 });
    });
});
