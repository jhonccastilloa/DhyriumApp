import { Image, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppIcon from '@/components/icons/AppIcon';
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
    <View style={styles.placeholder}>
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
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
}));

export default DocumentPageThumbnail;
