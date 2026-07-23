export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 56,
  xxxxl: 72,
  xxxxxl: 120,
} as const;

export const icon = {
  size: {
    xs: 16,
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
    xxl: 56,
    xxxl: 64,
  },
} as const;

export const radius = {
  none: 0,
  xs: 5,
  sm: 16,
  md: 40,
  lg: 56,
  pill: 999,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const fontFamily = {
  satoshiRegular: 'Satoshi-Regular',
  satoshiMedium: 'Satoshi-Medium',
  satoshiBold: 'Satoshi-Bold',
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  bold: '700',
} as const;

export const typography = {
  title: {
    xxl: {
      fontFamily: fontFamily.satoshiBold,
      fontSize: 38,
      lineHeight: 40,
      letterSpacing: -1.14,
    },
    xl: {
      fontFamily: fontFamily.satoshiBold,
      fontSize: 24,
      lineHeight: 24,
      letterSpacing: -0.48,
    },
    l: {
      fontFamily: fontFamily.satoshiBold,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.54,
    },
    m: {
      fontFamily: fontFamily.satoshiBold,
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: -0.32,
    },
    s: {
      fontFamily: fontFamily.satoshiMedium,
      fontSize: 14,
      lineHeight: 16,
      letterSpacing: -0.28,
    },
  },
  text: {
    md: {
      bold: {
        fontFamily: fontFamily.satoshiBold,
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: -0.32,
      },
      regular: {
        fontFamily: fontFamily.satoshiRegular,
        fontSize: 16,
        lineHeight: 20,
        letterSpacing: -0.32,
      },
    },
    sm: {
      bold: {
        fontFamily: fontFamily.satoshiBold,
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: -0.28,
      },
      regular: {
        fontFamily: fontFamily.satoshiRegular,
        fontSize: 14,
        lineHeight: 18,
        letterSpacing: -0.28,
      },
    },
    xs: {
      bold: {
        fontFamily: fontFamily.satoshiBold,
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: -0.24,
      },
      regular: {
        fontFamily: fontFamily.satoshiRegular,
        fontSize: 12,
        lineHeight: 16,
        letterSpacing: -0.24,
      },
    },
  },
  button: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.32,
  },
  actionButton: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: -0.42,
  },
  overline: {
    fontFamily: fontFamily.satoshiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
  },
  menu: {
    fontFamily: fontFamily.satoshiMedium,
    fontSize: 10,
    lineHeight: 13,
    letterSpacing: 0,
  },
} as const;

export const opacity = {
  disabled: 0.45,
  pressed: 0.82,
  overlay: 0.5,
} as const;

export type IconSizeTheme = keyof typeof icon.size;
export type SpacingTheme = keyof typeof spacing;
// type Leaves<T> = T extends object
//   ? {
//       [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never
//         ? ''
//         : `.${Leaves<T[K]>}`}`;
//     }[keyof T]
//   : never;

export type TypographyTheme = keyof typeof typography;
export type FontSizeTheme = keyof typeof fontSize;
