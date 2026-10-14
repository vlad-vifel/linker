const STAMP = /^\d{4}-\d{2}-\d{2}(?:_\d{2}-\d{2})?$/;

export const BACKUP_KEEP_DAYS = 14;

export function backupStamp(file: string, prefix: string, extension: string) {
    if (!file.startsWith(prefix) || !file.endsWith(extension)) return null;
    const stamp = file.slice(prefix.length, -extension.length);
    return STAMP.test(stamp) ? stamp : null;
}

export function stampDay(stamp: string) {
    return stamp.slice(0, 10);
}

export function staleBackups<T extends { stamp: string }>(backups: T[]) {
    const days = [...new Set(backups.map((backup) => stampDay(backup.stamp)))].sort().reverse();
    const kept = new Set(days.slice(0, BACKUP_KEEP_DAYS));
    return backups.filter((backup) => !kept.has(stampDay(backup.stamp)));
}
