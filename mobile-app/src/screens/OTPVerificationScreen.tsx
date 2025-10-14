import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, TextInput as RNTextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, ERROR_MESSAGES, TIME } from '../constants';
import { validateOTP } from '../utils';
import { useAuth, useNotification } from '../store';
import type { RootStackParamList, OTPVerificationForm } from '../types';
import Screen from '../components/Screen';
import Button from '../components/Button';

type OTPVerificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'OTPVerification'>;
type OTPVerificationScreenRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationScreenNavigationProp>();
  const route = useRoute<OTPVerificationScreenRouteProp>();
  const { phoneNumber } = route.params;
  
  const { verifyOTP, login, isLoading } = useAuth();
  const { showNotification } = useNotification();
  
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OTPVerificationForm>();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          setCanResend(true);
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Set form value
    const otpString = newOtp.join('');
    setValue('otp', otpString);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (otpString.length === 6) {
      handleSubmit(onSubmit)();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmit = async (data?: OTPVerificationForm) => {
    const otpCode = data?.otp || otp.join('');
    
    if (!validateOTP(otpCode)) {
      showNotification('error', ERROR_MESSAGES.INVALID_OTP);
      return;
    }

    try {
      await verifyOTP(phoneNumber, otpCode);
      showNotification('success', 'Login successful!');
      // Navigation will be handled automatically by the root navigator
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      showNotification('error', errorMessage);
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      setValue('otp', '');
      inputRefs.current[0]?.focus();
    }
  };

  const handleResendOTP = async () => {
    try {
      await login(phoneNumber);
      setTimer(300);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setValue('otp', '');
      showNotification('success', 'New OTP sent successfully!');
      inputRefs.current[0]?.focus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend OTP';
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
          <Text style={styles.headerTitle}>Verify OTP</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="mail" size={40} color={COLORS.primary} />
            </View>
            
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>
              We've sent a 6-digit code to{'\n'}
              <Text style={styles.phoneNumber}>+91 {phoneNumber}</Text>
            </Text>
          </View>

          <View style={styles.otpSection}>
            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <RNTextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    digit && styles.otpInputFilled,
                    errors.otp && styles.otpInputError,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleOTPChange(index, value)}
                  onKeyPress={({ nativeEvent: { key } }) => handleKeyPress(index, key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={index === 0}
                />
              ))}
            </View>

            {errors.otp && (
              <Text style={styles.errorText}>{errors.otp.message}</Text>
            )}
          </View>

          <View style={styles.timerSection}>
            {timer > 0 ? (
              <Text style={styles.timerText}>
                Code expires in {formatTime(timer)}
              </Text>
            ) : (
              <Text style={styles.expiredText}>Code expired</Text>
            )}
          </View>

          <View style={styles.actionsSection}>
            <Button
              title="Verify OTP"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={otp.join('').length !== 6}
              style={styles.verifyButton}
            />

            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={!canResend || isLoading}
              style={[
                styles.resendButton,
                (!canResend || isLoading) && styles.resendButtonDisabled,
              ]}
            >
              <Text style={[
                styles.resendText,
                (!canResend || isLoading) && styles.resendTextDisabled,
              ]}>
                Didn't receive the code? Resend OTP
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={16} color={COLORS.info} />
            <Text style={styles.infoText}>
              Check your SMS inbox for the verification code
            </Text>
          </View>
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
  },
  
  phoneNumber: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  otpSection: {
    marginBottom: SPACING.xl,
  },
  
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    backgroundColor: COLORS.white,
  },
  
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10',
  },
  
  otpInputError: {
    borderColor: COLORS.error,
  },
  
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  
  timerSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  timerText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  
  expiredText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '500',
  },
  
  actionsSection: {
    marginBottom: SPACING.xl,
  },
  
  verifyButton: {
    marginBottom: SPACING.lg,
  },
  
  resendButton: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  
  resendButtonDisabled: {
    opacity: 0.5,
  },
  
  resendText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    textAlign: 'center',
  },
  
  resendTextDisabled: {
    color: COLORS.textLight,
  },
  
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
});

export default OTPVerificationScreen;