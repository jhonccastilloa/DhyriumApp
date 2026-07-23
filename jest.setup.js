/* global jest */
jest.mock('react-native-config', () => ({
  MMKV_ENCRYPTION_KEY: 'test-encryption-key',
  APP_ENV: 'DEV',
  API_BASE_URL: 'http://127.0.0.1:8013/api/v1',
}));

jest.mock('react-native-document-scanner-plugin', () => ({
  __esModule: true,
  default: {
    scanDocument: jest.fn(),
  },
  ResponseType: {
    ImageFilePath: 'imageFilePath',
  },
  ScanDocumentResponseStatus: {
    Success: 'success',
    Cancel: 'cancel',
  },
}));

jest.mock('react-native-mmkv', () => {
  const values = new Map();

  return {
    createMMKV: () => ({
      getString: key => values.get(key),
      set: (key, value) => values.set(key, value),
      remove: key => values.delete(key),
    }),
  };
});
