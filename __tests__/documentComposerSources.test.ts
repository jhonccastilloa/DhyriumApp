import {
  deriveComposerSource,
  getPageArtifactId,
  hasUnsavedComposerChanges,
} from '@/modules/document-composer/domain/composerSources';
import { buildDocumentManifest } from '@/modules/document-composer/domain/documentManifest';
import type {
  ComposerArtifact,
  ComposerPage,
  ComposerPdfSource,
  ComposerSession,
} from '@/modules/document-composer/types/documentComposer.types';

const artifact = (id: string): ComposerArtifact => ({
  id,
  name: `${id}.pdf`,
  status: 'TEMPORARY',
  type: 'ORIGINAL_PDF',
  mimeType: 'application/pdf',
  sizeBytes: 100,
  pageCount: 2,
  createdAt: '2026-07-31T00:00:00.000Z',
  expiresAt: '2026-08-01T00:00:00.000Z',
  downloadUrl: `/artifacts/${id}`,
});

const pdfSource = (id: string): ComposerPdfSource => ({
  id: `source-${id}`,
  uri: `file:///${id}.pdf`,
  fileName: `${id}.pdf`,
  artifact: artifact(id),
  createdAt: '2026-07-31T00:00:00.000Z',
  ownedBySession: true,
});

const pdfPage = (
  id: string,
  order: number,
  source: ComposerPdfSource,
  originalPageNumber: number,
): ComposerPage => ({
  id,
  source: source.uri,
  uri: source.uri,
  fileName: source.fileName,
  mimeType: 'application/pdf',
  order,
  legibilityStatus: 'legible',
  origin: 'originalPdf',
  pdfSourceId: source.id,
  originalPageNumber,
  createdAt: '2026-07-31T00:00:00.000Z',
  ownedBySession: false,
});

const scannedPage = (id: string, order: number): ComposerPage => ({
  id,
  source: `${id}.jpg`,
  uri: `file:///${id}.jpg`,
  fileName: `${id}.jpg`,
  mimeType: 'image/jpeg',
  order,
  legibilityStatus: 'pending',
  origin: 'scanned',
  createdAt: '2026-07-31T00:00:00.000Z',
  ownedBySession: true,
});

const session = (
  pages: ComposerPage[],
  pdfSources: ComposerPdfSource[],
): ComposerSession => ({
  id: 'session',
  mode: 'tool',
  source: deriveComposerSource(pages),
  name: 'Documento',
  pdfSources,
  pages,
  status: 'reviewing',
  uploadProgress: 0,
  createdAt: '2026-07-31T00:00:00.000Z',
  updatedAt: '2026-07-31T00:00:00.000Z',
  contentUpdatedAt: '2026-07-31T00:00:00.000Z',
});

describe('document composer sources', () => {
  it('builds one ordered manifest with pages from multiple PDFs and scans', () => {
    const first = pdfSource('pdf-a');
    const second = pdfSource('pdf-b');
    const current = session(
      [
        pdfPage('a-2', 3, first, 2),
        scannedPage('scan-1', 2),
        pdfPage('b-1', 1, second, 1),
      ],
      [first, second],
    );

    expect(buildDocumentManifest(current)).toEqual({
      version: 1,
      items: [
        {
          id: 'b-1',
          kind: 'pdfPage',
          sourceArtifactId: 'pdf-b',
          pageNumber: 1,
          order: 1,
        },
        {
          id: 'scan-1',
          kind: 'image',
          fileKey: 'scan-1.jpg',
          order: 2,
        },
        {
          id: 'a-2',
          kind: 'pdfPage',
          sourceArtifactId: 'pdf-a',
          pageNumber: 2,
          order: 3,
        },
      ],
    });
    expect(current.source).toBe('mixed');
    expect(getPageArtifactId(current, current.pages[0])).toBe('pdf-a');
  });

  it('rejects a PDF page without its stable source', () => {
    const source = pdfSource('missing');
    const current = session(
      [pdfPage('page', 1, source, 1)],
      [],
    );

    expect(() => buildDocumentManifest(current)).toThrow(
      'No se encontró la fuente de la página 1.',
    );
  });

  it('only marks content newer than its saved snapshot as dirty', () => {
    const current = session([scannedPage('scan', 1)], []);
    expect(hasUnsavedComposerChanges(current)).toBe(true);

    current.savedContentAt = current.contentUpdatedAt;
    expect(hasUnsavedComposerChanges(current)).toBe(false);
  });
});
