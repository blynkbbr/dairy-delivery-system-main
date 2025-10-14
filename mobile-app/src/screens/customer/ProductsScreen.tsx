import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, PRODUCT_CATEGORIES } from '../../constants';
import { formatCurrency } from '../../utils';
import { useCart, useNotification } from '../../store';
import Screen from '../../components/Screen';
import Button from '../../components/Button';
import TextInput from '../../components/TextInput';
import { apiService } from '../../services/api';
import type { Product } from '../../types';

const ProductsScreen: React.FC = () => {
  const { addItem, getItemQuantity } = useCart();
  const { showNotification } = useNotification();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await apiService.getProducts({ limit: 50 });
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesResponse = await apiService.getProductCategories();
      setCategories(['All', ...categoriesResponse]);
    } catch (error) {
      // Use fallback categories if API fails
      setCategories(['All', ...PRODUCT_CATEGORIES]);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    setFilteredProducts(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    showNotification('success', `${product.name} added to cart!`);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item && styles.categoryItemSelected,
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item && styles.categoryTextSelected,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: Product }) => {
    const quantityInCart = getItemQuantity(item.id);
    
    return (
      <View style={styles.productCard}>
        <View style={styles.productImagePlaceholder}>
          <Ionicons
            name={getProductIcon(item.category)}
            size={40}
            color={COLORS.primary}
          />
        </View>
        
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name}
          </Text>
          
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.productFooter}>
            <View>
              <Text style={styles.productPrice}>
                {formatCurrency(item.price)}
              </Text>
              <Text style={styles.productUnit}>per {item.unit}</Text>
            </View>
            
            <View style={styles.productActions}>
              {quantityInCart > 0 && (
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityBadgeText}>{quantityInCart}</Text>
                </View>
              )}
              
              <Button
                title="Add"
                onPress={() => handleAddToCart(item)}
                size="small"
                variant="primary"
                style={styles.addButton}
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const getProductIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Milk': 'water',
      'Yogurt': 'cafe',
      'Cheese': 'restaurant',
      'Butter': 'nutrition',
      'Cream': 'ice-cream',
      'Ice Cream': 'ice-cream',
      'Other': 'storefront',
    };
    return iconMap[category] || 'water';
  };

  return (
    <Screen>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Products</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="options" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={handleSearch}
            leftIcon="search"
            containerStyle={styles.searchInput}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Products List */}
        <FlatList
          data={filteredProducts}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={64} color={COLORS.gray[300]} />
              <Text style={styles.emptyStateTitle}>No Products Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                {searchQuery.trim()
                  ? `No products match "${searchQuery}"`
                  : 'No products available in this category'
                }
              </Text>
            </View>
          }
        />

        {/* Results Info */}
        {filteredProducts.length > 0 && (
          <View style={styles.resultsInfo}>
            <Text style={styles.resultsText}>
              Showing {filteredProducts.length} of {products.length} products
            </Text>
          </View>
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
  
  headerAction: {
    padding: SPACING.sm,
  },
  
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  
  searchInput: {
    marginBottom: 0,
  },
  
  categoriesSection: {
    marginBottom: SPACING.md,
  },
  
  categoriesList: {
    paddingHorizontal: SPACING.lg,
  },
  
  categoryItem: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gray[100],
    marginRight: SPACING.sm,
  },
  
  categoryItemSelected: {
    backgroundColor: COLORS.primary,
  },
  
  categoryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  
  categoryTextSelected: {
    color: COLORS.white,
  },
  
  productsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  
  productRow: {
    justifyContent: 'space-between',
  },
  
  productCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  productImagePlaceholder: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.gray[100],
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  
  productInfo: {
    flex: 1,
  },
  
  productName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  
  productDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 18,
  },
  
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  
  productPrice: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  productUnit: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  
  productActions: {
    alignItems: 'center',
  },
  
  quantityBadge: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.xs,
    minWidth: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  quantityBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  
  addButton: {
    paddingHorizontal: SPACING.md,
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
  
  resultsInfo: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  
  resultsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default ProductsScreen;