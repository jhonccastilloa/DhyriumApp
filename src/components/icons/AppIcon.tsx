import { IconSizeTheme } from '@/styles/theme/tokens';
import iconRegistry from './iconRegistry';
import type { IconName, IconVariant } from './iconRegistry';
import { TouchableOpacity } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { IconColorTheme } from '@/styles/theme/semanticColors';

interface AppIconProps {
  name: IconName;
  size?: IconSizeTheme | number;
  color?: IconColorTheme;
  mColor?: string;
  variant?: IconVariant;
  onPress?: () => void;
}

const AppIcon = ({
  name,
  size = 'md',
  color = 'primary',
  mColor,
  variant = 'default',
  onPress,
}: AppIconProps) => {
  const { theme } = useUnistyles();
  const IconComponent = iconRegistry[name];
  if (!IconComponent) {
    return null;
  }
  if (onPress)
    return (
      <TouchableOpacity onPress={onPress}>
        {IconComponent({
          size: typeof size === 'number' ? size : theme.icon.size[size],
          color: mColor || theme.colors.icon[color],
          variant,
        })}
      </TouchableOpacity>
    );
  return IconComponent({
    size: typeof size === 'number' ? size : theme.icon.size[size],
    color: mColor || theme.colors.icon[color],
    variant,
  });
};

export default AppIcon;
