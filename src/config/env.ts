// src/config/env.ts
import Config from 'react-native-config';

function required(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

const normalizeAppEnvironment = (value: string) =>
  ['PROD', 'PRODUCTION'].includes(value.trim().toUpperCase())
    ? ('PROD' as const)
    : ('DEV' as const);

export const env = {
  MMKV_ENCRYPTION_KEY: required(
    Config.MMKV_ENCRYPTION_KEY,
    'MMKV_ENCRYPTION_KEY',
  ),
  APP_ENV: normalizeAppEnvironment(required(Config.APP_ENV, 'APP_ENV')),
  API_BASE_URL:
    Config.API_BASE_URL?.trim() || 'https://dhyrium.online/back/api/v1',
} as const;
