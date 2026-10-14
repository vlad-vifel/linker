import {
    copyFile,
    mkdir,
    readdir,
    readFile,
    rename,
    stat,
    unlink,
    writeFile,
} from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { basename, dirname, join, resolve } from 'node:path';
import type { Plugin } from 'vite';
import { backupStamp, staleBackups } from '../src/core/format/backups.ts';
import { pickPath } from './picker.ts';

const EXTENSION = '.linker.json';
const BACKUP_DIR = 'linker-backups';

type Body = { path?: string; content?: string; stamp?: string; create?: boolean };
type Handler = (body: Body) => Promise<unknown>;

class HttpError extends Error {
    status: number;
    code: string;

    constructor(status: number, code: string) {
        super(code);
        this.status = status;
        this.code = code;
    }
}

function filePath(body: Body) {
    const path = body.path?.trim();
    if (!path) throw new HttpError(400, 'NO_PATH');
    if (!path.toLowerCase().endsWith(EXTENSION)) throw new HttpError(400, 'BAD_EXTENSION');
    return resolve(path);
}

function backupDir(path: string) {
    return join(dirname(path), BACKUP_DIR);
}

function backupPrefix(path: string) {
    return `${basename(path).slice(0, -EXTENSION.length)}-`;
}

async function listBackups(path: string) {
    const prefix = backupPrefix(path);
    const files = await readdir(backupDir(path)).catch(() => []);
    return files
        .flatMap((file) => {
            const stamp = backupStamp(file, prefix, EXTENSION);
            return stamp ? [{ path: join(backupDir(path), file), stamp }] : [];
        })
        .sort((a, b) => b.stamp.localeCompare(a.stamp));
}

async function mtime(path: string) {
    return (await stat(path)).mtimeMs;
}

const handlers: Record<string, Handler> = {
    async read(body) {
        const path = filePath(body);
        return { path, content: await readFile(path, 'utf8'), mtime: await mtime(path) };
    },
    async stat(body) {
        const path = filePath(body);
        return { path, mtime: await mtime(path) };
    },
    async write(body) {
        const path = filePath(body);
        if (typeof body.content !== 'string') throw new HttpError(400, 'NO_CONTENT');
        if (body.create && (await stat(path).catch(() => null))) throw new HttpError(409, 'EXISTS');
        if (!(await stat(dirname(path)).catch(() => null))?.isDirectory()) {
            throw new HttpError(404, 'NO_DIR');
        }
        const tmp = `${path}.tmp`;
        await writeFile(tmp, body.content, 'utf8');
        await rename(tmp, path);
        return { path, mtime: await mtime(path) };
    },
    async backup(body) {
        const path = filePath(body);
        const name = `${backupPrefix(path)}${body.stamp}${EXTENSION}`;
        if (!body.stamp || backupStamp(name, backupPrefix(path), EXTENSION) !== body.stamp) {
            throw new HttpError(400, 'NO_STAMP');
        }
        await mkdir(backupDir(path), { recursive: true });
        await copyFile(path, join(backupDir(path), name));
        const backups = await listBackups(path);
        const stale = staleBackups(backups);
        await Promise.all(stale.map((backup) => unlink(backup.path)));
        return { backups: backups.filter((backup) => !stale.includes(backup)) };
    },
    async snapshot(body) {
        const path = filePath(body);
        const dir = backupDir(path);
        await mkdir(dir, { recursive: true });
        await copyFile(path, join(dir, `${backupPrefix(path)}pre-restore${EXTENSION}`));
        return {};
    },
    async backups(body) {
        return { backups: await listBackups(filePath(body)) };
    },
    async pickFolder() {
        return { path: await pickPath('folder').catch(pickerError) };
    },
    async pickFile() {
        return { path: await pickPath('file').catch(pickerError) };
    },
};

function pickerError(): never {
    throw new HttpError(501, 'NO_PICKER');
}

function readBody(req: IncomingMessage) {
    return new Promise<Body>((resolveBody, reject) => {
        let raw = '';
        req.on('data', (chunk) => (raw += chunk));
        req.on('end', () => {
            try {
                resolveBody(JSON.parse(raw || '{}'));
            } catch {
                reject(new HttpError(400, 'BAD_JSON'));
            }
        });
        req.on('error', reject);
    });
}

function sameOrigin(origin: string | undefined, host: string | undefined) {
    if (!origin) return true;
    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}

function send(res: ServerResponse, status: number, data: unknown) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}

function errorCode(error: unknown) {
    if (error instanceof HttpError) return { status: error.status, code: error.code };
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return { status: 404, code: 'NOT_FOUND' };
    if (code === 'EACCES' || code === 'EPERM') return { status: 403, code: 'NO_ACCESS' };
    return { status: 500, code: 'IO_ERROR' };
}

export function fsApi(): Plugin {
    return {
        name: 'linker-fs-api',
        configureServer(server) {
            server.middlewares.use('/api/fs', async (req, res) => {
                if (req.method !== 'POST' || !sameOrigin(req.headers.origin, req.headers.host)) {
                    return send(res, 403, { code: 'FORBIDDEN' });
                }
                const handler = handlers[req.url?.replace(/^\//, '') ?? ''];
                if (!handler) return send(res, 404, { code: 'NO_ROUTE' });
                try {
                    send(res, 200, await handler(await readBody(req)));
                } catch (error) {
                    const { status, code } = errorCode(error);
                    send(res, status, { code });
                }
            });
        },
    };
}
