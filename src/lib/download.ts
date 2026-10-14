import { Encoding, Filesystem } from '@capacitor/filesystem';
import { toast } from 'vue-sonner';
import { DOWNLOADS_DIR, IS_NATIVE, joinPath } from '@/core/storage';

const REVOKE_DELAY = 1000;

export async function downloadText(content: string, filename: string) {
    if (IS_NATIVE) {
        await Filesystem.writeFile({
            path: joinPath(DOWNLOADS_DIR, filename),
            data: content,
            encoding: Encoding.UTF8,
        });
        toast.success(`Saved to Download/${filename}`);
        return;
    }
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY);
}
