import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import type { RootStackParamList } from '../types';
import Screen from '../components/Screen';
import Button from '../components/Button';

type AuthScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Auth'>;

const AuthScreen: React.FC = () => {
  const navigation = useNavigation<AuthScreenNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  const features = [
    {
      icon: 'water' as keyof typeof Ionicons.glyphMap,
      title: 'Fresh Dairy Products',
      description: 'Premium quality milk and dairy products delivered fresh to your doorstep',
    },
    {
      icon: 'time' as keyof typeof Ionicons.glyphMap,
      title: 'Daily Delivery',
      description: 'Convenient scheduling with flexible delivery times that fit your routine',
    },
    {
      icon: 'shield-checkmark' as keyof typeof Ionicons.glyphMap,
      title: 'Quality Guaranteed',
      description: 'Hygienically processed and quality tested products from trusted sources',
    },
    {
      icon: 'card' as keyof typeof Ionicons.glyphMap,
      title: 'Flexible Payment',
      description: 'Multiple payment options including prepaid, postpaid, and digital wallets',
    },
  ];

  return (
    <Screen safeArea={false} statusBarStyle="light">
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.logoContainer}>
              <Ionicons name="water" size={60} color={COLORS.white} />
            </View>
            
            <Text style={styles.title}>Welcome to DairyFresh</Text>
            <Text style={styles.subtitle}>
              Your trusted partner for fresh dairy products delivered daily
            </Text>
          </View>

          {/* Features Section */}
          <View style={styles.featuresContainer}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons
                    name={feature.icon}
                    size={24}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaText}>
              Join thousands of satisfied customers who trust us for their daily dairy needs
            </Text>
            
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              variant="secondary"
              size="large"
              style={styles.ctaButton}
            />
            
            <Text style={styles.loginHint}>
              Already have an account? You'll be able to login on the next screen
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
  },
  
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  title: {
    fontSize: FONT_SIZES['3xl'],
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  
  featuresContainer: {
    marginBottom: SPACING['3xl'],
  },
  
  featureItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  
  featureContent: {
    flex: 1,
  },
  
  featureTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  
  featureDescription: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.8,
    lineHeight: 20,
  },
  
  ctaSection: {
    alignItems: 'center',
    marginTop: 'auto',
  },
  
  ctaText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  
  ctaButton: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  
  loginHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default AuthScreen;