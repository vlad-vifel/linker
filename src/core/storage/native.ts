import { registerPlugin } from '@capacitor/core';

export const Native = registerPlugin<{
    check(): Promise<{ granted: boolean }>;
    request(): Promise<void>;
    openUrl(options: { url: string }): Promise<void>;
    readClipboard(): Promise<{ text: string }>;
    writeClipboard(options: { text: string }): Promise<void>;
    pickFolder(): Promise<{ path: string | null }>;
    pickFile(): Promise<{ path: string | null }>;
}>('Native');
