import { IconName } from './iconRegistry';
import { IconColorTheme } from '@/styles/theme/semanticColors';
import { IconSizeTheme } from '@/styles/theme/tokens';

export interface IconBaseProps {
  iconLeft?: IconName;
  iconRight?: IconName;
  iconSize?: IconSizeTheme;
  iconColor?: IconColorTheme;
}
