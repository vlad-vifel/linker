import { describe, expect, it } from 'vitest';
import { backupStamp, staleBackups } from './backups';

const stamps = (days: number) =>
    Array.from({ length: days }, (_, i) => ({
        stamp: `2026-09-${String(i + 1).padStart(2, '0')}_10-00`,
    }));

describe('backupStamp', () => {
    it('reads daily and timed backups', () => {
        expect(backupStamp('main-2026-10-14.linker.json', 'main-', '.linker.json')).toBe(
            '2026-10-14',
        );
        expect(backupStamp('main-2026-10-14_09-30.linker.json', 'main-', '.linker.json')).toBe(
            '2026-10-14_09-30',
        );
    });

    it('ignores foreign files', () => {
        expect(backupStamp('main-pre-restore.linker.json', 'main-', '.linker.json')).toBeNull();
        expect(backupStamp('main-old-2026-10-14.linker.json', 'main-', '.linker.json')).toBeNull();
    });
});

describe('staleBackups', () => {
    it('keeps the last 14 days and drops older ones', () => {
        const stale = staleBackups(stamps(16));
        expect(stale.map((backup) => backup.stamp)).toEqual([
            '2026-09-01_10-00',
            '2026-09-02_10-00',
        ]);
    });

    it('keeps every backup of a kept day', () => {
        const same = Array.from({ length: 20 }, (_, i) => ({
            stamp: `2026-09-01_10-${String(i).padStart(2, '0')}`,
        }));
        expect(staleBackups(same)).toEqual([]);
    });
});
