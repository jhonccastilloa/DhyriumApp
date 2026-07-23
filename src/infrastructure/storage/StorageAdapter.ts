import { createMMKV, MMKV } from 'react-native-mmkv';
import { env } from '@/config/env';

const storage = createMMKV({
  id: 'dhyrium-storage',
  encryptionKey: env.MMKV_ENCRYPTION_KEY,
});

class StorageAdapter {
  private static storage: MMKV = storage;
  static getItem(key: string): string | null {
    try {
      const value = this.storage.getString(key);
      if (!value) return null;
      return value;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static setItem(key: string, value: string): void {
    try {
      this.storage.set(key, value);
    } catch (error) {
      console.log(error);
      throw new Error(`Error setting item ${key} ${value} `);
    }
  }

  static removeItem(key: string): void {
    try {
      this.storage.remove(key);
    } catch (error) {
      console.log(error);
      throw new Error(`Error removing item ${key}`);
    }
  }
}

export default StorageAdapter;
