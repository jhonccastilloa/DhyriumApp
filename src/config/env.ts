// src/config/env.ts
import Config from 'react-native-config';

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  MMKV_ENCRYPTION_KEY: required(
    Config.MMKV_ENCRYPTION_KEY,
    'MMKV_ENCRYPTION_KEY',
  ),
  APP_ENV: required(Config.APP_ENV, 'APP_ENV') as 'PROD' | 'DEV',
} as const;
