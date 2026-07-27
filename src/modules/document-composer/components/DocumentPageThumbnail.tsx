import { Image } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppIcon from '@/components/icons/AppIcon';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import type { ComposerPage } from '../types/documentComposer.types';

type DocumentPageThumbnailProps = {
  page: ComposerPage;
  thumbnailUri?: string;
  isLoading: boolean;
  compact?: boolean;
};

const DocumentPageThumbnail = ({
  page,
  thumbnailUri,
  isLoading,
  compact = false,
}: DocumentPageThumbnailProps) => {
  const { theme } = useUnistyles();

  if (thumbnailUri) {
    return <Image source={{ uri: thumbnailUri }} style={styles.image} />;
  }

  return (
    <AppFlex
      width="100%"
      height="100%"
      align="center"
      justify="center"
      gap="xs"
    >
      <AppIcon
        name="filePdf"
        size={compact ? 24 : 30}
        mColor={theme.colors.icon.secondary}
      />
      {!compact ? (
        <>
          <AppText variant="text.xs.bold" color="details">
            {isLoading ? 'Preparando…' : 'PDF'}
          </AppText>
          <AppText variant="text.xs.regular" color="details">
            Pág. {page.originalPageNumber ?? page.order}
          </AppText>
        </>
      ) : null}
    </AppFlex>
  );
};

const styles = StyleSheet.create({
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
});

export default DocumentPageThumbnail;
