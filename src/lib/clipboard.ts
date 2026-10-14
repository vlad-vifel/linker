import { IS_NATIVE, Native } from '@/core/storage';

export async function readClipboard() {
    if (IS_NATIVE) return (await Native.readClipboard()).text;
    return navigator.clipboard.readText();
}

export async function writeClipboard(text: string) {
    if (IS_NATIVE) await Native.writeClipboard({ text });
    else await navigator.clipboard.writeText(text);
}
