import { describe, expect, it } from 'vitest';
import { LOCKOUT_MS, MAX_ATTEMPTS } from './const';
import { createPinRecord, nextAttempts, verifyPin } from './pin';

describe('pin', () => {
    it('verifies only the same pin', async () => {
        const record = await createPinRecord('1234');
        expect(record.hash).not.toContain('1234');
        expect(await verifyPin('1234', record)).toBe(true);
        expect(await verifyPin('4321', record)).toBe(false);
    });

    it('uses a fresh salt every time', async () => {
        const [a, b] = await Promise.all([createPinRecord('1234'), createPinRecord('1234')]);
        expect(a.salt).not.toBe(b.salt);
        expect(a.hash).not.toBe(b.hash);
    });

    it('locks out after too many wrong attempts', () => {
        let attempts = { failed: 0, until: 0 };
        for (let i = 1; i < MAX_ATTEMPTS; i++) attempts = nextAttempts(attempts, false, 1000);
        expect(attempts.until).toBe(0);
        attempts = nextAttempts(attempts, false, 1000);
        expect(attempts.until).toBe(1000 + LOCKOUT_MS);
        expect(nextAttempts(attempts, true)).toEqual({ failed: 0, until: 0 });
    });
});
