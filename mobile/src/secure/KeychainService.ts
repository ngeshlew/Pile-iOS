// Placeholder interface for Keychain; install plugins on macOS when adding iOS platform
export class KeychainService {
  async setSecret(key: string, value: string): Promise<void> {
    // Replace with @capawesome/capacitor-secure-storage at runtime
    localStorage.setItem(`secure:${key}`, value);
  }

  async getSecret(key: string): Promise<string | null> {
    return localStorage.getItem(`secure:${key}`);
  }

  async deleteSecret(key: string): Promise<void> {
    localStorage.removeItem(`secure:${key}`);
  }
}

export const keychain = new KeychainService();

