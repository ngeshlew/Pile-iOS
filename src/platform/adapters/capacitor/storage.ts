import { Filesystem, Directory } from '@capacitor/filesystem';
import type { StoragePort } from '../../ports';

const baseDir = Directory.Documents;

export const capStorage: StoragePort = {
  async read(path) {
    const r = await Filesystem.readFile({ path, directory: baseDir, encoding: 'utf8' });
    return r.data as string;
  },
  async write(path, data) {
    await Filesystem.writeFile({ path, data, directory: baseDir, encoding: 'utf8', recursive: true });
  },
  async list(dir) {
    const { files } = await Filesystem.readdir({ path: dir, directory: baseDir });
    return files.map((f) => ({ name: f.name, isDir: f.type === 'directory' }));
  },
  async ensureDir(dir) {
    await Filesystem.mkdir({ path: dir, directory: baseDir, recursive: true });
  },
};
