import type { AddTab, ImportMode } from './types';

export const IMPORT_MODES: { value: ImportMode; label: string }[] = [
    { value: 'use', label: 'Use as storage' },
    { value: 'merge', label: 'Merge into' },
];

export const ADD_TABS: { value: AddTab; label: string }[] = [
    { value: 'create', label: 'Create new' },
    { value: 'import', label: 'Import file' },
];

export const INSPECT_DELAY = 300;
