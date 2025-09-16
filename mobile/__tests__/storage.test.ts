import { Storage } from '../src/services/storage';
import * as FileSystem from 'expo-file-system';

describe('Storage', () => {
  beforeEach(async () => {
    const asyncStorage: any = require('@react-native-async-storage/async-storage').default;
    await asyncStorage.clear();
  });

  it('creates and retrieves a post', async () => {
    await Storage.ensureInitialized();
    const post = await Storage.createPost({ title: 'Hello', content: 'World' });
    const all = await Storage.getAllPosts();
    expect(all.find((p) => p.id === post.id)?.content).toBe('World');
  });

  it('exports and imports data', async () => {
    await Storage.ensureInitialized();
    await Storage.createPost({ content: 'One' });
    const { uri } = await Storage.exportAll();

    const content = JSON.stringify({ posts: await Storage.getAllPosts() });
    (FileSystem.readAsStringAsync as unknown as jest.Mock).mockResolvedValueOnce(content);

    const res = await Storage.importFrom('file:///fake.json');
    expect(res.imported + res.skipped).toBeGreaterThanOrEqual(1);
  });
});