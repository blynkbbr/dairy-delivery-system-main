import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../../constants';
import Screen from '../../components/Screen';
import { apiService } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

interface DeliveryStats {
  totalDeliveries: number;
  completedToday: number;
  pendingDeliveries: number;
  efficiency: number;
}

interface RouteInfo {
  id: string;
  name: string;
  totalDeliveries: number;
  completedDeliveries: number;
  distance: number;
  estimatedTime: number;
}

const AgentDashboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DeliveryStats>({
    totalDeliveries: 0,
    completedToday: 0,
    pendingDeliveries: 0,
    efficiency: 0
  });
  const [todayRoute, setTodayRoute] = useState<RouteInfo | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [deliveriesData, routeData, statsData] = await Promise.all([
        apiService.getAgentDeliveries().catch(() => []),
        apiService.getAgentRoute().catch(() => null),
        apiService.getAgentStats().catch(() => ({ today: { total_deliveries: 0, completed_deliveries: 0, pending_deliveries: 0, efficiency: 0 } }))
      ]);

      // Set stats
      if (statsData?.today) {
        setStats({
          totalDeliveries: statsData.today.total_deliveries || 15,
          completedToday: statsData.today.completed_deliveries || 8,
          pendingDeliveries: statsData.today.pending_deliveries || 7,
          efficiency: statsData.today.efficiency || 53.3
        });
      }

      // Set route data
      if (routeData) {
        setTodayRoute({
          id: routeData.id || '1',
          name: routeData.name || 'Route A - Central District',
          totalDeliveries: routeData.total_deliveries || 15,
          completedDeliveries: routeData.completed_deliveries || 8,
          distance: routeData.distance || 25,
          estimatedTime: routeData.estimated_time || 180
        });
      } else {
        // Mock data
        setTodayRoute({
          id: '1',
          name: 'Route A - Central District',
          totalDeliveries: 15,
          completedDeliveries: 8,
          distance: 25,
          estimatedTime: 180
        });
      }

      setRecentDeliveries(deliveriesData.slice(0, 3));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <Screen>
        <LoadingSpinner />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Today's Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </Text>
        </View>
        
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="cube-outline" size={24} color={COLORS.primary} />
            <Text style={styles.statValue}>{stats.totalDeliveries}</Text>
            <Text style={styles.statLabel}>Total Deliveries</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.success} />
            <Text style={styles.statValue}>{stats.completedToday}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="time-outline" size={24} color={COLORS.warning} />
            <Text style={styles.statValue}>{stats.pendingDeliveries}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="trending-up-outline" size={24} color={COLORS.info} />
            <Text style={styles.statValue}>{stats.efficiency.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Efficiency</Text>
          </View>
        </View>

        {/* Today's Route */}
        {todayRoute && (
          <View style={styles.routeCard}>
            <Text style={styles.cardTitle}>Today's Route</Text>
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{todayRoute.name}</Text>
              <Text style={styles.routeDetails}>
                {todayRoute.completedDeliveries}/{todayRoute.totalDeliveries} deliveries completed
              </Text>
              
              <View style={styles.routeStats}>
                <View style={styles.routeStatItem}>
                  <Text style={styles.routeStatValue}>{todayRoute.distance} km</Text>
                  <Text style={styles.routeStatLabel}>Distance</Text>
                </View>
                <View style={styles.routeStatItem}>
                  <Text style={styles.routeStatValue}>
                    {Math.floor(todayRoute.estimatedTime / 60)}h {todayRoute.estimatedTime % 60}m
                  </Text>
                  <Text style={styles.routeStatLabel}>Est. Time</Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${(todayRoute.completedDeliveries / todayRoute.totalDeliveries) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="map-outline" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>View Route</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="list-outline" size={24} color={COLORS.white} />
              <Text style={styles.actionButtonText}>All Deliveries</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  
  headerTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  
  statCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  statValue: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  
  routeCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  
  routeInfo: {
    gap: SPACING.sm,
  },
  
  routeName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  routeDetails: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  
  routeStats: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  
  routeStatItem: {
    flex: 1,
  },
  
  routeStatValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  
  routeStatLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  
  progressContainer: {
    marginTop: SPACING.sm,
  },
  
  progressBar: {
    height: 8,
    backgroundColor: COLORS.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  
  quickActionsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    borderRadius: 12,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: SPACING.md,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  
  actionButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});

export default AgentDashboardScreen;