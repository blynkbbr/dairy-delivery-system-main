import logger from './logger';
import api from '../services/api';
import { useAuthStore } from '../store';

export interface ActionMetadata {
  [key: string]: any;
}

export interface ActionData {
  action: string;
  userId?: string;
  timestamp: string;
  metadata?: ActionMetadata;
}

/**
 * User action tracking utility
 * Provides methods to track various user interactions and optionally send them to the backend
 */
class ActionTracker {
  private isEnabled: boolean = true;
  private sendToBackend: boolean = true;

  /**
   * Enable or disable action tracking
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Enable or disable sending actions to backend
   */
  setSendToBackend(send: boolean): void {
    this.sendToBackend = send;
  }

  /**
   * Track a page view
   */
  trackPageView(page: string, metadata?: ActionMetadata): void {
    this.trackAction('page_view', {
      page,
      ...metadata,
    });
  }

  /**
   * Track a button click
   */
  trackClick(buttonId: string, page?: string, metadata?: ActionMetadata): void {
    this.trackAction('button_click', {
      buttonId,
      page,
      ...metadata,
    });
  }

  /**
   * Track a form submission
   */
  trackFormSubmit(formId: string, page?: string, metadata?: ActionMetadata): void {
    this.trackAction('form_submit', {
      formId,
      page,
      ...metadata,
    });
  }

  /**
   * Track a custom action
   */
  trackAction(action: string, metadata?: ActionMetadata): void {
    if (!this.isEnabled) return;

    const actionData: ActionData = {
      action,
      timestamp: new Date().toISOString(),
      metadata: metadata || {},
    };

    // Get user ID from auth store if available
    const user = useAuthStore.getState().user;
    if (user?.id) {
      actionData.userId = user.id;
    }

    // Log locally
    logger.info(`User Action: ${action}`, actionData);

    // Send to backend if enabled
    if (this.sendToBackend) {
      this.sendToBackendAsync(actionData).catch(error => {
        logger.error('Failed to send action to backend:', error);
      });
    }
  }

  /**
   * Send action data to backend asynchronously
   */
  private async sendToBackendAsync(actionData: ActionData): Promise<void> {
    try {
      await api.post('/actions/log', actionData);
    } catch (error) {
      // Don't throw - we don't want tracking to break the app
      logger.warn('Action tracking backend call failed:', error);
    }
  }

  /**
   * Track navigation between pages
   */
  trackNavigation(from: string, to: string, metadata?: ActionMetadata): void {
    this.trackAction('navigation', {
      from,
      to,
      ...metadata,
    });
  }

  /**
   * Track search actions
   */
  trackSearch(query: string, resultsCount?: number, metadata?: ActionMetadata): void {
    this.trackAction('search', {
      query,
      resultsCount,
      ...metadata,
    });
  }

  /**
   * Track product interactions
   */
  trackProductView(productId: string, productName?: string, metadata?: ActionMetadata): void {
    this.trackAction('product_view', {
      productId,
      productName,
      ...metadata,
    });
  }

  /**
   * Track cart actions
   */
  trackCartAction(action: 'add' | 'remove' | 'update', productId: string, quantity?: number, metadata?: ActionMetadata): void {
    this.trackAction('cart_action', {
      cartAction: action,
      productId,
      quantity,
      ...metadata,
    });
  }

  /**
   * Track order actions
   */
  trackOrderAction(action: 'create' | 'cancel' | 'complete', orderId?: string, metadata?: ActionMetadata): void {
    this.trackAction('order_action', {
      orderAction: action,
      orderId,
      ...metadata,
    });
  }

  /**
   * Track subscription actions
   */
  trackSubscriptionAction(action: 'create' | 'update' | 'cancel', subscriptionId?: string, metadata?: ActionMetadata): void {
    this.trackAction('subscription_action', {
      subscriptionAction: action,
      subscriptionId,
      ...metadata,
    });
  }

  /**
   * Track error events
   */
  trackError(error: string, context?: string, metadata?: ActionMetadata): void {
    this.trackAction('error', {
      error,
      context,
      ...metadata,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, metadata?: ActionMetadata): void {
    this.trackAction('performance', {
      metric,
      value,
      ...metadata,
    });
  }
}

// Create singleton instance
const actionTracker = new ActionTracker();

export default actionTracker;