// import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { StyleSheet, UnistylesVariants } from 'react-native-unistyles';

type AppTextVariants = UnistylesVariants<typeof styles>;
export interface AppTextProps extends TextProps, AppTextVariants {
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
  // autoSize?: boolean;
  // fs?: TextStyle['flexShrink'];
  text?: string;
}

const AppText = ({
  children,
  align = 'left',
  style,
  text,
  variant,
  color,
  size,
  ...rest
}: AppTextProps) => {
  styles.useVariants({
    variant,
    color,
    size,
  });
  // if (autoSize) {
  //   return (
  //     <AutoSizeText
  //       numberOfLines={1}
  //       {...rest}
  //       fontSize={styles.text.fontSize}
  //       mode={ResizeTextMode.max_lines}
  //       style={[
  //         styles.text,
  //         {
  //           textAlign: align,
  //           flexShrink: fs,
  //         },
  //         style,
  //       ]}
  //     >
  //       {text ? text : children}
  //     </AutoSizeText>
  //   );
  // }

  return (
    <Text
      {...rest}
      style={[
        styles.text,
        {
          textAlign: align,
        },
        style,
      ]}
    >
      {text ? text : children}
    </Text>
  );
};

const styles = StyleSheet.create(theme => ({
  text: {
    variants: {
      variant: {
        ['title.xxl']: theme.typography.title.xxl,
        ['title.xl']: theme.typography.title.xl,
        ['title.l']: theme.typography.title.l,
        ['title.m']: theme.typography.title.m,
        ['title.s']: theme.typography.title.s,

        ['text.md.bold']: theme.typography.text.md.bold,
        ['text.md.regular']: theme.typography.text.md.regular,

        ['text.sm.bold']: theme.typography.text.sm.bold,
        ['text.sm.regular']: theme.typography.text.sm.regular,

        ['text.xs.bold']: theme.typography.text.xs.bold,
        ['text.xs.regular']: theme.typography.text.xs.regular,

        ['button']: theme.typography.button,
        ['actionButton']: theme.typography.actionButton,
        ['menu']: theme.typography.menu,
      },
      size: {
        xs: { fontSize: theme.fontSize.xs },
        sm: { fontSize: theme.fontSize.sm },
        md: { fontSize: theme.fontSize.md },
        lg: { fontSize: theme.fontSize.lg },
        xl: { fontSize: theme.fontSize.xl },
        xxl: { fontSize: theme.fontSize.xxl },
        xxxl: { fontSize: theme.fontSize.xxxl },
      },

      color: {
        headings: { color: theme.colors.text.headings },
        body: { color: theme.colors.text.body },
        details: { color: theme.colors.text.details },
        button: { color: theme.colors.text.button },
        link: { color: theme.colors.text.link },
        disabled: { color: theme.colors.text.disabled },
        success: { color: theme.colors.text.success },
        error: { color: theme.colors.text.error },
        warning: { color: theme.colors.text.warning },
      },
    },
  },
}));
export default AppText;
