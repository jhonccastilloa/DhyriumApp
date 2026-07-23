import AppFlex from '@/components/layout/AppFlex';
import AppText from '@/components/typography/AppText';
import { StyleSheet } from 'react-native-unistyles';

interface AuthHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

const AuthHero = ({ eyebrow, title, description }: AuthHeroProps) => {
  return (
    <AppFlex gap="sm">
      <AppText variant="overline" color="link">
        {eyebrow}
      </AppText>
      <AppText variant="title.xxl" color="headings">
        {title}
      </AppText>
      <AppText variant="text.md.regular" color="body" style={styles.description}>
        {description}
      </AppText>
    </AppFlex>
  );
};

const styles = StyleSheet.create({
  description: {
    maxWidth: 300,
  },
});

export default AuthHero;
