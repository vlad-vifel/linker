import { createPinia, setActivePinia } from 'pinia';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createStore, serializeStore } from '@/core/format';
import { useStoragesStore } from './storages';
import { useVaultStore } from './vault';

const storage = vi.hoisted(() => ({
    read: vi.fn(),
    stat: vi.fn(),
    write: vi.fn(),
    backup: vi.fn(),
    backups: vi.fn(),
}));

vi.mock('@/core/storage', async (original) => ({
    ...(await original<typeof import('@/core/storage')>()),
    storage,
}));

const PATH = '/data/main.linker.json';

async function openVault(content = serializeStore(createStore('main'))) {
    storage.read.mockResolvedValue({ path: PATH, content, mtime: 100 });
    useStoragesStore().add({ name: 'main', path: PATH, count: null });
    const vault = useVaultStore();
    await vault.open();
    return vault;
}

function addTag(vault: ReturnType<typeof useVaultStore>, key = 'a') {
    vault.commit((store) => {
        store.tags[key] = { label: null };
    });
}

async function flush(vault: ReturnType<typeof useVaultStore>) {
    await vi.advanceTimersByTimeAsync(300);
    await vault.save();
}

beforeEach(() => {
    setActivePinia(createPinia());
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
    vi.setSystemTime(new Date(2026, 9, 20, 12, 0));
    vi.resetAllMocks();
    storage.stat.mockResolvedValue({ path: PATH, mtime: 100 });
    storage.write.mockResolvedValue({ path: PATH, mtime: 200 });
    storage.backup.mockImplementation(async (_path: string, stamp: string) => [
        { path: 'b', stamp },
    ]);
    storage.backups.mockResolvedValue([]);
});

afterEach(() => vi.useRealTimers());

describe('vault', () => {
    it('saves debounced after commit', async () => {
        const vault = await openVault();
        addTag(vault);
        addTag(vault, 'b');
        await vi.advanceTimersByTimeAsync(299);
        expect(storage.write).not.toHaveBeenCalled();
        await flush(vault);
        expect(storage.write).toHaveBeenCalledTimes(1);
        expect(JSON.parse(storage.write.mock.calls[0][1]).tags).toEqual({
            a: { label: null },
            b: { label: null },
        });
        expect(vault.hasUnsaved()).toBe(false);
        expect(vault.saving).toBe(false);
    });

    it('keeps changes on save error and retries', async () => {
        const vault = await openVault();
        storage.write.mockRejectedValueOnce(new Error('disk full'));
        addTag(vault);
        await vault.save();
        expect(vault.hasUnsaved()).toBe(true);
        expect(vault.saveError).toBeTruthy();
        expect(vault.data?.tags).toHaveProperty('a');
        await vault.save();
        expect(storage.write).toHaveBeenCalledTimes(2);
        expect(vault.saveError).toBeNull();
        expect(vault.hasUnsaved()).toBe(false);
    });

    it('detects conflict when file is newer and overwrites on force', async () => {
        const vault = await openVault();
        storage.stat.mockResolvedValue({ path: PATH, mtime: 150 });
        addTag(vault);
        await flush(vault);
        expect(vault.conflict).toBe(true);
        expect(vault.hasUnsaved()).toBe(true);
        expect(storage.write).not.toHaveBeenCalled();
        await vault.save(true);
        expect(storage.write).toHaveBeenCalledTimes(1);
        expect(vault.conflict).toBe(false);
        expect(vault.saveError).toBeNull();
    });

    it('makes one auto backup per day', async () => {
        const vault = await openVault();
        addTag(vault);
        await flush(vault);
        addTag(vault, 'b');
        await flush(vault);
        expect(storage.write).toHaveBeenCalledTimes(2);
        expect(storage.backup).toHaveBeenCalledTimes(1);
        expect(storage.backup).toHaveBeenCalledWith(PATH, '2026-10-20_12-00');
        expect(storage.backup.mock.invocationCallOrder[0]).toBeLessThan(
            storage.write.mock.invocationCallOrder[0],
        );
    });

    it('opens a broken file as error and never writes', async () => {
        const vault = await openVault('{ broken');
        expect(vault.status).toBe('error');
        expect(vault.loadError).toBeTruthy();
        expect(vault.data).toBeNull();
        addTag(vault);
        await flush(vault);
        expect(storage.write).not.toHaveBeenCalled();
        expect(storage.backup).not.toHaveBeenCalled();
    });
});
