import CryptoJS from 'crypto-js';
import * as SecureStore from 'expo-secure-store';

const ENC_KEY = 'encryption-key';

async function getOrCreateKey(): Promise<string> {
  let existing = await SecureStore.getItemAsync(ENC_KEY);
  if (!existing) {
    const random = `${Date.now()}-${Math.random()}`;
    const newKey: string = CryptoJS.SHA256(random).toString();
    await SecureStore.setItemAsync(ENC_KEY, newKey, { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY });
    existing = newKey;
  }
  return existing;
}

export async function enableEncryption(): Promise<void> {
  await getOrCreateKey();
}

export async function clearEncryptionKey(): Promise<void> {
  await SecureStore.deleteItemAsync(ENC_KEY);
}

export async function encryptText(plain: string): Promise<string> {
  const key = await getOrCreateKey();
  const cipher = CryptoJS.AES.encrypt(plain, key).toString();
  return cipher;
}

export async function decryptText(cipher: string): Promise<string> {
  const key = await getOrCreateKey();
  const bytes = CryptoJS.AES.decrypt(cipher, key);
  const text = bytes.toString(CryptoJS.enc.Utf8);
  return String(text);
}

export async function isEncryptionEnabled(): Promise<boolean> {
  const key = await SecureStore.getItemAsync(ENC_KEY);
  return Boolean(key);
}