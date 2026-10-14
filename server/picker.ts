import { execFile } from 'node:child_process';

const OWNER = `
[Console]::OutputEncoding = [Text.Encoding]::UTF8
Add-Type -AssemblyName System.Windows.Forms
$owner = New-Object Windows.Forms.Form -Property @{ TopMost = $true; ShowInTaskbar = $false; Opacity = 0; StartPosition = 'CenterScreen' }
$owner.Show(); $owner.Activate()
`;

const SCRIPTS = {
    folder: `${OWNER}
$dialog = New-Object Windows.Forms.FolderBrowserDialog -Property @{ Description = 'Folder for the storage file'; ShowNewFolderButton = $true }
if ($dialog.ShowDialog($owner) -eq 'OK') { [Console]::Out.Write($dialog.SelectedPath) }
$owner.Close()`,
    file: `${OWNER}
$dialog = New-Object Windows.Forms.OpenFileDialog -Property @{ Filter = 'Linker storage (*.linker.json)|*.linker.json' }
if ($dialog.ShowDialog($owner) -eq 'OK') { [Console]::Out.Write($dialog.FileName) }
$owner.Close()`,
};

export type PickKind = keyof typeof SCRIPTS;

export function pickPath(kind: PickKind) {
    if (process.platform !== 'win32') return Promise.reject(new Error('NO_PICKER'));
    return new Promise<string | null>((resolvePath, reject) => {
        execFile(
            'powershell.exe',
            ['-NoProfile', '-STA', '-Command', SCRIPTS[kind]],
            { windowsHide: true },
            (error, stdout) => (error ? reject(error) : resolvePath(stdout.trim() || null)),
        );
    });
}
