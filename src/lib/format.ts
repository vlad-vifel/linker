export function formatDate(iso: string) {
    const date = new Date(iso);
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${String(date.getFullYear()).slice(2)}`;
}

export function formatDateTime(iso: string) {
    const date = new Date(iso);
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return `${formatDate(iso)}, ${time}`;
}

export function pluralize(count: number, one: string, many: string) {
    return `${count.toLocaleString('en-US')} ${count === 1 ? one : many}`;
}

export function formatCount(count: number) {
    return pluralize(count, 'entry', 'entries');
}
