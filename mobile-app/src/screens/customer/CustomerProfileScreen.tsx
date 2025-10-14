import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { useUser, useAuth } from '../../store';
import Screen from '../../components/Screen';
import Button from '../../components/Button';

const CustomerProfileScreen: React.FC = () => {
  const { user } = useUser();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const menuItems = [
    { title: 'Personal Information', icon: 'person-outline', onPress: () => {} },
    { title: 'Delivery Addresses', icon: 'location-outline', onPress: () => {} },
    { title: 'Payment Methods', icon: 'card-outline', onPress: () => {} },
    { title: 'Order History', icon: 'receipt-outline', onPress: () => {} },
    { title: 'Notifications', icon: 'notifications-outline', onPress: () => {} },
    { title: 'Help & Support', icon: 'help-circle-outline', onPress: () => {} },
    { title: 'About', icon: 'information-circle-outline', onPress: () => {} },
  ];

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* User Info */}
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={COLORS.white} />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
              <Text style={styles.userPhone}>+91 {user?.phone_number}</Text>
            </View>
          </View>

          {/* Menu Items */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem} onPress={item.onPress}>
                <Ionicons name={item.icon} size={24} color={COLORS.textSecondary} />
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <Button
              title="Logout"
              onPress={handleLogout}
              variant="outline"
              style={styles.logoutButton}
            />
          </View>
        </ScrollView>
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
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  
  content: {
    flex: 1,
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
  },
  
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.lg,
  },
  
  userDetails: {
    flex: 1,
  },
  
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  userPhone: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  
  menuSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.xl,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  
  menuItemText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
  },
  
  logoutSection: {
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },
  
  logoutButton: {
    borderColor: COLORS.error,
  },
});

export default CustomerProfileScreen;
