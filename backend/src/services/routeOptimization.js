const axios = require('axios');

/**
 * Route Optimization Service
 * Handles delivery route planning and optimization
 */

// Haversine formula to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Nearest Neighbor Algorithm for basic route optimization
 */
function nearestNeighborTSP(locations, startLocation) {
  const unvisited = [...locations];
  const route = [];
  let currentLocation = startLocation;
  let totalDistance = 0;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      unvisited[0].latitude,
      unvisited[0].longitude
    );

    // Find nearest unvisited location
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        unvisited[i].latitude,
        unvisited[i].longitude
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    // Add nearest location to route
    const nextLocation = unvisited[nearestIndex];
    route.push({
      ...nextLocation,
      sequence: route.length + 1,
      distance_from_previous: nearestDistance
    });

    totalDistance += nearestDistance;
    currentLocation = nextLocation;
    unvisited.splice(nearestIndex, 1);
  }

  return {
    route,
    totalDistance,
    estimatedDuration: Math.ceil(totalDistance * 3) // Rough estimate: 3 minutes per km
  };
}

/**
 * Optimize route using Google Maps API (if available)
 */
async function optimizeRouteWithGoogleMaps(locations, startLocation) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.log('Google Maps API key not found, using basic algorithm');
    return nearestNeighborTSP(locations, startLocation);
  }

  try {
    // For demo purposes, we'll use the basic algorithm
    // In production, integrate with Google Maps Directions API with waypoint optimization
    return nearestNeighborTSP(locations, startLocation);
  } catch (error) {
    console.error('Google Maps API error:', error);
    // Fallback to basic algorithm
    return nearestNeighborTSP(locations, startLocation);
  }
}

/**
 * Generate delivery routes for a specific date
 */
async function generateDailyRoutes(date) {
  const db = require('../utils/database');
  
  try {
    // Get all scheduled deliveries for the date
    const deliveries = await db('subscription_deliveries')
      .select(
        'subscription_deliveries.*',
        'users.full_name as customer_name',
        'users.phone as customer_phone',
        'addresses.line1',
        'addresses.area',
        'addresses.city',
        'addresses.latitude',
        'addresses.longitude',
        'products.name as product_name'
      )
      .join('users', 'subscription_deliveries.user_id', 'users.id')
      .join('addresses', 'subscription_deliveries.address_id', 'addresses.id')
      .join('products', 'subscription_deliveries.product_id', 'products.id')
      .where('delivery_date', date)
      .where('subscription_deliveries.status', 'scheduled')
      .where('addresses.latitude', 'is not', null)
      .where('addresses.longitude', 'is not', null);

    if (deliveries.length === 0) {
      return [];
    }

    // Get available agents
    const agents = await db('users')
      .where('role', 'agent')
      .where('status', 'active');

    if (agents.length === 0) {
      throw new Error('No active delivery agents available');
    }

    // Depot location (central distribution point)
    const depot = {
      latitude: 11.0168, // Coimbatore coordinates
      longitude: 76.9558,
      address: 'DairyFresh Distribution Center, Coimbatore'
    };

    // Group deliveries by area/zone for better optimization
    const deliveryZones = groupDeliveriesByZone(deliveries);
    const routes = [];

    for (let i = 0; i < Math.min(agents.length, deliveryZones.length); i++) {
      const agent = agents[i];
      const zoneDeliveries = deliveryZones[i];

      // Optimize route for this agent
      const optimizedRoute = await optimizeRouteWithGoogleMaps(zoneDeliveries, depot);

      // Create route in database
      const [route] = await db('routes')
        .insert({
          agent_id: agent.id,
          route_name: `${agent.full_name || 'Agent'} - ${date}`,
          route_date: date,
          status: 'planned',
          total_distance: optimizedRoute.totalDistance,
          estimated_duration: optimizedRoute.estimatedDuration,
          depot_location: JSON.stringify(depot)
        })
        .returning('*');

      // Create route stops
      const routeStops = optimizedRoute.route.map(delivery => ({
        route_id: route.id,
        user_id: delivery.user_id,
        address_id: delivery.address_id,
        subscription_delivery_id: delivery.id,
        sequence: delivery.sequence,
        stop_type: 'subscription',
        delivery_items: JSON.stringify([{
          product_id: delivery.product_id,
          product_name: delivery.product_name,
          quantity: delivery.quantity,
          unit_price: delivery.unit_price
        }]),
        total_amount: delivery.total_price,
        status: 'pending'
      }));

      await db('route_stops').insert(routeStops);

      routes.push({
        ...route,
        agent: agent,
        stops: routeStops.length,
        deliveries: zoneDeliveries.length
      });
    }

    return routes;
  } catch (error) {
    console.error('Route generation error:', error);
    throw error;
  }
}

/**
 * Group deliveries by geographical zones
 */
function groupDeliveriesByZone(deliveries) {
  // Simple zone grouping by area
  const zones = {};
  
  deliveries.forEach(delivery => {
    const zoneKey = delivery.area || 'default';
    if (!zones[zoneKey]) {
      zones[zoneKey] = [];
    }
    zones[zoneKey].push(delivery);
  });

  // Convert to array and balance zones
  const zoneArray = Object.values(zones);
  
  // If we have too many small zones, merge them
  while (zoneArray.length > 5 && zoneArray.some(zone => zone.length < 3)) {
    const smallZones = zoneArray.filter(zone => zone.length < 3);
    const largestSmallZone = smallZones.reduce((a, b) => a.length > b.length ? a : b);
    const otherSmallZone = smallZones.find(zone => zone !== largestSmallZone);
    
    if (otherSmallZone) {
      largestSmallZone.push(...otherSmallZone);
      const index = zoneArray.indexOf(otherSmallZone);
      zoneArray.splice(index, 1);
    } else {
      break;
    }
  }

  return zoneArray;
}

/**
 * Update delivery status and route progress
 */
async function updateDeliveryStatus(routeStopId, status, deliveryNotes = null, proofImage = null) {
  const db = require('../utils/database');
  
  try {
    const updateData = {
      status,
      delivery_notes: deliveryNotes,
      proof_image: proofImage
    };

    if (status === 'delivered') {
      updateData.delivered_at = new Date();
    } else if (status === 'in_transit') {
      updateData.arrived_at = new Date();
    }

    await db('route_stops')
      .where('id', routeStopId)
      .update(updateData);

    // Update related subscription delivery
    const routeStop = await db('route_stops')
      .where('id', routeStopId)
      .first();

    if (routeStop && routeStop.subscription_delivery_id) {
      await db('subscription_deliveries')
        .where('id', routeStop.subscription_delivery_id)
        .update({
          status: status === 'delivered' ? 'delivered' : status,
          delivered_at: status === 'delivered' ? new Date() : null,
          delivery_notes: deliveryNotes
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Update delivery status error:', error);
    throw error;
  }
}

/**
 * Get route details for agent
 */
async function getAgentRoute(agentId, date) {
  const db = require('../utils/database');
  
  try {
    const route = await db('routes')
      .where('agent_id', agentId)
      .where('route_date', date)
      .first();

    if (!route) {
      return null;
    }

    const stops = await db('route_stops')
      .select(
        'route_stops.*',
        'users.full_name as customer_name',
        'users.phone as customer_phone',
        'addresses.line1',
        'addresses.line2',
        'addresses.area',
        'addresses.city',
        'addresses.latitude',
        'addresses.longitude'
      )
      .join('users', 'route_stops.user_id', 'users.id')
      .join('addresses', 'route_stops.address_id', 'addresses.id')
      .where('route_stops.route_id', route.id)
      .orderBy('sequence');

    return {
      ...route,
      stops: stops.map(stop => ({
        ...stop,
        delivery_items: JSON.parse(stop.delivery_items || '[]')
      }))
    };
  } catch (error) {
    console.error('Get agent route error:', error);
    throw error;
  }
}

module.exports = {
  generateDailyRoutes,
  updateDeliveryStatus,
  getAgentRoute,
  optimizeRouteWithGoogleMaps,
  calculateDistance
};