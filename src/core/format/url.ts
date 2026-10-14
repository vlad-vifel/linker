import { URL_SCHEME } from './const';

export function normalizeUrlInput(raw: string) {
    const url = raw.trim();
    if (!url) return '';
    return URL_SCHEME.test(url) ? url : `https://${url}`;
}

export function isWebUrl(url: string) {
    return /^https?:\/\//i.test(url);
}

export function urlKey(url: string) {
    const stripped = url
        .trim()
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .replace(/\/+$/, '');
    const slash = stripped.search(/[/?#]/);
    if (slash === -1) return stripped.toLowerCase();
    return stripped.slice(0, slash).toLowerCase() + stripped.slice(slash);
}
