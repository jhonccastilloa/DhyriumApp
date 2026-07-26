import type { SpacingTheme } from '@/styles/theme/tokens';
import { createTokenVariants } from '@/styles/createTokenVariants';
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
      gap: createTokenVariants(theme.spacing, 'gap'),
      p: createTokenVariants(theme.spacing, 'padding'),
      pv: createTokenVariants(theme.spacing, 'paddingVertical'),
      ph: createTokenVariants(theme.spacing, 'paddingHorizontal'),
      pt: createTokenVariants(theme.spacing, 'paddingTop'),
      pb: createTokenVariants(theme.spacing, 'paddingBottom'),
      pl: createTokenVariants(theme.spacing, 'paddingLeft'),
      pr: createTokenVariants(theme.spacing, 'paddingRight'),
    },
  },
  circle: { borderRadius: '50%' },
}));

export default AppFlex;
