import { Image, Pressable, View } from 'react-native';
import { PdfView } from 'react-native-pdf-light';
import { SortableItem } from 'react-native-reanimated-dnd';
import type { SortableRenderItemProps } from 'react-native-reanimated-dnd';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppStatusBadge from '@/components/feedback/AppStatusBadge';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';
import type { ComposerPage } from '../types/documentComposer.types';

type Props = SortableRenderItemProps<ComposerPage> & {
  onDropPage: (from: number, to: number) => void;
  onView: (pageId: string) => void;
  onDelete: (pageId: string) => void;
};

const AppDocumentPageCard = ({
  item,
  id,
  index,
  onDropPage,
  onView,
  onDelete,
  ...sortableProps
}: Props) => {
  const { theme } = useUnistyles();
  return (
    <SortableItem
      id={id}
      data={item}
      {...sortableProps}
      onDrop={(_itemId, position) => onDropPage(index, position)}
    >
      <View style={styles.card}>
        <View style={styles.thumbnail}>
          {item.origin === 'scanned' ? (
            <Image source={{ uri: item.uri }} style={styles.preview} />
          ) : (
            <PdfView
              source={item.uri}
              page={(item.originalPageNumber || 1) - 1}
              style={styles.preview}
            />
          )}
          <View style={styles.pageNumber}>
            <AppText variant="text.xs.bold" color="button">
              {item.order}
            </AppText>
          </View>
        </View>
        <View style={styles.copy}>
          <AppText variant="text.sm.bold" color="headings" numberOfLines={1}>
            Página {item.order}
          </AppText>
          <AppText variant="text.xs.regular" color="details" numberOfLines={1}>
            {item.fileName}
          </AppText>
          <AppText variant="text.xs.regular" color="details" numberOfLines={1}>
            {item.origin === 'scanned'
              ? item.uri.replace(/^.*\//, '…/')
              : `PDF original · página ${item.originalPageNumber}`}
          </AppText>
          <AppStatusBadge
            label={
              item.legibilityStatus === 'legible'
                ? 'Legible'
                : 'Por revisar'
            }
            tone={
              item.legibilityStatus === 'legible' ? 'success' : 'warning'
            }
          />
        </View>
        <View style={styles.actions}>
          <Pressable
            onPress={() => onView(item.id)}
            style={styles.iconButton}
          >
            <AppIcon
              name="eye"
              size={20}
              mColor={theme.colors.icon.secondary}
            />
          </Pressable>
          <Pressable
            onPress={() => onDelete(item.id)}
            style={styles.iconButton}
          >
            <AppIcon
              name="trash"
              size={20}
              mColor={theme.colors.text.error}
            />
          </Pressable>
          <SortableItem.Handle style={styles.handle}>
            <AppIcon
              name="dotsSixVertical"
              size={26}
              mColor={theme.colors.navigation.active}
            />
          </SortableItem.Handle>
        </View>
      </View>
    </SortableItem>
  );
};

const styles = StyleSheet.create(theme => ({
  card: {
    height: 138,
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
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  pageNumber: {
    position: 'absolute',
    left: theme.spacing.xs,
    top: theme.spacing.xs,
    minWidth: 24,
    height: 24,
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
  handle: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.navigation.rail,
  },
}));

export default AppDocumentPageCard;
