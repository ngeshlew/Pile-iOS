import { Preferences } from '@capacitor/preferences';
import type { SecretsPort } from '../../ports';

export const capSecrets: SecretsPort = {
  async get(key) {
    const { value } = await Preferences.get({ key });
    return value ?? null;
  },
  async set(key, value) {
    await Preferences.set({ key, value });
  },
};
