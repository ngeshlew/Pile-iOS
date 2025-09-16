import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

export type JournalPost = {
  id: string;
  title?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
};

const INDEX_KEY = 'posts-index';
const STORAGE_VERSION_KEY = 'storage-version';
const CURRENT_VERSION = 1;

async function generateId(): Promise<string> {
  try {
    const randomComponent = Math.random().toString(36).slice(2);
    const timeComponent = Date.now().toString(36);
    return `${timeComponent}-${randomComponent}`;
  } catch {
    return `${Date.now()}-${Math.random()}`;
  }
}

async function readIndex(): Promise<string[]> {
  const indexRaw = await AsyncStorage.getItem(INDEX_KEY);
  return indexRaw ? JSON.parse(indexRaw) : [];
}

async function writeIndex(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(ids));
}

export const Storage = {
  async ensureInitialized(): Promise<void> {
    const versionRaw = await AsyncStorage.getItem(STORAGE_VERSION_KEY);
    const version = versionRaw ? Number(versionRaw) : 0;
    if (!version) {
      // Fresh install: set version and empty index
      await AsyncStorage.multiSet([
        [STORAGE_VERSION_KEY, String(CURRENT_VERSION)],
        [INDEX_KEY, JSON.stringify([])],
      ]);
      return;
    }
    if (version < CURRENT_VERSION) {
      // Future migrations can be added here
      // Example: if (version < 2) { await migrateToV2(); }
      await AsyncStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
    }
  },

  async getAllPosts(): Promise<JournalPost[]> {
    const ids = await readIndex();
    const posts = await Promise.all(
      ids.map(async (id) => {
        const raw = await AsyncStorage.getItem(`post:${id}`);
        return raw ? (JSON.parse(raw) as JournalPost) : null;
      })
    );
    return posts.filter(Boolean) as JournalPost[];
  },

  async getPost(id: string): Promise<JournalPost | null> {
    const raw = await AsyncStorage.getItem(`post:${id}`);
    return raw ? (JSON.parse(raw) as JournalPost) : null;
  },

  async createPost(input: { title?: string; content: string }): Promise<JournalPost> {
    const id = await generateId();
    const post: JournalPost = {
      id,
      title: input.title,
      content: input.content,
      createdAt: Date.now(),
    };
    const ids = await readIndex();
    ids.push(id);
    await AsyncStorage.multiSet([
      [INDEX_KEY, JSON.stringify(ids)],
      [`post:${id}`, JSON.stringify(post)],
    ]);
    return post;
  },

  async updatePost(id: string, update: Partial<Pick<JournalPost, 'title' | 'content'>>): Promise<JournalPost | null> {
    const raw = await AsyncStorage.getItem(`post:${id}`);
    if (!raw) return null;
    const prev = JSON.parse(raw) as JournalPost;
    const next: JournalPost = { ...prev, ...update, updatedAt: Date.now() };
    await AsyncStorage.setItem(`post:${id}`, JSON.stringify(next));
    return next;
  },

  async deletePost(id: string): Promise<void> {
    const ids = await readIndex();
    const nextIds = ids.filter((x) => x !== id);
    await AsyncStorage.multiRemove([`post:${id}`]);
    await writeIndex(nextIds);
  },

  async exportAll(): Promise<{ uri: string; count: number }> {
    const posts = await this.getAllPosts();
    const payload = {
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      posts,
    };
    const fileName = `pile-export-${Date.now()}.json`;
    const uri = FileSystem.documentDirectory
      ? `${FileSystem.documentDirectory}${fileName}`
      : `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(uri, JSON.stringify(payload, null, 2), {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return { uri, count: posts.length };
  },

  async importFrom(uri: string): Promise<{ imported: number; skipped: number }> {
    const content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    const json = JSON.parse(content) as { posts?: JournalPost[] };
    const incoming = json.posts || [];

    const existingIds = new Set(await readIndex());
    const toAdd: JournalPost[] = [];

    for (const post of incoming) {
      if (!post?.id || existingIds.has(post.id)) continue;
      toAdd.push(post);
      existingIds.add(post.id);
    }

    const newIds = Array.from(existingIds);
    const pairs: [string, string][] = toAdd.map((p) => [
      `post:${p.id}`,
      JSON.stringify(p),
    ]);
    if (pairs.length) {
      await AsyncStorage.multiSet(pairs);
    }
    await writeIndex(newIds);

    return { imported: toAdd.length, skipped: incoming.length - toAdd.length };
  },
};