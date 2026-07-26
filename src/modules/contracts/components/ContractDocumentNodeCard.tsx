import { Pressable, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppStatusBadge from '@/components/feedback/AppStatusBadge';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';
import type { ContractTreeNode } from '../types/contracts.types';

const countLeaves = (node: ContractTreeNode): [number, number] => {
  if (node.acceptsPdf) return [1, node.status === 'SUBIDO' ? 1 : 0];
  return node.children.reduce(
    (totals, child) => {
      const [required, uploaded] = countLeaves(child);
      return [totals[0] + required, totals[1] + uploaded];
    },
    [0, 0]
  );
};

const ContractDocumentNodeCard = ({
  node,
  onPress,
}: {
  node: ContractTreeNode;
  onPress: () => void;
}) => {
  const { theme } = useUnistyles();
  const [required, uploaded] = countLeaves(node);
  const isGroup = !node.acceptsPdf;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.icon}>
        {isGroup ? (
          <AppIcon
            name="folderOpen"
            size={24}
            mColor={theme.colors.navigation.active}
          />
        ) : (
          <AppIcon
            name="filePdf"
            size={24}
            mColor={
              node.status === 'SUBIDO'
                ? theme.colors.text.success
                : theme.colors.icon.secondary
            }
            variant="featured"
          />
        )}
      </View>
      <View style={styles.copy}>
        <AppText variant="overline" color="details">
          {node.code}
        </AppText>
        <AppText variant="text.md.bold" color="headings" numberOfLines={3}>
          {node.name}
        </AppText>
        {isGroup ? (
          <AppText variant="text.xs.regular" color="details">
            {uploaded} de {required} PDF subidos
          </AppText>
        ) : (
          <AppStatusBadge
            label={node.status === 'SUBIDO' ? 'Subido' : 'Pendiente'}
            tone={node.status === 'SUBIDO' ? 'success' : 'warning'}
          />
        )}
      </View>
      <AppIcon
        name="caretRight"
        size={20}
        mColor={theme.colors.icon.secondary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create(theme => ({
  card: {
    minHeight: 94,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface.background.cards,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.navigation.rail,
  },
  copy: { flex: 1, gap: theme.spacing.xs },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ContractDocumentNodeCard;
