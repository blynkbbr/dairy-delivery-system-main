import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import Screen from '../../components/Screen';
import { useNotifications } from '../../contexts/NotificationContext';

interface NotificationSettings {
  orderUpdates: boolean;
  deliveryUpdates: boolean;
  subscriptionReminders: boolean;
  promotions: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

const STORAGE_KEY = 'notification_settings';

const NotificationSettingsScreen: React.FC = () => {
  const { requestPermissions, getPermissions } = useNotifications();
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    deliveryUpdates: true,
    subscriptionReminders: true,
    promotions: true,
    emailNotifications: true,
    pushNotifications: true,
  });
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  const checkPermissions = async () => {
    try {
      const permissions = await getPermissions();
      setPermissionStatus(permissions.status);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  const handleRequestPermissions = async () => {
    try {
      const permissions = await requestPermissions();
      setPermissionStatus(permissions.status);
      
      if (permissions.status === 'granted') {
        Alert.alert('Success', 'Push notifications have been enabled.');
      } else {
        Alert.alert(
          'Permission Denied',
          'Push notifications are disabled. You can enable them in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => {
              // On real device, this would open app settings
              console.log('Would open app settings');
            }},
          ]
        );
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
      Alert.alert('Error', 'Failed to request notification permissions.');
    }
  };

  const notificationTypes = [
    {
      key: 'orderUpdates' as keyof NotificationSettings,
      title: 'Order Updates',
      description: 'Get notified when your order status changes',
      icon: 'receipt-outline',
    },
    {
      key: 'deliveryUpdates' as keyof NotificationSettings,
      title: 'Delivery Updates',
      description: 'Real-time updates about your deliveries',
      icon: 'car-outline',
    },
    {
      key: 'subscriptionReminders' as keyof NotificationSettings,
      title: 'Subscription Reminders',
      description: 'Reminders about upcoming subscription deliveries',
      icon: 'calendar-outline',
    },
    {
      key: 'promotions' as keyof NotificationSettings,
      title: 'Promotions & Offers',
      description: 'Special offers and discount notifications',
      icon: 'pricetag-outline',
    },
  ];

  const getPermissionStatusColor = () => {
    switch (permissionStatus) {
      case 'granted':
        return COLORS.success;
      case 'denied':
        return COLORS.error;
      default:
        return COLORS.warning;
    }
  };

  const getPermissionStatusText = () => {
    switch (permissionStatus) {
      case 'granted':
        return 'Enabled';
      case 'denied':
        return 'Disabled';
      default:
        return 'Unknown';
    }
  };

  return (
    <Screen>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notification Settings</Text>
          <Text style={styles.headerSubtitle}>
            Manage how you receive notifications from DairyFresh
          </Text>
        </View>

        {/* Push Notification Permission Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notification Permission</Text>
          <View style={styles.permissionCard}>
            <View style={styles.permissionInfo}>
              <Ionicons name="notifications-outline" size={24} color={getPermissionStatusColor()} />
              <View style={styles.permissionText}>
                <Text style={styles.permissionTitle}>Push Notifications</Text>
                <Text style={[styles.permissionStatus, { color: getPermissionStatusColor() }]}>
                  {getPermissionStatusText()}
                </Text>
              </View>
            </View>
            {permissionStatus !== 'granted' && (
              <TouchableOpacity style={styles.enableButton} onPress={handleRequestPermissions}>
                <Text style={styles.enableButtonText}>Enable</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notification Type Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.settingsCard}>
            {notificationTypes.map((type) => (
              <View key={type.key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name={type.icon as any} size={24} color={COLORS.textSecondary} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>{type.title}</Text>
                    <Text style={styles.settingDescription}>{type.description}</Text>
                  </View>
                </View>
                <Switch
                  value={settings[type.key]}
                  onValueChange={(value) => handleSettingChange(type.key, value)}
                  trackColor={{ false: COLORS.gray[300], true: COLORS.primaryLight }}
                  thumbColor={settings[type.key] ? COLORS.primary : COLORS.gray[400]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Ionicons name="mail-outline" size={24} color={COLORS.textSecondary} />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Email Notifications</Text>
                  <Text style={styles.settingDescription}>
                    Receive notifications via email
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.emailNotifications}
                onValueChange={(value) => handleSettingChange('emailNotifications', value)}
                trackColor={{ false: COLORS.gray[300], true: COLORS.primaryLight }}
                thumbColor={settings.emailNotifications ? COLORS.primary : COLORS.gray[400]}
              />
            </View>
          </View>
        </View>

        {/* Help Section */}
        <View style={styles.section}>
          <View style={styles.helpCard}>
            <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
            <View style={styles.helpText}>
              <Text style={styles.helpTitle}>About Notifications</Text>
              <Text style={styles.helpDescription}>
                You can change these settings anytime. Push notifications require device permission 
                which can be managed in your phone's settings.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },

  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },

  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },

  permissionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  permissionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  permissionText: {
    marginLeft: SPACING.md,
    flex: 1,
  },

  permissionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  permissionStatus: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },

  enableButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },

  enableButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.white,
  },

  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.md,
  },

  settingText: {
    marginLeft: SPACING.md,
    flex: 1,
  },

  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },

  helpCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  helpText: {
    marginLeft: SPACING.md,
    flex: 1,
  },

  helpTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },

  helpDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});

export default NotificationSettingsScreen;