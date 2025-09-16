import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export class CapacitorStorageAdapter {
  private readonly baseDir: Directory = Directory.Data;

  async readText(path: string): Promise<string> {
    const res = await Filesystem.readFile({ path, directory: this.baseDir, encoding: Encoding.UTF8 });
    return res.data as string;
  }

  async writeText(path: string, data: string): Promise<void> {
    await Filesystem.writeFile({ path, directory: this.baseDir, data, encoding: Encoding.UTF8, recursive: true });
  }

  async remove(path: string): Promise<void> {
    try {
      await Filesystem.deleteFile({ path, directory: this.baseDir });
    } catch {
      try {
        await Filesystem.rmdir({ path, directory: this.baseDir, recursive: true });
      } catch {}
    }
  }
}

export const storage = new CapacitorStorageAdapter();

