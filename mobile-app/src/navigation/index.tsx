import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../store';
import { STORAGE_KEYS } from '../constants';
import type { RootStackParamList } from '../types';

// Screen imports
import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import LoginScreen from '../screens/LoginScreen';
import OTPVerificationScreen from '../screens/OTPVerificationScreen';
import CustomerTabNavigator from './CustomerTabNavigator';
import AgentTabNavigator from './AgentTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { isAuthenticated, loadUser, user, isLoading } = useAuth();
  const [initializing, setInitializing] = React.useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if user is already authenticated
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          await loadUser();
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
  }, [loadUser]);

  if (initializing || isLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Authentication Stack
          <>
            <Stack.Screen name="Auth" component={AuthScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen 
              name="OTPVerification" 
              component={OTPVerificationScreen} 
            />
          </>
        ) : (
          // Authenticated Stack
          <>
            {user?.role === 'agent' ? (
              <Stack.Screen name="AgentTabs" component={AgentTabNavigator} />
            ) : (
              <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
