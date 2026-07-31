import type {
  ComposerPage,
  ComposerPdfSource,
  ComposerSession,
  ComposerSource,
} from '../types/documentComposer.types';

export const deriveComposerSource = (
  pages: ComposerPage[],
): ComposerSource => {
  const hasScannedPages = pages.some(page => page.origin === 'scanned');
  const hasPdfPages = pages.some(page => page.origin === 'originalPdf');

  if (hasScannedPages && hasPdfPages) return 'mixed';
  return hasPdfPages ? 'pdf' : 'scanner';
};

export const getPagePdfSource = (
  pdfSources: ComposerPdfSource[],
  page: ComposerPage,
) =>
  page.pdfSourceId
    ? pdfSources.find(source => source.id === page.pdfSourceId)
    : undefined;

export const getPageArtifactId = (
  session: ComposerSession | undefined | null,
  page: ComposerPage,
) => getPagePdfSource(session?.pdfSources ?? [], page)?.artifact.id;

export const hasUnsavedComposerChanges = (
  session: ComposerSession | undefined | null,
) =>
  Boolean(
    session &&
      session.pages.length > 0 &&
      session.contentUpdatedAt !== session.savedContentAt,
  );
