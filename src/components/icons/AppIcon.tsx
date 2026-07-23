import { IconSizeTheme } from '@/styles/theme/tokens';
import iconRegistry, { IconName } from './iconRegistry';
import { TouchableOpacity } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';
import { IconColorTheme } from '@/styles/theme/semanticColors';

interface AppIconProps {
  name: IconName;
  size?: IconSizeTheme;
  color?: IconColorTheme;
  mColor?: string;
  onPress?: () => void;
}

const AppIcon = ({
  name,
  size = 'md',
  color = 'primary',
  mColor,
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
        })}
      </TouchableOpacity>
    );
  return IconComponent({
    size: typeof size === 'number' ? size : theme.icon.size[size],
    color: mColor || theme.colors.icon[color],
  });
};

export default AppIcon;
