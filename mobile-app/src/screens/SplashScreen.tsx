import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import Screen from '../components/Screen';

const SplashScreen: React.FC = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.3);
  const rotateAnim = new Animated.Value(0);

  useEffect(() => {
    // Animate logo appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation for loading indicator
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    rotateAnimation.start();

    return () => {
      rotateAnimation.stop();
    };
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Screen safeArea={false} statusBarStyle="light">
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.container}
      >
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name="water" size={80} color={COLORS.white} />
          </View>
          
          <Text style={styles.title}>DairyFresh</Text>
          <Text style={styles.subtitle}>Fresh Dairy, Delivered Daily</Text>
        </Animated.View>

        <View style={styles.loadingContainer}>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons
              name="refresh-outline"
              size={24}
              color={COLORS.white}
            />
          </Animated.View>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </LinearGradient>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  title: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 150,
  },
  
  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    marginLeft: SPACING.sm,
    opacity: 0.8,
  },
  
  footer: {
    position: 'absolute',
    bottom: 50,
  },
  
  version: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.7,
  },
});

export default SplashScreen;