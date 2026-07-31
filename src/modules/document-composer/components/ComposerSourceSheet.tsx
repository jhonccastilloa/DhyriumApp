import type { RefObject } from 'react';
import { Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import AppBottomSheetModal from '@/components/bottom-sheets/AppBottomSheetModal';
import AppIcon from '@/components/icons/AppIcon';
import type { IconName } from '@/components/icons/iconRegistry';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';

type ComposerSourceSheetProps = {
  sheetRef: RefObject<BottomSheetModal | null>;
  mode: 'append' | 'replace';
  onChoosePdf: () => void;
  onScan: () => void;
};

const ComposerSourceSheet = ({
  sheetRef,
  mode,
  onChoosePdf,
  onScan,
}: ComposerSourceSheetProps) => {
  const { theme } = useUnistyles();
  const replacing = mode === 'replace';

  const action = (
    title: string,
    description: string,
    icon: IconName,
    onPress: () => void,
  ) => (
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
      <AppFlex
        size={46}
        align="center"
        justify="center"
        style={styles.icon}
      >
        <AppIcon
          name={icon}
          size={25}
          mColor={theme.colors.navigation.active}
          variant="featured"
        />
      </AppFlex>
      <AppFlex flex={1} gap="xs">
        <AppText variant="text.md.bold" color="headings">
          {title}
        </AppText>
        <AppText variant="text.sm.regular" color="details">
          {description}
        </AppText>
      </AppFlex>
      <AppIcon
        name="caretRight"
        size={18}
        mColor={theme.colors.icon.secondary}
      />
    </Pressable>
  );

  return (
    <AppBottomSheetModal
      ref={sheetRef}
      snapPoints={['48%']}
      enableDynamicSizing={false}
      enablePanDownToClose
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <AppFlex pb="sm" gap="xs">
          <AppText variant="overline" color="details">
            {replacing ? 'REEMPLAZAR CONTENIDO' : 'AGREGAR PÁGINAS'}
          </AppText>
          <AppText variant="title.l" color="headings">
            {replacing ? 'Elige el nuevo origen' : 'Elige una fuente'}
          </AppText>
          <AppText variant="text.sm.regular" color="details">
            {replacing
              ? 'El contenido actual solo se descartará cuando completes la nueva captura o selección.'
              : 'Las páginas nuevas se agregarán al final del documento.'}
          </AppText>
        </AppFlex>
        {action(
          'Escanear páginas',
          replacing
            ? 'Captura un documento nuevo con la cámara.'
            : 'Agrega capturas con recorte automático.',
          'scan',
          onScan,
        )}
        {action(
          'Elegir un PDF',
          replacing
            ? 'Usa un PDF guardado como nuevo contenido.'
            : 'Agrega todas las páginas de otro PDF.',
          'filePdf',
          onChoosePdf,
        )}
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
  action: {
    minHeight: 82,
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
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.navigation.rail,
  },
  pressed: { opacity: theme.opacity.pressed },
}));

export default ComposerSourceSheet;
