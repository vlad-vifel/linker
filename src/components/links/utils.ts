import { type Entry, isWebUrl, NO_TAG } from '@/core/format';
import { Native, IS_NATIVE } from '@/core/storage';
import { SCROLL_TIMEOUT } from './const';
import type { FeedFilters } from './types';

export function filterEntries(entries: Entry[], filters: FeedFilters) {
    const query = filters.query.trim().toLowerCase();
    const noTag = filters.tags.includes(NO_TAG);
    const result = entries.filter((entry) => {
        if (filters.favoritesOnly && !entry.favorite) return false;
        if (noTag && entry.tags.length) return false;
        if (!noTag && !filters.tags.every((tag) => entry.tags.includes(tag))) return false;
        if (!query) return true;
        return (
            entry.url?.toLowerCase().includes(query) || entry.note?.toLowerCase().includes(query)
        );
    });
    const direction = filters.newestFirst ? -1 : 1;
    return result.sort((a, b) => direction * a.createdAt.localeCompare(b.createdAt));
}

export function pickRandom(entries: Entry[], exceptId: string | null) {
    const pool = entries.length > 1 ? entries.filter((entry) => entry.id !== exceptId) : entries;
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

export function scrollToCenter(scroller: HTMLElement, target: HTMLElement) {
    const area = scroller.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const wanted = scroller.scrollTop + rect.top + rect.height / 2 - area.top - area.height / 2;
    const top = Math.min(Math.max(wanted, 0), scroller.scrollHeight - scroller.clientHeight);
    if (Math.abs(top - scroller.scrollTop) < 2) return Promise.resolve();
    return new Promise<void>((resolve) => {
        const done = () => {
            scroller.removeEventListener('scrollend', done);
            clearTimeout(timer);
            resolve();
        };
        const timer = setTimeout(done, SCROLL_TIMEOUT);
        scroller.addEventListener('scrollend', done);
        scroller.scrollTo({ top, behavior: 'smooth' });
    });
}

export function displayUrl(url: string) {
    try {
        const parsed = new URL(url);
        if (!parsed.host) return { host: url, path: '' };
        const path = decodeURI(parsed.pathname + parsed.search).replace(/\/$/, '');
        return { host: parsed.host.replace(/^www\./, ''), path };
    } catch {
        return { host: url, path: '' };
    }
}

export function openableUrl(url: string | null) {
    return url && isWebUrl(url) ? url : null;
}

export function firstLine(text: string) {
    const [line, ...rest] = text.split('\n');
    return rest.length ? `${line}…` : line;
}

export function openLink(url: string) {
    if (IS_NATIVE) Native.openUrl({ url });
    else window.open(url, '_blank', 'noopener,noreferrer');
}
