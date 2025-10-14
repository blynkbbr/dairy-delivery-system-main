import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES } from '../constants';
import type { AgentTabParamList } from '../types';

// Screen imports
import {
  AgentDashboardScreen,
  AgentRoutesScreen,
  AgentDeliveriesScreen,
  AgentProfileScreen,
} from '../screens/agent';

const Tab = createBottomTabNavigator<AgentTabParamList>();

const AgentTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'speedometer' : 'speedometer-outline';
              break;
            case 'Routes':
              iconName = focused ? 'map' : 'map-outline';
              break;
            case 'Deliveries':
              iconName = focused ? 'car' : 'car-outline';
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
        name="Dashboard" 
        component={AgentDashboardScreen}
        options={{
          title: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Routes" 
        component={AgentRoutesScreen}
        options={{
          title: 'Routes',
        }}
      />
      <Tab.Screen 
        name="Deliveries" 
        component={AgentDeliveriesScreen}
        options={{
          title: 'Deliveries',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={AgentProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default AgentTabNavigator;