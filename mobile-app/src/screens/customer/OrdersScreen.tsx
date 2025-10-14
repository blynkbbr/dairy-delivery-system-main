import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, ORDER_STATUS_COLORS } from '../../constants';
import { formatCurrency, formatDate, getStatusColor } from '../../utils';
import { useNotification } from '../../store';
import Screen from '../../components/Screen';
import { apiService } from '../../services/api';
import type { Order } from '../../types';

const OrdersScreen: React.FC = () => {
  const { showNotification } = useNotification();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const response = await apiService.getOrders({ limit: 50 });
      setOrders(response.data);
    } catch (error) {
      console.error('Error loading orders:', error);
      showNotification('error', 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    const iconMap = {
      pending: 'time-outline',
      confirmed: 'checkmark-circle-outline',
      out_for_delivery: 'car-outline',
      delivered: 'checkmark-done-outline',
      cancelled: 'close-circle-outline',
    };
    return iconMap[status as keyof typeof iconMap] || 'help-circle-outline';
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item.id.slice(-6)}</Text>
          <Text style={styles.orderDate}>
            {formatDate(item.order_date, 'MMM DD, YYYY')}
          </Text>
        </View>
        
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status, ORDER_STATUS_COLORS) + '20' }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={getStatusColor(item.status, ORDER_STATUS_COLORS)} 
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status, ORDER_STATUS_COLORS) }]}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        <Text style={styles.orderAmount}>{formatCurrency(item.total_amount)}</Text>
        <Text style={styles.orderItems}>
          {item.items.length} item{item.items.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {item.delivery_date && (
        <View style={styles.deliveryInfo}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.deliveryDate}>
            Delivery: {formatDate(item.delivery_date, 'MMM DD, YYYY')}
          </Text>
        </View>
      )}

      <View style={styles.orderItems}>
        {item.items.slice(0, 2).map((orderItem, index) => (
          <Text key={index} style={styles.itemName}>
            {orderItem.quantity}x {orderItem.product.name}
          </Text>
        ))}
        {item.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{item.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>View Details</Text>
        </TouchableOpacity>
        
        {item.status === 'pending' && (
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        
        {item.status === 'delivered' && (
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Reorder</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color={COLORS.gray[300]} />
      <Text style={styles.emptyStateTitle}>No Orders Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your order history will appear here once you place your first order
      </Text>
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.ordersList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
        />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  
  filterButton: {
    padding: SPACING.sm,
  },
  
  ordersList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  
  orderId: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  orderDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  
  statusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    marginLeft: SPACING.xs,
    textTransform: 'capitalize',
  },
  
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  orderAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  orderItems: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  deliveryDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  
  itemName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  moreItems: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  
  orderActions: {
    flexDirection: 'row',
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  
  actionButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  
  actionButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  cancelButton: {
    borderColor: COLORS.error,
  },
  
  cancelButtonText: {
    color: COLORS.error,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
  },
  
  emptyStateTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  
  emptyStateSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default OrdersScreen;