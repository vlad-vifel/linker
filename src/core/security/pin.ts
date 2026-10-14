import { LOCKOUT_MS, MAX_ATTEMPTS, PIN_ITERATIONS } from './const';
import type { PinAttempts, PinRecord } from './types';

function toBase64(bytes: Uint8Array) {
    return btoa(String.fromCharCode(...bytes));
}

function fromBase64(text: string) {
    return Uint8Array.from(atob(text), (char) => char.charCodeAt(0));
}

async function derive(pin: string, salt: Uint8Array<ArrayBuffer>, iterations: number) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(pin),
        'PBKDF2',
        false,
        ['deriveBits'],
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
        key,
        256,
    );
    return toBase64(new Uint8Array(bits));
}

export function isPinRecord(value: unknown): value is PinRecord {
    const record = value as PinRecord | null;
    return (
        typeof record?.salt === 'string' &&
        typeof record.hash === 'string' &&
        typeof record.iterations === 'number'
    );
}

export async function createPinRecord(pin: string): Promise<PinRecord> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return {
        salt: toBase64(salt),
        hash: await derive(pin, salt, PIN_ITERATIONS),
        iterations: PIN_ITERATIONS,
    };
}

export async function verifyPin(pin: string, record: PinRecord) {
    return (await derive(pin, fromBase64(record.salt), record.iterations)) === record.hash;
}

export function nextAttempts(attempts: PinAttempts, ok: boolean, now = Date.now()): PinAttempts {
    if (ok) return { failed: 0, until: 0 };
    const failed = attempts.failed + 1;
    return { failed, until: failed % MAX_ATTEMPTS === 0 ? now + LOCKOUT_MS : 0 };
}
