export type ComposerMode = 'tool' | 'contract';
export type ComposerSource = 'scanner' | 'pdf' | 'mixed';
export type ComposerPageOrigin = 'scanned' | 'originalPdf';
export type LegibilityStatus = 'pending' | 'legible';

export type ComposerDestination = {
  contractId: number;
  contractLabel: string;
  levelCode: string;
  levelName: string;
  path: string[];
  currentVersionId?: string;
};

export type ComposerPage = {
  id: string;
  source: string;
  uri: string;
  fileName: string;
  mimeType: 'image/jpeg' | 'application/pdf';
  order: number;
  legibilityStatus: LegibilityStatus;
  origin: ComposerPageOrigin;
  originalPageNumber?: number;
  createdAt: string;
  ownedBySession: boolean;
};

export type ComposerSessionStatus =
  | 'reviewing'
  | 'draft'
  | 'ready'
  | 'transferring'
  | 'processing'
  | 'generated'
  | 'associating'
  | 'uploaded'
  | 'transferError'
  | 'generationError'
  | 'associationError';

export type ComposerArtifact = {
  id: string;
  name: string;
  status: string;
  type: string;
  mimeType: string;
  sizeBytes: number;
  pageCount: number;
  createdAt: string;
  expiresAt: string | null;
  downloadUrl: string;
};

export type ComposerSession = {
  id: string;
  mode: ComposerMode;
  source: ComposerSource;
  name: string;
  destination?: ComposerDestination;
  isEditingExisting?: boolean;
  sourceArtifact?: ComposerArtifact;
  pages: ComposerPage[];
  status: ComposerSessionStatus;
  uploadProgress: number;
  artifact?: ComposerArtifact;
  errorCode?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
};
