export type StorageErrorCode =
    | 'NOT_FOUND'
    | 'NO_ACCESS'
    | 'NO_DIR'
    | 'EXISTS'
    | 'BAD_EXTENSION'
    | 'NO_SERVER'
    | 'NO_PICKER'
    | 'BAD_LOCATION'
    | 'IO_ERROR';

export type FileContent = {
    path: string;
    content: string;
    mtime: number;
};

export type FileStat = {
    path: string;
    mtime: number;
};

export type BackupInfo = {
    path: string;
    stamp: string;
};

export type StorageAdapter = {
    read(path: string): Promise<FileContent>;
    stat(path: string): Promise<FileStat>;
    write(path: string, content: string, create?: boolean): Promise<FileStat>;
    backup(path: string, stamp: string): Promise<BackupInfo[]>;
    backups(path: string): Promise<BackupInfo[]>;
    snapshot(path: string): Promise<void>;
    pickFolder(): Promise<string | null>;
    pickFile(): Promise<string | null>;
};
