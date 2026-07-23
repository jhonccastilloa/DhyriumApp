import { Platform } from 'react-native';
import DocumentScanner, {
  ResponseType,
  ScanDocumentResponseStatus,
} from 'react-native-document-scanner-plugin';

export type ScanResult =
  | { status: 'cancel'; paths: [] }
  | { status: 'success'; paths: string[] };

export const scanDocuments = async (): Promise<ScanResult> => {
  const result = await DocumentScanner.scanDocument({
    croppedImageQuality: 85,
    responseType: ResponseType.ImageFilePath,
    ...(Platform.OS === 'android' ? { maxNumDocuments: 50 } : {}),
  });

  if (result.status === ScanDocumentResponseStatus.Cancel) {
    return { status: 'cancel', paths: [] };
  }
  return {
    status: 'success',
    paths: result.scannedImages || [],
  };
};
