import {
    createStore,
    FILE_EXTENSION,
    mergeStores,
    parseStore,
    serializeStore,
    type StoreFile,
} from '@/core/format';
import { basename, localStamp, resolveFilePath, storage } from '@/core/storage';
import { downloadText } from '@/lib/download';
import { useStoragesStore } from '@/stores/storages';
import { useVaultStore } from '@/stores/vault';
import type { StorageRef } from '@/types/storage';
import type { InspectedFile } from './types';

export function useStorageActions() {
    const storages = useStoragesStore();
    const vault = useVaultStore();

    function assertNotAdded(path: string, exceptId?: string) {
        const existing = storages.findByPath(path);
        if (existing && existing.id !== exceptId)
            throw new Error(`Already added as "${existing.name}"`);
    }

    function isActive(item: StorageRef) {
        return storages.active?.id === item.id && vault.data !== null;
    }

    async function readStore(item: StorageRef) {
        if (isActive(item)) return vault.data!;
        return parseStore((await storage.read(item.path)).content);
    }

    async function writeStore(item: StorageRef, store: StoreFile) {
        if (isActive(item)) return vault.replace(store);
        await storage.backup(item.path, localStamp()).catch(() => null);
        await storage.write(item.path, serializeStore(store));
        storages.update(item.id, { name: store.name, count: store.links.length });
    }

    async function ensureSaved() {
        await vault.save();
        if (vault.saveError) throw new Error(`Not saved: ${vault.saveError}`);
    }

    async function switchTo(id: string) {
        if (storages.active?.id === id) return;
        await ensureSaved();
        storages.setActive(id);
    }

    async function remove(item: StorageRef) {
        if (isActive(item)) await ensureSaved();
        storages.remove(item.id);
    }

    async function create(name: string, pathInput: string) {
        const path = resolveFilePath(pathInput, name, FILE_EXTENSION);
        assertNotAdded(path);
        await ensureSaved();
        const store = createStore(name.trim());
        const result = await storage.write(path, serializeStore(store), true);
        storages.setActive(storages.add({ name: store.name, path: result.path, count: 0 }).id);
    }

    async function inspect(pathInput: string): Promise<InspectedFile> {
        const file = await storage.read(pathInput.trim());
        return { path: file.path, store: parseStore(file.content) };
    }

    async function useAsStorage(file: InspectedFile, name?: string) {
        assertNotAdded(file.path);
        await ensureSaved();
        let store = file.store;
        if (name?.trim()) {
            store = { ...store, name: name.trim() };
            await storage.write(file.path, serializeStore(store));
        }
        const item = storages.add({ name: store.name, path: file.path, count: store.links.length });
        storages.setActive(item.id);
    }

    async function previewMerge(file: InspectedFile, target: StorageRef) {
        return mergeStores(await readStore(target), file.store);
    }

    async function mergeInto(file: InspectedFile, target: StorageRef) {
        const result = await previewMerge(file, target);
        await writeStore(target, result.store);
        return result;
    }

    async function exportCopy(item: StorageRef) {
        const content = isActive(item)
            ? serializeStore(vault.data!)
            : (await storage.read(item.path)).content;
        await downloadText(content, basename(item.path) || `linker${FILE_EXTENSION}`);
    }

    async function rename(item: StorageRef, name: string) {
        await writeStore(item, { ...(await readStore(item)), name: name.trim() });
        storages.update(item.id, { name: name.trim() });
    }

    async function locate(item: StorageRef, pathInput: string) {
        const file = await inspect(pathInput);
        assertNotAdded(file.path, item.id);
        storages.update(item.id, { path: file.path, name: file.store.name });
        await vault.discard();
        await vault.open();
    }

    async function restore(item: StorageRef, backupPath: string) {
        const content = (await storage.read(backupPath)).content;
        parseStore(content);
        await vault.discard();
        await storage.snapshot(item.path).catch(() => null);
        await storage.write(item.path, content);
        await vault.open();
    }

    return {
        switchTo,
        remove,
        create,
        inspect,
        useAsStorage,
        previewMerge,
        mergeInto,
        exportCopy,
        rename,
        locate,
        restore,
    };
}
