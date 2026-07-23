import DocumentScanner, {
  ResponseType,
  ScanDocumentResponseStatus,
} from 'react-native-document-scanner-plugin';
import { scanDocuments } from '@/modules/document-composer/services/scannerService';

const scannerMock = jest.mocked(DocumentScanner.scanDocument);

describe('escáner documental', () => {
  beforeEach(() => {
    scannerMock.mockReset();
  });

  it('usa rutas de archivo y conserva el orden devuelto por el escáner', async () => {
    scannerMock.mockResolvedValue({
      status: ScanDocumentResponseStatus.Success,
      scannedImages: ['file:///page-1.jpg', 'file:///page-2.jpg'],
    });

    await expect(scanDocuments()).resolves.toEqual({
      status: 'success',
      paths: ['file:///page-1.jpg', 'file:///page-2.jpg'],
    });
    expect(scannerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        croppedImageQuality: 85,
        responseType: ResponseType.ImageFilePath,
      })
    );
  });

  it('trata cancelar como una salida recuperable sin páginas', async () => {
    scannerMock.mockResolvedValue({
      status: ScanDocumentResponseStatus.Cancel,
      scannedImages: [],
    });

    await expect(scanDocuments()).resolves.toEqual({
      status: 'cancel',
      paths: [],
    });
  });
});
