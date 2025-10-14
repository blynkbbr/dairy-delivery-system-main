import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../constants';
import { formatCurrency } from '../../utils';
import { useCart, useNotification, useUser } from '../../store';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import { apiService } from '../../services/api';
import type { CartItem, Address } from '../../types';

const CartScreen: React.FC = () => {
  const navigation = useNavigation();
  const { items, total, itemCount, updateQuantity, removeItem, clearCart } = useCart();
  const { showNotification } = useNotification();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string) => {
    const item = items.find(item => item.product_id === productId);
    if (item) {
      Alert.alert(
        'Remove Item',
        `Remove ${item.product.name} from cart?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => {
              removeItem(productId);
              showNotification('success', 'Item removed from cart');
            }
          },
        ]
      );
    }
  };

  const handleClearCart = () => {
    if (items.length === 0) return;

    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            clearCart();
            showNotification('success', 'Cart cleared');
          }
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      showNotification('warning', 'Your cart is empty');
      return;
    }

    try {
      setLoading(true);

      // Get user's addresses
      const addresses = await apiService.getAddresses();
      if (addresses.length === 0) {
        showNotification('warning', 'Please add a delivery address first');
        // Navigate to profile to add address
        return;
      }

      // Use default address or first available address
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];

      // Create order
      const orderData = {
        address_id: defaultAddress.id,
        items: items.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        delivery_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
      };

      const order = await apiService.createOrder(orderData);
      
      // Clear cart after successful order
      clearCart();
      
      showNotification('success', 'Order placed successfully!');
      
      // Navigate to orders screen
      navigation.navigate('Orders' as never);
      
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      showNotification('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.productImagePlaceholder}>
        <Ionicons name="water" size={32} color={COLORS.primary} />
      </View>
      
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.product.name}
        </Text>
        
        <Text style={styles.itemPrice}>
          {formatCurrency(item.unit_price)} per {item.product.unit}
        </Text>
        
        <View style={styles.itemFooter}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.product_id, item.quantity - 1)}
            >
              <Ionicons name="remove" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.product_id, item.quantity + 1)}
            >
              <Ionicons name="add" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.itemTotal}>
            {formatCurrency(item.total_price)}
          </Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.product_id)}
      >
        <Ionicons name="trash-outline" size={20} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyCart}>
      <Ionicons name="bag-outline" size={80} color={COLORS.gray[300]} />
      <Text style={styles.emptyCartTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyCartSubtitle}>
        Add some fresh dairy products to get started!
      </Text>
      
      <Button
        title="Browse Products"
        onPress={() => navigation.navigate('Products' as never)}
        style={styles.browseButton}
      />
    </View>
  );

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Cart</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {items.length === 0 ? (
          renderEmptyCart()
        ) : (
          <>
            {/* Cart Items */}
            <FlatList
              data={items}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cartList}
              showsVerticalScrollIndicator={false}
            />

            {/* Cart Summary */}
            <View style={styles.cartSummary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
                <Text style={styles.summaryValue}>{formatCurrency(total)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>FREE</Text>
              </View>
              
              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
              </View>
              
              <Button
                title="Proceed to Checkout"
                onPress={handleCheckout}
                loading={loading}
                style={styles.checkoutButton}
              />
              
              <Text style={styles.deliveryNote}>
                🚚 Free delivery on all orders • Next-day delivery available
              </Text>
            </View>
          </>
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
  
  clearButton: {
    padding: SPACING.sm,
  },
  
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
  
  cartList: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  
  cartItem: {
    flexDirection: 'row',
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
  
  productImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  
  itemInfo: {
    flex: 1,
  },
  
  itemName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  itemPrice: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.xs,
  },
  
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  quantityText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginHorizontal: SPACING.md,
    minWidth: 24,
    textAlign: 'center',
  },
  
  itemTotal: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  removeButton: {
    padding: SPACING.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  
  emptyCartTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  
  emptyCartSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },
  
  browseButton: {
    paddingHorizontal: SPACING.xl,
  },
  
  cartSummary: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  
  summaryLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  
  summaryValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.md,
  },
  
  totalLabel: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  totalValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  
  checkoutButton: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  
  deliveryNote: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default CartScreen;