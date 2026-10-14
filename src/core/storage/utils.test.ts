import { describe, expect, it } from 'vitest';
import { resolveFilePath, samePath, slugify } from './utils';

describe('slugify', () => {
    it('lowercases and joins words', () => {
        expect(slugify(' My Links! ')).toBe('my-links');
        expect(slugify('Ссылки 2')).toBe('ссылки-2');
        expect(slugify('***')).toBe('linker');
    });
});

describe('resolveFilePath', () => {
    it('appends the file name to a folder', () => {
        expect(resolveFilePath('C:\\data\\', 'Main', '.linker.json')).toBe(
            'C:\\data\\main.linker.json',
        );
        expect(resolveFilePath('/home/a', 'Main', '.linker.json')).toBe('/home/a/main.linker.json');
    });

    it('keeps a full file path', () => {
        expect(resolveFilePath('D:\\x\\a.linker.json', 'Main', '.linker.json')).toBe(
            'D:\\x\\a.linker.json',
        );
    });
});

describe('samePath', () => {
    it('ignores slash style and case', () => {
        expect(samePath('C:\\Data\\a.linker.json', 'c:/data/A.linker.json')).toBe(true);
        expect(samePath('C:\\a', 'C:\\b')).toBe(false);
    });
});
