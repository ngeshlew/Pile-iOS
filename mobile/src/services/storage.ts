import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Search } from './search';
import { isEncryptionEnabled, encryptText, decryptText } from './encryption';

export type JournalPost = {
  id: string;
  title?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  attachments?: string[]; // local URIs
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
      await AsyncStorage.multiSet([
        [STORAGE_VERSION_KEY, String(CURRENT_VERSION)],
        [INDEX_KEY, JSON.stringify([])],
      ]);
      return;
    }
    if (version < CURRENT_VERSION) {
      await AsyncStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_VERSION));
    }
  },

  async getAllPosts(): Promise<JournalPost[]> {
    const ids = await readIndex();
    const posts = await Promise.all(
      ids.map(async (id) => {
        const raw = await AsyncStorage.getItem(`post:${id}`);
        if (!raw) return null;
        const p = JSON.parse(raw) as JournalPost;
        if (p && p.content && typeof p.content === 'string' && p.content.startsWith('enc:')) {
          try {
            const decrypted = await decryptText(p.content.slice(4));
            p.content = decrypted;
          } catch {}
        }
        return p;
      })
    );
    return posts.filter(Boolean) as JournalPost[];
  },

  async getPost(id: string): Promise<JournalPost | null> {
    const raw = await AsyncStorage.getItem(`post:${id}`);
    if (!raw) return null;
    const p = JSON.parse(raw) as JournalPost;
    if (p && p.content && typeof p.content === 'string' && p.content.startsWith('enc:')) {
      try {
        const decrypted = await decryptText(p.content.slice(4));
        p.content = decrypted;
      } catch {}
    }
    return p;
  },

  async createPost(input: { title?: string; content: string; attachments?: string[] }): Promise<JournalPost> {
    const id = await generateId();
    let post: JournalPost = {
      id,
      title: input.title,
      content: input.content,
      attachments: input.attachments?.slice() || [],
      createdAt: Date.now(),
    };
    if (await isEncryptionEnabled()) {
      const cipher = await encryptText(post.content);
      post = { ...post, content: `enc:${cipher}` };
    }
    const ids = await readIndex();
    ids.push(id);
    await AsyncStorage.multiSet([
      [INDEX_KEY, JSON.stringify(ids)],
      [`post:${id}`, JSON.stringify(post)],
    ]);
    await Search.indexPost(post);
    return post;
  },

  async updatePost(id: string, update: Partial<Pick<JournalPost, 'title' | 'content' | 'attachments'>>): Promise<JournalPost | null> {
    const raw = await AsyncStorage.getItem(`post:${id}`);
    if (!raw) return null;
    const prev = JSON.parse(raw) as JournalPost;
    let next: JournalPost = { ...prev, ...update, updatedAt: Date.now() };
    if (await isEncryptionEnabled()) {
      const cipher = await encryptText(next.content);
      next = { ...next, content: `enc:${cipher}` };
    }
    await AsyncStorage.setItem(`post:${id}`, JSON.stringify(next));
    await Search.indexPost(next);
    return next;
  },

  async deletePost(id: string): Promise<void> {
    const ids = await readIndex();
    const nextIds = ids.filter((x) => x !== id);
    await AsyncStorage.multiRemove([`post:${id}`]);
    await Search.removePost(id);
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
      // sanitize
      let clean: JournalPost = {
        id: String(post.id),
        title: post.title || undefined,
        content: post.content || '',
        createdAt: Number(post.createdAt) || Date.now(),
        updatedAt: post.updatedAt ? Number(post.updatedAt) : undefined,
        attachments: Array.isArray(post.attachments) ? post.attachments.filter(Boolean) : [],
      };
      if (await isEncryptionEnabled()) {
        const cipher = await encryptText(clean.content);
        clean = { ...clean, content: `enc:${cipher}` };
      }
      toAdd.push(clean);
      existingIds.add(clean.id);
    }

    const newIds = Array.from(existingIds);
    const pairs = toAdd.map((p) => [`post:${p.id}`, JSON.stringify(p)] as [string, string]);
    if (pairs.length) {
      await AsyncStorage.multiSet(pairs);
      // index imported posts
      await Promise.all(toAdd.map((p) => Search.indexPost(p)));
    }
    await writeIndex(newIds);

    return { imported: toAdd.length, skipped: incoming.length - toAdd.length };
  },
};