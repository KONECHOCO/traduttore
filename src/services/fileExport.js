// Salvataggio/condivisione file: nel browser si scarica, nell'app (dove i download della WebView
// non funzionano) si scrive nella cache e si apre il foglio di condivisione di sistema.
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export async function exportTextFile(filename, content, mime = 'text/plain') {
  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });
    await Share.share({ title: filename, files: [uri] });
    return;
  }
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeFileName(name) {
  return name.replace(/[^\p{L}\p{N}._-]+/gu, '_').slice(0, 80);
}
