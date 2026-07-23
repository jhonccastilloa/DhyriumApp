import AppText, { AppTextProps } from './AppText';
interface AppLabelProps extends AppTextProps {}

const AppLabel = ({ ...props }: AppLabelProps) => {
  return <AppText variant="text.xs.bold" {...props} />;
};

export default AppLabel;
