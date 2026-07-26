import type { RefObject } from 'react';
import { Pressable, View } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import AppIcon from '@/components/icons/AppIcon';
import AppText from '@/components/typography/AppText';
import type { IconName } from '@/components/icons/iconRegistry';
import type { ContractTreeNode } from '../types/contracts.types';

type ContractMethodSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  node?: ContractTreeNode;
  path: string[];
  onChoosePdf: () => void;
  onScan: () => void;
  onView: () => void;
  onOrganize: () => void;
  onDelete: () => void;
};

const ContractMethodSheet = ({
  sheetRef,
  node,
  path,
  onChoosePdf,
  onScan,
  onView,
  onOrganize,
  onDelete,
}: ContractMethodSheetProps) => {
  const { theme } = useUnistyles();
  const uploaded = node?.status === 'SUBIDO';
  const action = (
    title: string,
    description: string,
    icon: IconName,
    onPress: () => void
  ) => {
    return (
      <Pressable
        onPress={() => {
          sheetRef.current?.dismiss();
          onPress();
        }}
        style={({ pressed }) => [
          styles.action,
          pressed && styles.pressed,
        ]}
      >
        <View style={styles.icon}>
          <AppIcon
            name={icon}
            size={25}
            mColor={theme.colors.navigation.active}
            variant="featured"
          />
        </View>
        <View style={styles.actionCopy}>
          <AppText variant="text.md.bold" color="headings">
            {title}
          </AppText>
          <AppText variant="text.sm.regular" color="details">
            {description}
          </AppText>
        </View>
      </Pressable>
    );
  };

  return (
    <AppBottomSheetModal
      ref={sheetRef}
      snapPoints={[uploaded ? '82%' : '56%']}
      enableDynamicSizing={false}
      enablePanDownToClose
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <AppText variant="overline" color="details">
            {node?.code || ''}
          </AppText>
          <AppText variant="title.l" color="headings">
            {node?.name || 'Documento'}
          </AppText>
          <AppText variant="text.xs.regular" color="details" numberOfLines={2}>
            {path.join(' / ')}
          </AppText>
        </View>
        {uploaded
          ? action(
              'Ver PDF actual',
              'Abre el archivo publicado en este nivel.',
              'filePdf',
              onView
            )
          : null}
        {uploaded
          ? action(
              'Organizar o reemplazar',
              'Crea primero una nueva versión sin alterar la actual.',
              'pencilSimple',
              onOrganize
            )
          : null}
        {action(
          uploaded ? 'Elegir un nuevo PDF' : 'Elegir un PDF',
          'Selecciona un archivo guardado en el dispositivo.',
          'filePdf',
          onChoosePdf
        )}
        {action(
          uploaded ? 'Escanear nueva versión' : 'Escanear con el celular',
          'Captura páginas con recorte y perspectiva automáticos.',
          'scan',
          onScan
        )}
        {uploaded
          ? action(
              'Quitar PDF del nivel',
              'Conserva el historial, pero deja este nivel pendiente.',
              'trash',
              onDelete
            )
          : null}
      </BottomSheetScrollView>
    </AppBottomSheetModal>
  );
};

const styles = StyleSheet.create(theme => ({
  content: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  heading: { paddingBottom: theme.spacing.sm, gap: theme.spacing.xs },
  action: {
    minHeight: 76,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.subtle,
    backgroundColor: theme.colors.surface.background.cards,
  },
  icon: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.navigation.rail,
  },
  actionCopy: { flex: 1, gap: theme.spacing.xs },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ContractMethodSheet;
