import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  type: 'order_update' | 'delivery_update' | 'subscription_reminder' | 'promotion';
  orderId?: string;
  deliveryId?: string;
  subscriptionId?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<string | null> {
    try {
      // Check if device supports push notifications
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return null;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission denied');
        return null;
      }

      // Get push token
      const token = await this.getExpoPushToken();
      this.expoPushToken = token;

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await this.setNotificationChannelAsync();
      }

      console.log('Push notifications initialized successfully');
      return token;
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return null;
    }
  }

  /**
   * Get Expo push token
   */
  private async getExpoPushToken(): Promise<string> {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    
    if (!projectId) {
      throw new Error('Project ID not found. Make sure EAS is configured.');
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    return token.data;
  }

  /**
   * Set up notification channel for Android
   */
  private async setNotificationChannelAsync(): Promise<void> {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'DairyFresh Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      lockscreenVisibility: Notifications.AndroidVisibilityBehaviour.PUBLIC,
      bypassDnd: false,
    });

    // Create specific channels for different notification types
    const channels = [
      {
        id: 'order_updates',
        name: 'Order Updates',
        description: 'Notifications about order status changes',
        importance: Notifications.AndroidImportance.HIGH,
      },
      {
        id: 'delivery_updates',
        name: 'Delivery Updates',
        description: 'Notifications about delivery status and tracking',
        importance: Notifications.AndroidImportance.HIGH,
      },
      {
        id: 'subscription_reminders',
        name: 'Subscription Reminders',
        description: 'Reminders about subscription deliveries',
        importance: Notifications.AndroidImportance.DEFAULT,
      },
      {
        id: 'promotions',
        name: 'Promotions',
        description: 'Special offers and promotional notifications',
        importance: Notifications.AndroidImportance.LOW,
      },
    ];

    for (const channel of channels) {
      await Notifications.setNotificationChannelAsync(channel.id, {
        name: channel.name,
        description: channel.description,
        importance: channel.importance,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
      });
    }
  }

  /**
   * Get current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Send local notification
   */
  async sendLocalNotification(notificationData: NotificationData): Promise<string> {
    const channelId = this.getChannelId(notificationData.type);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: {
          ...notificationData.data,
          type: notificationData.type,
          orderId: notificationData.orderId,
          deliveryId: notificationData.deliveryId,
          subscriptionId: notificationData.subscriptionId,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
      identifier: channelId,
    });

    return notificationId;
  }

  /**
   * Schedule local notification
   */
  async scheduleLocalNotification(
    notificationData: NotificationData,
    trigger: Date | number
  ): Promise<string> {
    const channelId = this.getChannelId(notificationData.type);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: notificationData.title,
        body: notificationData.body,
        data: {
          ...notificationData.data,
          type: notificationData.type,
          orderId: notificationData.orderId,
          deliveryId: notificationData.deliveryId,
          subscriptionId: notificationData.subscriptionId,
        },
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: trigger instanceof Date ? trigger : { seconds: trigger },
      identifier: channelId,
    });

    return notificationId;
  }

  /**
   * Cancel notification
   */
  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get notification permissions
   */
  async getPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.getPermissionsAsync();
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<Notifications.NotificationPermissionsStatus> {
    return await Notifications.requestPermissionsAsync();
  }

  /**
   * Add notification received listener
   */
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Add notification response received listener
   */
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Get channel ID based on notification type
   */
  private getChannelId(type: NotificationData['type']): string {
    switch (type) {
      case 'order_update':
        return 'order_updates';
      case 'delivery_update':
        return 'delivery_updates';
      case 'subscription_reminder':
        return 'subscription_reminders';
      case 'promotion':
        return 'promotions';
      default:
        return 'default';
    }
  }

  /**
   * Create notification data for order updates
   */
  static createOrderUpdateNotification(
    orderId: string,
    status: string,
    additionalData?: Record<string, any>
  ): NotificationData {
    const statusMessages = {
      pending: 'Your order is being processed',
      confirmed: 'Your order has been confirmed',
      shipped: 'Your order is on the way',
      delivered: 'Your order has been delivered',
      cancelled: 'Your order has been cancelled',
    };

    return {
      type: 'order_update',
      orderId,
      title: 'Order Update',
      body: statusMessages[status as keyof typeof statusMessages] || `Order status: ${status}`,
      data: {
        status,
        ...additionalData,
      },
    };
  }

  /**
   * Create notification data for delivery updates
   */
  static createDeliveryUpdateNotification(
    deliveryId: string,
    status: string,
    estimatedTime?: string,
    additionalData?: Record<string, any>
  ): NotificationData {
    const statusMessages = {
      scheduled: 'Your delivery has been scheduled',
      in_transit: 'Your delivery is on the way',
      out_for_delivery: 'Your delivery is out for delivery',
      delivered: 'Your order has been delivered',
      failed: 'Delivery attempt failed',
    };

    let body = statusMessages[status as keyof typeof statusMessages] || `Delivery status: ${status}`;
    if (estimatedTime && (status === 'in_transit' || status === 'out_for_delivery')) {
      body += ` - Estimated arrival: ${estimatedTime}`;
    }

    return {
      type: 'delivery_update',
      deliveryId,
      title: 'Delivery Update',
      body,
      data: {
        status,
        estimatedTime,
        ...additionalData,
      },
    };
  }

  /**
   * Create notification data for subscription reminders
   */
  static createSubscriptionReminderNotification(
    subscriptionId: string,
    productName: string,
    deliveryDate: string,
    additionalData?: Record<string, any>
  ): NotificationData {
    return {
      type: 'subscription_reminder',
      subscriptionId,
      title: 'Subscription Reminder',
      body: `Your ${productName} subscription will be delivered on ${deliveryDate}`,
      data: {
        productName,
        deliveryDate,
        ...additionalData,
      },
    };
  }

  /**
   * Create notification data for promotions
   */
  static createPromotionNotification(
    title: string,
    message: string,
    additionalData?: Record<string, any>
  ): NotificationData {
    return {
      type: 'promotion',
      title,
      body: message,
      data: additionalData,
    };
  }
}

// Export singleton instance
export const notificationService = new NotificationService();