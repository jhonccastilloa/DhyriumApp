import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

const AppProgressBar = ({ value }: { value: number }) => (
  <View
    style={styles.track}
    accessibilityRole="progressbar"
    accessibilityValue={{ min: 0, max: 100, now: value }}
  >
    <View
      style={[
        styles.fill,
        { width: `${Math.min(100, Math.max(0, value))}%` },
      ]}
    />
  </View>
);

const styles = StyleSheet.create(theme => ({
  track: {
    width: '100%',
    height: 6,
    borderRadius: theme.radius.pill,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface.background.elements,
  },
  fill: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.graphics.default,
  },
}));

export default AppProgressBar;
