import { memo, type ReactNode } from 'react';
import {
  Pressable,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppStatusBadge from '@/components/feedback/AppStatusBadge';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';
import DocumentPageThumbnail from './DocumentPageThumbnail';
import { DOCUMENT_PAGE_CARD_HEIGHT } from '../constants/documentComposerLayout';
import type { ComposerPage } from '../types/documentComposer.types';

type AppDocumentPageCardProps = {
  page: ComposerPage;
  thumbnailUri?: string;
  isThumbnailLoading: boolean;
  onView: (pageId: string) => void;
  onDelete: (pageId: string) => void;
  dragHandle: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const AppDocumentPageCard = ({
  page,
  thumbnailUri,
  isThumbnailLoading,
  onView,
  onDelete,
  dragHandle,
  style,
}: AppDocumentPageCardProps) => {
  const { theme } = useUnistyles();
  return (
    <View style={[styles.card, style]}>
      <View style={styles.thumbnail}>
        <DocumentPageThumbnail
          page={page}
          thumbnailUri={thumbnailUri}
          isLoading={isThumbnailLoading}
        />
        <View style={styles.pageNumber}>
          <AppText variant="text.xs.bold" color="button">
            {page.order}
          </AppText>
        </View>
      </View>
      <View style={styles.copy}>
        <AppText variant="text.sm.bold" color="headings" numberOfLines={1}>
          Página {page.order}
        </AppText>
        <AppText variant="text.xs.regular" color="details" numberOfLines={1}>
          {page.fileName}
        </AppText>
        <AppText variant="text.xs.regular" color="details" numberOfLines={1}>
          {page.origin === 'scanned'
            ? page.uri.replace(/^.*\//, '…/')
            : `PDF original · página ${page.originalPageNumber}`}
        </AppText>
        <AppStatusBadge
          label={
            page.legibilityStatus === 'legible'
              ? 'Legible'
              : 'Por revisar'
          }
          tone={
            page.legibilityStatus === 'legible' ? 'success' : 'warning'
          }
        />
      </View>
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={`Ver página ${page.order}`}
          onPress={() => onView(page.id)}
          style={styles.iconButton}
        >
          <AppIcon
            name="eye"
            size={20}
            mColor={theme.colors.icon.secondary}
          />
        </Pressable>
        <Pressable
          accessibilityLabel={`Eliminar página ${page.order}`}
          onPress={() => onDelete(page.id)}
          style={styles.iconButton}
        >
          <AppIcon
            name="trash"
            size={20}
            mColor={theme.colors.text.error}
          />
        </Pressable>
        {dragHandle}
      </View>
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  card: {
    height: DOCUMENT_PAGE_CARD_HEIGHT,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  thumbnail: {
    position: 'relative',
    width: 82,
    height: 116,
    overflow: 'hidden',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
  pageNumber: {
    position: 'absolute',
    left: theme.spacing.xs,
    top: theme.spacing.xs,
    minWidth: 24,
    height: 24,
    paddingHorizontal: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.button.fill.primary,
  },
  copy: { flex: 1, minWidth: 0, gap: theme.spacing.xs },
  actions: {
    width: 42,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surface.background.elements,
  },
}));

export default memo(AppDocumentPageCard);
