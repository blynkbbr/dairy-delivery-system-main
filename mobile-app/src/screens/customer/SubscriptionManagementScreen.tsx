import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { useAuth } from '../../store';
import { apiService } from '../../services/api';
import type { Subscription } from '../../types';

const SubscriptionManagementScreen: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { user } = useAuth();

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSubscriptions();
      if (response.success && response.data) {
        setSubscriptions(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSubscriptions();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return COLORS.success;
      case 'paused':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'checkmark-circle';
      case 'paused':
        return 'pause-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const handleManageSubscription = (subscription: Subscription) => {
    // Navigate to subscription details screen (placeholder for now)
    console.log('Manage subscription:', subscription.id);
  };

  const handleCreateSubscription = () => {
    // Navigate to create subscription screen (placeholder for now)
    console.log('Create new subscription');
  };

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => (
    <View style={styles.subscriptionCard}>
      <View style={styles.subscriptionHeader}>
        <View style={styles.subscriptionInfo}>
          <Text style={styles.subscriptionTitle}>{item.product.name}</Text>
          <Text style={styles.subscriptionFrequency}>
            {item.frequency} • {item.quantity} units
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={12} 
            color={COLORS.white} 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.subscriptionDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>
            Next delivery: {new Date(item.nextDeliveryDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.detailText}>₹{item.product.price} per delivery</Text>
        </View>
      </View>

      <View style={styles.subscriptionActions}>
        <TouchableOpacity
          style={styles.manageButton}
          onPress={() => handleManageSubscription(item)}
        >
          <Text style={styles.manageButtonText}>Manage</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && subscriptions.length === 0) {
    return (
      <Screen>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading subscriptions...</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Subscriptions</Text>
        </View>

        {subscriptions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="repeat-outline" size={80} color={COLORS.gray[300]} />
            <Text style={styles.emptyTitle}>No Active Subscriptions</Text>
            <Text style={styles.emptySubtitle}>
              Create a subscription to get regular deliveries of your favorite products
            </Text>
            <Button
              title="Create Subscription"
              onPress={handleCreateSubscription}
              style={styles.createButton}
            />
          </View>
        ) : (
          <FlatList
            data={subscriptions}
            renderItem={renderSubscriptionItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
              />
            }
            ListFooterComponent={
              <Button
                title="Create New Subscription"
                onPress={handleCreateSubscription}
                style={styles.createButton}
                variant="outline"
              />
            }
          />
        )}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },

  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },

  listContainer: {
    padding: SPACING.lg,
  },

  subscriptionCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
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

  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },

  subscriptionInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },

  subscriptionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },

  subscriptionFrequency: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
  },

  statusIcon: {
    marginRight: SPACING.xs,
  },

  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },

  subscriptionDetails: {
    marginBottom: SPACING.lg,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },

  detailText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },

  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  manageButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },

  manageButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },

  emptyTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },

  createButton: {
    marginTop: SPACING.lg,
  },
});

export default SubscriptionManagementScreen;