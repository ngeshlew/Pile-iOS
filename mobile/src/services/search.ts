import AsyncStorage from '@react-native-async-storage/async-storage';
import type { JournalPost } from './storage';

const SEARCH_INDEX_KEY = 'search:index'; // token -> Set<id> stored as object: { token: [ids] }
const TOKEN_PREFIX = 'search:tokens:'; // per post tokens

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 500);
}

async function getIndex(): Promise<Record<string, string[]>> {
  const raw = await AsyncStorage.getItem(SEARCH_INDEX_KEY);
  return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
}

async function setIndex(idx: Record<string, string[]>): Promise<void> {
  await AsyncStorage.setItem(SEARCH_INDEX_KEY, JSON.stringify(idx));
}

export const Search = {
  async indexPost(post: JournalPost): Promise<void> {
    const idx = await getIndex();
    const tokens = new Set<string>([
      ...tokenize(post.title || ''),
      ...tokenize(post.content || ''),
    ]);

    // Remove prior tokens for this post
    const priorTokensRaw = await AsyncStorage.getItem(`${TOKEN_PREFIX}${post.id}`);
    const priorTokens: string[] = priorTokensRaw ? JSON.parse(priorTokensRaw) : [];
    for (const t of priorTokens) {
      const set = new Set(idx[t] || []);
      if (set.has(post.id)) {
        set.delete(post.id);
        idx[t] = Array.from(set);
        if (idx[t].length === 0) delete idx[t];
      }
    }

    // Add current tokens
    for (const t of tokens) {
      const arr = idx[t] || [];
      if (!arr.includes(post.id)) arr.push(post.id);
      idx[t] = arr;
    }

    await AsyncStorage.setItem(`${TOKEN_PREFIX}${post.id}`, JSON.stringify(Array.from(tokens)));
    await setIndex(idx);
  },

  async removePost(postId: string): Promise<void> {
    const idx = await getIndex();
    const priorTokensRaw = await AsyncStorage.getItem(`${TOKEN_PREFIX}${postId}`);
    const priorTokens: string[] = priorTokensRaw ? JSON.parse(priorTokensRaw) : [];
    for (const t of priorTokens) {
      const set = new Set(idx[t] || []);
      if (set.has(postId)) {
        set.delete(postId);
        idx[t] = Array.from(set);
        if (idx[t].length === 0) delete idx[t];
      }
    }
    await AsyncStorage.removeItem(`${TOKEN_PREFIX}${postId}`);
    await setIndex(idx);
  },

  async search(query: string): Promise<string[]> {
    const qTokens = Array.from(new Set(tokenize(query || '')));
    if (qTokens.length === 0) return [];
    const idx = await getIndex();

    // AND across tokens
    let resultSet: Set<string> | null = null;
    for (const t of qTokens) {
      const ids = new Set(idx[t] || []);
      if (resultSet === null) resultSet = ids;
      else {
        const next = new Set<string>();
        for (const id of resultSet) if (ids.has(id)) next.add(id);
        resultSet = next;
      }
      if (resultSet.size === 0) break;
    }

    return Array.from(resultSet || []);
  },
};