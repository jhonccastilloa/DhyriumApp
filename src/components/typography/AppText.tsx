// import { AutoSizeText, ResizeTextMode } from 'react-native-auto-size-text';
import { createTokenVariants } from '@/styles/createTokenVariants';
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
    color: theme.colors.text.body,
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
        ['overline']: theme.typography.overline,
        ['menu']: theme.typography.menu,
      },
      size: createTokenVariants(theme.fontSize, 'fontSize'),

      color: createTokenVariants(theme.colors.text, 'color'),
    },
  },
}));
export default AppText;
