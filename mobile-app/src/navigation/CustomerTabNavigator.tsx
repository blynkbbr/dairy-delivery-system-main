import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../constants';
import type { CustomerTabParamList } from '../types';

// Screen imports
import {
  CustomerHomeScreen,
  ProductsScreen,
  CartScreen,
  OrdersScreen,
  SubscriptionManagementScreen,
  CustomerProfileScreen,
} from '../screens/customer';

// Custom components
import { useCart } from '../store';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

const CustomerTabNavigator: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'storefront' : 'storefront-outline';
              break;
            case 'Cart':
              iconName = focused ? 'bag' : 'bag-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Subscriptions':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '500',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={CustomerHomeScreen}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{
          title: 'Products',
        }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'Cart',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.error,
            color: COLORS.white,
            fontSize: FONT_SIZES.xs,
            minWidth: 18,
            height: 18,
          },
        }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          title: 'Orders',
        }}
      />
      <Tab.Screen 
        name="Subscriptions" 
        component={SubscriptionManagementScreen}
        options={{
          title: 'Subscriptions',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={CustomerProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default CustomerTabNavigator;