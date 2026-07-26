import type { TextInputProps } from 'react-native';
import { TextInput, View } from 'react-native';
import { MagnifyingGlassIcon, XIcon } from 'phosphor-react-native';
import { Pressable } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type AppSearchInputProps = TextInputProps & {
  onClear?: () => void;
};

const AppSearchInput = ({
  onClear,
  value,
  ...props
}: AppSearchInputProps) => {
  const { theme } = useUnistyles();
  return (
    <View style={styles.container}>
      <MagnifyingGlassIcon
        size={20}
        color={theme.colors.icon.secondary}
      />
      <TextInput
        {...props}
        value={value}
        placeholderTextColor={theme.colors.text.details}
        style={styles.input}
      />
      {value && onClear ? (
        <Pressable
          onPress={onClear}
          hitSlop={10}
        >
          <XIcon size={18} color={theme.colors.icon.secondary} />
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    minHeight: theme.control.height.default,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: theme.border.hairline,
    borderColor: theme.colors.border.default,
    backgroundColor: theme.colors.surface.background.cards,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    color: theme.colors.text.body,
    ...theme.typography.text.md.regular,
  },
}));

export default AppSearchInput;
