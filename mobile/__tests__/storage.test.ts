import { Storage } from '../src/services/storage';
import * as FileSystem from 'expo-file-system';

describe('Storage', () => {
  beforeEach(async () => {
    // reset AsyncStorage mock by clearing keys used in storage
    // @ts-ignore
    await require('@react-native-async-storage/async-storage').default.clear();
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

    // Mock reading exported content back
    const content = JSON.stringify({ posts: await Storage.getAllPosts() });
    (FileSystem.readAsStringAsync as jest.Mock).mockResolvedValueOnce(content);

    const res = await Storage.importFrom('file:///fake.json');
    expect(res.imported + res.skipped).toBeGreaterThanOrEqual(1);
  });
});