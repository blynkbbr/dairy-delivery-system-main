import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import Screen from '../../components/Screen';
import { useAuth } from '../../store';

const AgentProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const profileMenuItems = [
    {
      id: 'personal-info',
      title: 'Personal Information',
      icon: 'person-outline',
      onPress: () => console.log('Personal Info'),
    },
    {
      id: 'delivery-stats',
      title: 'Delivery Statistics',
      icon: 'stats-chart-outline',
      onPress: () => console.log('Delivery Stats'),
    },
    {
      id: 'vehicle-info',
      title: 'Vehicle Information',
      icon: 'car-outline',
      onPress: () => console.log('Vehicle Info'),
    },
    {
      id: 'earnings',
      title: 'Earnings & Payments',
      icon: 'wallet-outline',
      onPress: () => console.log('Earnings'),
    },
    {
      id: 'notifications',
      title: 'Notification Settings',
      icon: 'notifications-outline',
      onPress: () => console.log('Notifications'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help-circle-outline',
      onPress: () => console.log('Help'),
    },
    {
      id: 'about',
      title: 'About',
      icon: 'information-circle-outline',
      onPress: () => console.log('About'),
    },
  ];

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.primary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name || 'Delivery Agent'}</Text>
              <Text style={styles.userRole}>Delivery Agent</Text>
              <Text style={styles.userPhone}>{user?.phoneNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {profileMenuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={COLORS.textSecondary}
                  style={styles.menuIcon}
                />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons
              name="log-out-outline"
              size={24}
              color={COLORS.error}
              style={styles.logoutIcon}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.lg,
  },
  
  userInfo: {
    flex: 1,
  },
  
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  userRole: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  
  userPhone: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  menuContainer: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  menuIcon: {
    marginRight: SPACING.md,
  },
  
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  
  footer: {
    marginTop: 'auto',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  
  logoutIcon: {
    marginRight: SPACING.sm,
  },
  
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
  },
});

export default AgentProfileScreen;