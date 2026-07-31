import type { ComposerSession } from '../types/documentComposer.types';

export const buildDocumentManifest = (session: ComposerSession) => {
  const ordered = [...session.pages].sort((a, b) => a.order - b.order);
  const pdfSources = new Map(
    session.pdfSources.map(source => [source.id, source]),
  );

  return {
    version: 1 as const,
    items: ordered.map(page => {
      if (page.origin === 'scanned') {
        return {
          id: page.id,
          kind: 'image' as const,
          fileKey: `${page.id}.jpg`,
          order: page.order,
        };
      }

      const source = page.pdfSourceId
        ? pdfSources.get(page.pdfSourceId)
        : undefined;
      if (!source || page.originalPageNumber === undefined) {
        throw new Error(
          `No se encontró la fuente de la página ${page.order}.`,
        );
      }
      return {
        id: page.id,
        kind: 'pdfPage' as const,
        sourceArtifactId: source.artifact.id,
        pageNumber: page.originalPageNumber,
        order: page.order,
      };
    }),
  };
};
