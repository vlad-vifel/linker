import { NO_TAG } from '@/core/format';
import type { TagOption } from '@/types/tags';

export function matchTags(options: TagOption[], search: string) {
    const query = search.trim().toLowerCase().replace(/^#/, '');
    if (!query) return options;
    return options.filter(
        (option) => option.key.includes(query) || option.label?.toLowerCase().includes(query),
    );
}

export function selectedFirst(options: TagOption[], selected: string[]) {
    const chosen = options.filter((option) => selected.includes(option.key));
    return [...chosen, ...options.filter((option) => !selected.includes(option.key))];
}

export function toggleTag(selected: string[], key: string) {
    if (selected.includes(key)) return selected.filter((tag) => tag !== key);
    if (key === NO_TAG) return [NO_TAG];
    return [...selected.filter((tag) => tag !== NO_TAG), key];
}
