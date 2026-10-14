import type { BackupInfo, FileContent, FileStat, StorageAdapter, StorageErrorCode } from './types';
import { StorageError } from './utils';

async function call<T>(route: string, body: object): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`/api/fs/${route}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch {
        throw new StorageError('NO_SERVER');
    }
    const data = await response.json().catch(() => null);
    if (!response.ok || !data)
        throw new StorageError((data?.code ?? 'NO_SERVER') as StorageErrorCode);
    return data as T;
}

export const localServerAdapter: StorageAdapter = {
    read: (path) => call<FileContent>('read', { path }),
    stat: (path) => call<FileStat>('stat', { path }),
    write: (path, content, create) => call<FileStat>('write', { path, content, create }),
    backup: async (path, date) =>
        (await call<{ backups: BackupInfo[] }>('backup', { path, date })).backups,
    backups: async (path) => (await call<{ backups: BackupInfo[] }>('backups', { path })).backups,
    snapshot: async (path) => {
        await call('snapshot', { path });
    },
    pickFolder: async () => (await call<{ path: string | null }>('pickFolder', {})).path,
    pickFile: async () => (await call<{ path: string | null }>('pickFile', {})).path,
};
