export interface StoragePort {
  read(path: string): Promise<string>;
  write(path: string, data: string): Promise<void>;
  list(dir: string): Promise<{ name: string; isDir: boolean }[]>;
  ensureDir(dir: string): Promise<void>;
}

export interface SecretsPort {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
}

export interface AiPort {
  reflect(prompt: string): Promise<string>;
  chatWithJournal(msg: string): Promise<string>;
}
