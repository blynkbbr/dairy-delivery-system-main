import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  ViewStyle,
  StatusBar,
} from 'react-native';
import { COLORS } from '../constants';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  statusBarStyle?: 'light' | 'dark';
}

const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  safeArea = true,
  backgroundColor = COLORS.background,
  style,
  contentContainerStyle,
  statusBarStyle = 'dark',
}) => {
  const containerStyle = [
    styles.container,
    { backgroundColor },
    style,
  ];

  const Container = safeArea ? SafeAreaView : View;
  const Content = scrollable ? ScrollView : View;

  return (
    <Container style={containerStyle}>
      <StatusBar
        barStyle={`${statusBarStyle}-content`}
        backgroundColor={backgroundColor}
        translucent={false}
      />
      <Content
        style={scrollable ? undefined : styles.content}
        contentContainerStyle={scrollable ? [styles.scrollContent, contentContainerStyle] : undefined}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </Content>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default Screen;