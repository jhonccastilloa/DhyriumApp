import { ScrollView } from 'react-native';
import React from 'react';
import AppFlex, { AppFlexProps } from './AppFlex';
import { StyleSheet } from 'react-native-unistyles';

type ScreenContainerProps = AppFlexProps & {
  scrollable?: boolean;
  noPaddingTop?: boolean;
};
const ScreenContainer = ({
  style,
  scrollable = false,
  noPaddingTop = false,
  ...props
}: ScreenContainerProps) => {
  const sContainer = {
    ...styles.container,
    ...(noPaddingTop && { paddingTop: 0 }),
  };
  if (scrollable)
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <AppFlex style={[sContainer, style]} direction="column" {...props} />
      </ScrollView>
    );
  return (
    <AppFlex style={[sContainer, style]} direction="column" {...props} />
  );
};

// const useStyles = makeStyles(theme => ({
//   container: {
//     flex: 1,
//     padding: theme.spacing.md,
//     backgroundColor: theme.colors.background,
//   },
//   scrollContainer: { flexGrow: 1 },
// }));

const styles = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface.background.primary,
  },
  scrollContainer: { flexGrow: 1 },
}));
export default ScreenContainer;
