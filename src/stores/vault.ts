import { defineStore } from 'pinia';
import { ref, shallowRef, triggerRef } from 'vue';
import { parseStore, serializeStore, type StoreFile, StoreFormatError } from '@/core/format';
import { stampDay } from '@/core/format';
import { errorMessage, localDate, localStamp, storage, StorageError } from '@/core/storage';
import { useStoragesStore } from './storages';

export type VaultStatus = 'empty' | 'loading' | 'ready' | 'error';
export type LoadError = { code: string; message: string };

const SAVE_DELAY = 300;
const CONFLICT_MESSAGE = 'File was changed outside the app';

export const useVaultStore = defineStore('vault', () => {
    const storages = useStoragesStore();
    const data = shallowRef<StoreFile | null>(null);
    const status = ref<VaultStatus>('empty');
    const loadError = ref<LoadError | null>(null);
    const saveError = ref<string | null>(null);
    const conflict = ref(false);
    const saving = ref(false);
    const lastBackup = ref<string | null>(null);
    let loaded: { id: string; path: string } | null = null;
    let mtime = 0;
    let dirty = false;
    let checking = false;
    let openToken = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let chain = Promise.resolve();

    function reset() {
        clearTimeout(timer);
        dirty = false;
        saving.value = false;
        saveError.value = null;
        conflict.value = false;
        loadError.value = null;
    }

    async function open() {
        await save();
        const token = ++openToken;
        const target = storages.active;
        reset();
        loaded = null;
        if (!target) {
            data.value = null;
            status.value = 'empty';
            return;
        }
        status.value = 'loading';
        try {
            const file = await storage.read(target.path);
            const parsed = parseStore(file.content);
            if (token !== openToken) return;
            data.value = parsed;
            loaded = { id: target.id, path: target.path };
            mtime = file.mtime;
            status.value = 'ready';
            storages.update(target.id, { name: parsed.name, count: parsed.links.length });
            const backups = await storage.backups(target.path).catch(() => []);
            if (token === openToken) lastBackup.value = backups[0]?.stamp ?? null;
        } catch (error) {
            if (token !== openToken) return;
            const code =
                error instanceof StorageError || error instanceof StoreFormatError
                    ? error.code
                    : 'IO_ERROR';
            loadError.value = { code, message: errorMessage(error) };
            data.value = null;
            status.value = 'error';
        }
    }

    async function writeNow(force: boolean) {
        const target = loaded;
        const current = data.value;
        if (!dirty || !current || !target) return;
        dirty = false;
        const content = serializeStore(current);
        if (!force) {
            const stat = await storage.stat(target.path).catch(() => null);
            if (stat && stat.mtime > mtime) {
                dirty = true;
                conflict.value = true;
                saveError.value = CONFLICT_MESSAGE;
                saving.value = false;
                return;
            }
        }
        if (!lastBackup.value || stampDay(lastBackup.value) !== localDate()) {
            const stamp = localStamp();
            const backups = await storage.backup(target.path, stamp).catch(() => null);
            if (backups) lastBackup.value = backups[0]?.stamp ?? stamp;
        }
        try {
            mtime = (await storage.write(target.path, content)).mtime;
            saveError.value = null;
            conflict.value = false;
            storages.update(target.id, { name: current.name, count: current.links.length });
        } catch (error) {
            dirty = true;
            saveError.value = errorMessage(error);
        }
        saving.value = dirty && !saveError.value;
    }

    function save(force = false) {
        clearTimeout(timer);
        chain = chain.then(() => writeNow(force));
        return chain;
    }

    async function makeBackup(stamp: string) {
        await save();
        if (saveError.value) throw new Error(`Not saved: ${saveError.value}`);
        if (!loaded) return;
        const backups = await storage.backup(loaded.path, stamp);
        lastBackup.value = backups[0]?.stamp ?? stamp;
    }

    async function discard() {
        reset();
        await chain;
        reset();
    }

    function commit(mutate: (store: StoreFile) => void) {
        if (!data.value) return;
        mutate(data.value);
        triggerRef(data);
        dirty = true;
        saving.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => save(), SAVE_DELAY);
    }

    function replace(store: StoreFile) {
        commit((current) => Object.assign(current, store));
    }

    function hasUnsaved() {
        return dirty;
    }

    async function checkExternalChange() {
        const target = loaded;
        if (status.value !== 'ready' || dirty || checking || !target) return;
        checking = true;
        try {
            if ((await storage.stat(target.path)).mtime > mtime) await open();
        } catch {
            await open();
        } finally {
            checking = false;
        }
    }

    return {
        data,
        status,
        loadError,
        saveError,
        conflict,
        saving,
        lastBackup,
        open,
        save,
        makeBackup,
        discard,
        commit,
        replace,
        hasUnsaved,
        checkExternalChange,
    };
});
