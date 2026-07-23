declare module 'react-native-config' {
  export interface NativeConfig {
    MMKV_ENCRYPTION_KEY: string;
    APP_ENV: 'DEV' | 'PROD';
  }

  const Config: NativeConfig;

  export default Config;
}
