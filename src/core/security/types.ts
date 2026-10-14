export type PinRecord = { salt: string; hash: string; iterations: number };

export type PinAttempts = { failed: number; until: number };
