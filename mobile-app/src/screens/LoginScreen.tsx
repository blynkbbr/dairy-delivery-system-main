import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, ERROR_MESSAGES } from '../constants';
import { validatePhoneNumber } from '../utils';
import { useAuth, useNotification } from '../store';
import type { RootStackParamList, LoginForm } from '../types';
import Screen from '../components/Screen';
import Button from '../components/Button';
import TextInput from '../components/TextInput';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { login, isLoading } = useAuth();
  const { showNotification } = useNotification();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    defaultValues: {
      phone_number: '',
    },
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.phone_number);
      showNotification('success', 'OTP sent successfully!');
      navigation.navigate('OTPVerification', { phoneNumber: data.phone_number });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      showNotification('error', errorMessage);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Login</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="phone-portrait" size={40} color={COLORS.primary} />
            </View>
            
            <Text style={styles.title}>Enter Your Phone Number</Text>
            <Text style={styles.subtitle}>
              We'll send you a verification code to confirm your identity
            </Text>
          </View>

          <View style={styles.formSection}>
            <Controller
              control={control}
              name="phone_number"
              rules={{
                required: ERROR_MESSAGES.REQUIRED_FIELD,
                validate: (value) => 
                  validatePhoneNumber(value) || ERROR_MESSAGES.INVALID_PHONE,
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Phone Number"
                  placeholder="Enter 10-digit mobile number"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.phone_number?.message}
                  leftIcon="call"
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoComplete="tel"
                  textContentType="telephoneNumber"
                />
              )}
            />

            <Button
              title="Send OTP"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={styles.submitButton}
            />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
              <Text style={styles.infoText}>Your privacy is protected</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="time" size={16} color={COLORS.info} />
              <Text style={styles.infoText}>OTP expires in 5 minutes</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="refresh" size={16} color={COLORS.warning} />
              <Text style={styles.infoText}>You can request a new OTP if needed</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  backButton: {
    padding: SPACING.sm,
    marginLeft: -SPACING.sm,
  },
  
  headerTitle: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  
  headerSpacer: {
    width: 40,
  },
  
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING['2xl'],
  },
  
  welcomeSection: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  title: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: SPACING.md,
  },
  
  formSection: {
    marginBottom: SPACING['2xl'],
  },
  
  submitButton: {
    marginTop: SPACING.lg,
  },
  
  infoSection: {
    marginBottom: SPACING.xl,
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  
  footerText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  
  linkText: {
    color: COLORS.primary,
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;