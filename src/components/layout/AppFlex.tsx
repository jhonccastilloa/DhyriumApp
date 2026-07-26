import type { SpacingTheme } from '@/styles/theme/tokens';
import type { StyleProp, ViewProps, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface AppFlexBaseProps extends Omit<ViewProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  direction?: 'row' | 'column';
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  gap?: SpacingTheme;
  flex?: ViewStyle['flex'];
  flexGrow?: ViewStyle['flexGrow'];
  flexShrink?: ViewStyle['flexShrink'];
  flexBasis?: ViewStyle['flexBasis'];
  alignSelf?: ViewStyle['alignSelf'];
  height?: ViewStyle['height'];
  width?: ViewStyle['width'];
  size?: ViewStyle['height'];
  pv?: SpacingTheme;
  ph?: SpacingTheme;
  pt?: SpacingTheme;
  pb?: SpacingTheme;
  pl?: SpacingTheme;
  pr?: SpacingTheme;
  p?: SpacingTheme;
  r?: ViewStyle['borderRadius'];
  flexWrap?: ViewStyle['flexWrap'];
}

export type AppFlexProps =
  | (AppFlexBaseProps & { circle?: false })
  | (AppFlexBaseProps & { circle: true; size: ViewStyle['height'] });

type SpacingStyleProperty =
  | 'gap'
  | 'padding'
  | 'paddingVertical'
  | 'paddingHorizontal'
  | 'paddingTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight';

type SpacingVariant = Partial<Record<SpacingStyleProperty, number>>;

const createSpacingVariants = (
  spacing: Readonly<Record<SpacingTheme, number>>,
  property: SpacingStyleProperty,
): Record<SpacingTheme, SpacingVariant> => {
  const variants = {} as Record<SpacingTheme, SpacingVariant>;

  (Object.keys(spacing) as SpacingTheme[]).forEach(key => {
    variants[key] = { [property]: spacing[key] };
  });

  return variants;
};

const AppFlex = ({
  children,
  style,
  direction = 'column',
  align,
  justify,
  gap = 'none',
  flex,
  flexGrow,
  flexShrink,
  flexBasis,
  alignSelf,
  height,
  width,
  size,
  circle,
  pv,
  ph,
  p,
  r,
  pb,
  pl,
  pr,
  pt,
  flexWrap,
  ...rest
}: AppFlexProps) => {
  styles.useVariants({
    gap,
    p,
    pv,
    ph,
    pt,
    pb,
    pl,
    pr,
  });

  return (
    <View
      {...rest}
      style={[
        {
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          flex,
          flexGrow,
          height: size ?? height,
          width: size ?? width,
          flexShrink,
          flexBasis,
          alignSelf,
          flexWrap: flexWrap,
        },
        styles.container,
        r !== undefined && { borderRadius: r },
        circle && styles.circle,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create(theme => ({
  container: {
    variants: {
      gap: createSpacingVariants(theme.spacing, 'gap'),
      p: createSpacingVariants(theme.spacing, 'padding'),
      pv: createSpacingVariants(theme.spacing, 'paddingVertical'),
      ph: createSpacingVariants(theme.spacing, 'paddingHorizontal'),
      pt: createSpacingVariants(theme.spacing, 'paddingTop'),
      pb: createSpacingVariants(theme.spacing, 'paddingBottom'),
      pl: createSpacingVariants(theme.spacing, 'paddingLeft'),
      pr: createSpacingVariants(theme.spacing, 'paddingRight'),
    },
  },
  circle: { borderRadius: '50%' },
}));

export default AppFlex;
