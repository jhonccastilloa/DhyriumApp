import {
  errorCodes,
  isErrorWithCode,
  keepLocalCopy,
  pick,
  types,
} from '@react-native-documents/picker';
import { FileSystem } from 'react-native-file-access';
import { stripFileScheme } from '@/infrastructure/storage/fileSystemUtils';

export type PickedPdf =
  | { status: 'cancel' }
  | {
      status: 'success';
      uri: string;
      fileName: string;
      size: number | null;
    };

const normalizeLocalFileUri = (uri: string) => {
  if (!uri.startsWith('file://')) return uri;

  try {
    return `file://${decodeURIComponent(uri.slice('file://'.length))}`;
  } catch {
    return uri;
  }
};

export const pickPdfDocument = async (): Promise<PickedPdf> => {
  try {
    const [selected] = await pick({
      type: [types.pdf],
      allowMultiSelection: false,
      mode: 'import',
    });
    if (
      !selected ||
      !selected.hasRequestedType ||
      selected.type !== 'application/pdf'
    ) {
      throw new Error('El archivo seleccionado no es un PDF.');
    }
    const fileName = selected.name || `documento-${Date.now()}.pdf`;
    const [copy] = await keepLocalCopy({
      files: [{ uri: selected.uri, fileName }],
      destination: 'documentDirectory',
    });
    if (copy.status !== 'success') {
      throw new Error('No se pudo conservar una copia local del PDF.');
    }
    return {
      status: 'success',
      uri: normalizeLocalFileUri(copy.localUri),
      fileName,
      size: selected.size,
    };
  } catch (error) {
    if (
      isErrorWithCode(error) &&
      error.code === errorCodes.OPERATION_CANCELED
    ) {
      return { status: 'cancel' };
    }
    throw error;
  }
};

export const removePickedPdfCopy = (uri: string) =>
  FileSystem.unlink(stripFileScheme(uri)).catch(() => undefined);
