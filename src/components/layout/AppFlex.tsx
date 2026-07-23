import { SpacingTheme } from '@/styles/theme/tokens';
import React, { ReactNode } from 'react';
import { View, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

type FlexVariant = 'default' | 'spread' | 'center' | 'end';

export interface AppFlexProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  direction?: 'row' | 'column';
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  gap?: SpacingTheme;
  variant?: FlexVariant;
  flex?: ViewStyle['flex'];
  flexShrink?: ViewStyle['flexShrink'];
  height?: ViewStyle['height'];
  width?: ViewStyle['width'];
  size?: ViewStyle['height'];
  circle?: boolean;
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

const getVariantStyle = (variant?: FlexVariant): ViewStyle => {
  switch (variant) {
    case 'spread':
      return { justifyContent: 'space-between' };
    case 'center':
      return { justifyContent: 'center', alignItems: 'center' };
    case 'end':
      return { justifyContent: 'flex-end' };
    default:
      return {};
  }
};

const AppFlex = ({
  children,
  style,
  direction = 'column',
  align,
  justify,
  gap = 'none',
  variant = 'default',
  flex = undefined,
  flexShrink,
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
}: AppFlexProps) => {
  // const theme = useTheme();
  const { theme } = useUnistyles();

  return (
    <View
      style={[
        {
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          gap: theme.spacing[gap],
          flex,
          height: size ?? height,
          width: size ?? width,
          flexShrink,
          flexWrap: flexWrap,
        },
        pt && { paddingTop: theme.spacing[pt] },
        pb && { paddingBottom: theme.spacing[pb] },
        pl && { paddingLeft: theme.spacing[pl] },
        pr && { paddingRight: theme.spacing[pr] },
        pv && { paddingVertical: theme.spacing[pv] },
        ph && { paddingHorizontal: theme.spacing[ph] },
        p && { padding: theme.spacing[p] },
        !!r && { borderRadius: r },
        circle && styles.circle,
        getVariantStyle(variant),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: { borderRadius: '50%' },
});

export default AppFlex;
