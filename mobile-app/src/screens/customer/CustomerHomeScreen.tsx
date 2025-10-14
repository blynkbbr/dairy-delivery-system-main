import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { useUser, useCart, useNotification } from '../../store';
import { formatCurrency, formatDate } from '../../utils';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { apiService } from '../../services/api';
import type { Order, Subscription, Product } from '../../types';

const CustomerHomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const { itemCount } = useCart();
  const { showNotification } = useNotification();

  const [refreshing, setRefreshing] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Subscription[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [todayDeliveries, setTodayDeliveries] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [ordersResponse, subscriptionsResponse, productsResponse] = await Promise.all([
        apiService.getOrders({ limit: 3 }),
        apiService.getSubscriptions({ status: 'active', limit: 3 }),
        apiService.getProducts({ limit: 4 }),
      ]);

      setRecentOrders(ordersResponse.data);
      setActiveSubscriptions(subscriptionsResponse.data);
      setFeaturedProducts(productsResponse.data);

      // Count today's deliveries
      const today = new Date().toISOString().split('T')[0];
      const todayCount = subscriptionsResponse.data.reduce((count, sub) => {
        const dayOfWeek = new Date().getDay();
        return sub.delivery_days.includes(dayOfWeek) ? count + 1 : count;
      }, 0);
      setTodayDeliveries(todayCount);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleNavigateToProducts = () => {
    navigation.navigate('Products' as never);
  };

  const handleNavigateToCart = () => {
    navigation.navigate('Cart' as never);
  };

  const handleNavigateToOrders = () => {
    navigation.navigate('Orders' as never);
  };

  const handleNavigateToSubscriptions = () => {
    navigation.navigate('Subscriptions' as never);
  };

  const quickActions = [
    {
      title: 'Browse Products',
      icon: 'storefront' as keyof typeof Ionicons.glyphMap,
      color: COLORS.primary,
      onPress: handleNavigateToProducts,
    },
    {
      title: 'My Cart',
      icon: 'bag' as keyof typeof Ionicons.glyphMap,
      color: COLORS.accent,
      onPress: handleNavigateToCart,
      badge: itemCount > 0 ? itemCount : undefined,
    },
    {
      title: 'Orders',
      icon: 'receipt' as keyof typeof Ionicons.glyphMap,
      color: COLORS.warning,
      onPress: handleNavigateToOrders,
    },
    {
      title: 'Subscriptions',
      icon: 'calendar' as keyof typeof Ionicons.glyphMap,
      color: COLORS.secondary,
      onPress: handleNavigateToSubscriptions,
    },
  ];

  return (
    <Screen safeArea={false} statusBarStyle="light">
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryLight]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}!</Text>
            <Text style={styles.username}>{user?.name || 'Welcome'}</Text>
          </View>
          
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{todayDeliveries}</Text>
            <Text style={styles.statLabel}>Today's Deliveries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{activeSubscriptions.length}</Text>
            <Text style={styles.statLabel}>Active Plans</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recentOrders.length}</Text>
            <Text style={styles.statLabel}>Recent Orders</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionItem}
                onPress={action.onPress}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                  {action.badge && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{action.badge}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Products</Text>
              <TouchableOpacity onPress={handleNavigateToProducts}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {featuredProducts.map((product) => (
                <View key={product.id} style={styles.productCard}>
                  <View style={styles.productImagePlaceholder}>
                    <Ionicons name="water" size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productPrice}>
                    {formatCurrency(product.price)}/{product.unit}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Active Subscriptions */}
        {activeSubscriptions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Subscriptions</Text>
              <TouchableOpacity onPress={handleNavigateToSubscriptions}>
                <Text style={styles.sectionLink}>Manage</Text>
              </TouchableOpacity>
            </View>
            {activeSubscriptions.map((subscription) => (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <Ionicons name="calendar" size={20} color={COLORS.accent} />
                  <Text style={styles.subscriptionTitle}>
                    {subscription.product.name}
                  </Text>
                </View>
                <Text style={styles.subscriptionDetails}>
                  {subscription.default_quantity} {subscription.product.unit} • {' '}
                  {subscription.delivery_days.length} days/week
                </Text>
                <Text style={styles.subscriptionPrice}>
                  {formatCurrency(subscription.product.price * subscription.default_quantity)}/delivery
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <TouchableOpacity onPress={handleNavigateToOrders}>
                <Text style={styles.sectionLink}>View All</Text>
              </TouchableOpacity>
            </View>
            {recentOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderDate}>
                    {formatDate(order.order_date, 'MMM DD, YYYY')}
                  </Text>
                  <View style={[styles.orderStatus, { backgroundColor: getStatusColor(order.status) }]}>
                    <Text style={styles.orderStatusText}>{order.status}</Text>
                  </View>
                </View>
                <Text style={styles.orderTotal}>
                  {formatCurrency(order.total_amount)}
                </Text>
                <Text style={styles.orderItems}>
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Quick Order CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Need something quickly?</Text>
          <Text style={styles.ctaSubtitle}>Browse our fresh products and get them delivered today</Text>
          <Button
            title="Shop Now"
            onPress={handleNavigateToProducts}
            style={styles.ctaButton}
          />
        </View>
      </ScrollView>
    </Screen>
  );
};

const getStatusColor = (status: string) => {
  const colors = {
    pending: COLORS.warning + '20',
    confirmed: COLORS.info + '20',
    out_for_delivery: COLORS.accent + '20',
    delivered: COLORS.success + '20',
    cancelled: COLORS.error + '20',
  };
  return colors[status as keyof typeof colors] || COLORS.gray[200];
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 50,
    paddingBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  
  greeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.9,
  },
  
  username: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SPACING.xs,
  },
  
  profileButton: {
    padding: SPACING.sm,
  },
  
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: SPACING.md,
  },
  
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  section: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  sectionLink: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  quickActionItem: {
    width: '48%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  badgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  
  quickActionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  
  horizontalScroll: {
    marginHorizontal: -SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  
  productCard: {
    width: 140,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginRight: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  productImagePlaceholder: {
    width: '100%',
    height: 80,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  productName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  productPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  
  subscriptionCard: {
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
  
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  subscriptionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  
  subscriptionDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  
  subscriptionPrice: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
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
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  orderDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  orderStatus: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  
  orderStatusText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textTransform: 'capitalize',
  },
  
  orderTotal: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  orderItems: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  ctaSection: {
    margin: SPACING.lg,
    backgroundColor: COLORS.gray[50],
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  
  ctaTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  
  ctaSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  
  ctaButton: {
    width: '100%',
  },
});

export default CustomerHomeScreen;
