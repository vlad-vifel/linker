export type ImportMode = 'use' | 'merge';

export type MergeSummary = {
    added: number;
    replaced: number;
    skipped: number;
};

export type AddTab = 'create' | 'import';

export type StorageFormHandle = {
    canSubmit: boolean;
    pending: boolean;
    submitText: string;
    submit: () => Promise<void>;
};
