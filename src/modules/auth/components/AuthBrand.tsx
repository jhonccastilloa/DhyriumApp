import AppIcon from '@/components/icons/AppIcon';
import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import { StyleSheet } from 'react-native-unistyles';

const AuthBrand = () => {
  return (
    <AppFlex direction="row" align="center" gap="sm">
      <AppIcon name="myLogo" size="xl" />
      <AppFlex gap="none">
        <AppText variant="title.l" color="headings" style={styles.name}>
          DHYRIUM
        </AppText>
        <AppText variant="overline" color="link">
          SAA
        </AppText>
      </AppFlex>
    </AppFlex>
  );
};

const styles = StyleSheet.create({
  name: {
    letterSpacing: 2,
  },
});

export default AuthBrand;
