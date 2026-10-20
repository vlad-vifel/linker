import { Encoding, Filesystem } from '@capacitor/filesystem';
import { backupStamp, FILE_EXTENSION, staleBackups } from '@/core/format';
import { Native } from './native';
import type { BackupInfo, StorageAdapter } from './types';
import { StorageError, backupDir, backupFileName, backupPrefix, dirname, joinPath } from './utils';

function toStorageError(error: unknown): never {
    if (error instanceof StorageError) throw error;
    const text = error instanceof Error ? error.message : String(error);
    if (/not exist|no such|not found/i.test(text)) throw new StorageError('NOT_FOUND');
    if (/permission|denied|not allowed/i.test(text)) throw new StorageError('NO_ACCESS');
    throw new StorageError('IO_ERROR');
}

async function guard<T>(action: () => Promise<T>) {
    try {
        return await action();
    } catch (error) {
        return toStorageError(error);
    }
}

function filePath(path: string) {
    const trimmed = path.trim();
    if (!trimmed.toLowerCase().endsWith(FILE_EXTENSION)) throw new StorageError('BAD_EXTENSION');
    return trimmed;
}

const statOrNull = (path: string) => Filesystem.stat({ path }).catch(() => null);

async function listBackups(path: string): Promise<BackupInfo[]> {
    const dir = backupDir(path);
    const prefix = backupPrefix(path, FILE_EXTENSION);
    const { files } = await Filesystem.readdir({ path: dir }).catch(() => ({ files: [] }));
    return files
        .flatMap(({ name }) => {
            const stamp = backupStamp(name, prefix, FILE_EXTENSION);
            return stamp ? [{ path: joinPath(dir, name), stamp }] : [];
        })
        .sort((a, b) => b.stamp.localeCompare(a.stamp));
}

async function copyReplacing(from: string, to: string) {
    const tmp = `${to}.tmp`;
    await Filesystem.deleteFile({ path: tmp }).catch(() => null);
    await Filesystem.copy({ from, to: tmp });
    await Filesystem.rename({ from: tmp, to });
}

async function pick(action: () => Promise<{ path: string | null }>) {
    try {
        return (await action()).path;
    } catch {
        throw new StorageError('BAD_LOCATION');
    }
}

export const androidAdapter: StorageAdapter = {
    read: (path) =>
        guard(async () => {
            const target = filePath(path);
            const [{ data }, { mtime }] = await Promise.all([
                Filesystem.readFile({ path: target, encoding: Encoding.UTF8 }),
                Filesystem.stat({ path: target }),
            ]);
            return { path: target, content: String(data), mtime };
        }),
    stat: (path) =>
        guard(async () => {
            const target = filePath(path);
            return { path: target, mtime: (await Filesystem.stat({ path: target })).mtime };
        }),
    write: (path, content, create) =>
        guard(async () => {
            const target = filePath(path);
            if (create && (await statOrNull(target))) throw new StorageError('EXISTS');
            if ((await statOrNull(dirname(target)))?.type !== 'directory') {
                throw new StorageError('NO_DIR');
            }
            const tmp = `${target}.tmp`;
            await Filesystem.writeFile({ path: tmp, data: content, encoding: Encoding.UTF8 });
            await Filesystem.rename({ from: tmp, to: target });
            return { path: target, mtime: (await Filesystem.stat({ path: target })).mtime };
        }),
    backup: (path, stamp) =>
        guard(async () => {
            const target = filePath(path);
            const copy = joinPath(backupDir(target), backupFileName(target, FILE_EXTENSION, stamp));
            await Filesystem.mkdir({ path: backupDir(target), recursive: true }).catch(() => null);
            await copyReplacing(target, copy);
            const backups = await listBackups(target);
            const stale = staleBackups(backups);
            await Promise.all(stale.map((item) => Filesystem.deleteFile({ path: item.path })));
            return backups.filter((item) => !stale.includes(item));
        }),
    backups: (path) => guard(() => listBackups(filePath(path))),
    snapshot: (path) =>
        guard(async () => {
            const target = filePath(path);
            await Filesystem.mkdir({ path: backupDir(target), recursive: true }).catch(() => null);
            await copyReplacing(
                target,
                joinPath(
                    backupDir(target),
                    `${backupPrefix(target, FILE_EXTENSION)}pre-restore${FILE_EXTENSION}`,
                ),
            );
        }),
    pickFolder: () => pick(() => Native.pickFolder()),
    pickFile: () => pick(() => Native.pickFile()),
};
