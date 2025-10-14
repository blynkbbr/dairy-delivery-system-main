import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { notificationService, NotificationData } from '../services/notifications';
import { useAuth } from '../store';

interface NotificationContextType {
  sendLocalNotification: (data: NotificationData) => Promise<string>;
  scheduleLocalNotification: (data: NotificationData, trigger: Date | number) => Promise<string>;
  cancelNotification: (id: string) => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  requestPermissions: () => Promise<Notifications.NotificationPermissionsStatus>;
  getPermissions: () => Promise<Notifications.NotificationPermissionsStatus>;
  getPushToken: () => string | null;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Initialize notifications when user is authenticated
    if (isAuthenticated) {
      initializeNotifications();
    }

    // Set up notification listeners
    notificationListener.current = notificationService.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      handleNotificationReceived(notification);
    });

    responseListener.current = notificationService.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      handleNotificationResponse(response);
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);

  const initializeNotifications = async () => {
    try {
      const token = await notificationService.initialize();
      if (token && user) {
        // Send token to backend to associate with user
        console.log('Push token:', token);
        // TODO: Send token to backend
        // await userService.updatePushToken(user.id, token);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  const handleNotificationReceived = (notification: Notifications.Notification) => {
    // Handle notification received while app is in foreground
    const { type, orderId, deliveryId, subscriptionId } = notification.request.content.data;
    
    console.log('Received notification type:', type);
    
    // You can show custom in-app notification or update app state here
    // For example, refresh orders, deliveries, etc.
  };

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    // Handle notification tap/interaction
    const { type, orderId, deliveryId, subscriptionId } = response.notification.request.content.data;
    
    console.log('Notification tapped, type:', type);
    
    // Navigate to relevant screen based on notification type
    switch (type) {
      case 'order_update':
        if (orderId) {
          // Navigate to order details
          navigation.navigate('Orders' as never);
        }
        break;
      case 'delivery_update':
        if (deliveryId) {
          // Navigate to delivery tracking
          if (user?.role === 'agent') {
            navigation.navigate('Deliveries' as never);
          } else {
            navigation.navigate('Orders' as never);
          }
        }
        break;
      case 'subscription_reminder':
        if (subscriptionId) {
          // Navigate to subscriptions
          navigation.navigate('Subscriptions' as never);
        }
        break;
      case 'promotion':
        // Navigate to products or home
        navigation.navigate('Products' as never);
        break;
      default:
        // Navigate to home
        navigation.navigate('Home' as never);
    }
  };

  const sendLocalNotification = async (data: NotificationData): Promise<string> => {
    return await notificationService.sendLocalNotification(data);
  };

  const scheduleLocalNotification = async (data: NotificationData, trigger: Date | number): Promise<string> => {
    return await notificationService.scheduleLocalNotification(data, trigger);
  };

  const cancelNotification = async (id: string): Promise<void> => {
    await notificationService.cancelNotification(id);
  };

  const cancelAllNotifications = async (): Promise<void> => {
    await notificationService.cancelAllNotifications();
  };

  const requestPermissions = async (): Promise<Notifications.NotificationPermissionsStatus> => {
    return await notificationService.requestPermissions();
  };

  const getPermissions = async (): Promise<Notifications.NotificationPermissionsStatus> => {
    return await notificationService.getPermissions();
  };

  const getPushToken = (): string | null => {
    return notificationService.getPushToken();
  };

  const contextValue: NotificationContextType = {
    sendLocalNotification,
    scheduleLocalNotification,
    cancelNotification,
    cancelAllNotifications,
    requestPermissions,
    getPermissions,
    getPushToken,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};