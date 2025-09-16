import * as SecureStore from 'expo-secure-store';

const API_KEY = 'openai-api-key';

export const Secure = {
  async setApiKey(key: string): Promise<void> {
    if (!key) {
      await SecureStore.deleteItemAsync(API_KEY);
      return;
    }
    await SecureStore.setItemAsync(API_KEY, key, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
  },
  async getApiKey(): Promise<string | null> {
    return SecureStore.getItemAsync(API_KEY);
  },
};