import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { styles } from './styles';
import stopsData from './stops.json';

export default function MapScreen({ route, navigation }) {
  const { stopId, routes, vehicles } = route.params;
  const [stopInfo, setStopInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRoutes, setExpandedRoutes] = useState({});

  // Group vehicles by route number
  const vehiclesByRoute = vehicles.reduce((acc, vehicle) => {
    const routeNumber = vehicle.id.split('_')[0];
    if (!acc[routeNumber]) {
      acc[routeNumber] = [];
    }
    acc[routeNumber].push(vehicle);
    return acc;
  }, {});

  // Sort routes in ascending order
  const sortedRoutes = [...routes].sort((a, b) => {
    // Extract numbers from route strings (assuming format like "167 Pharmacy North")
    const numA = parseInt(a.replace(/\D/g, ''));
    const numB = parseInt(b.replace(/\D/g, ''));
    return numA - numB;
  });

  const isThreeDigitRoute = (route) => {
    const routeNumber = route.split(' ')[0];
    return routeNumber.length === 3;
  };

  const formatRouteDisplay = (route) => {
    const parts = route.split('-');
    if (parts.length > 1) {
      // Keep the route number and first part together
      const routeNumber = parts[0];
      // Join the remaining parts with hyphens
      const routeName = parts.slice(1).join('-');
      return `${routeNumber} ${routeName}`;
    }
    return route;
  };

  const getRouteColor = (route) => {
    const routeNumber = route.split('-')[0];
    if (routeNumber.startsWith('3') && routeNumber.length === 3) {
      return '#007AFF'; // Blue for 3xx routes
    } else if (routeNumber.startsWith('9') && routeNumber.length === 3) {
      return '#34C759'; // Green for 9xx routes
    } else if (routeNumber.startsWith('4') && routeNumber.length === 3) {
      return '#8E8E93'; // Grey for 4xx routes
    }
    return '#ff1717'; // Default red color
  };

  const toggleRoute = (route) => {
    setExpandedRoutes(prev => ({
      ...prev,
      [route]: !prev[route]
    }));
  };

  useEffect(() => {
    // Find the matching stop in the JSON data
    const matchingStop = stopsData[stopId];
    if (matchingStop) {
      setStopInfo({
        name: matchingStop.stop_name,
        latitude: parseFloat(matchingStop.stop_lat),
        longitude: parseFloat(matchingStop.stop_lon)
      });
      navigation.setOptions({
        title: `Stop Information for #${stopId}`
      });
    }
    setLoading(false);
  }, [stopId, navigation]);

  // HTML content for the Leaflet map
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
        <style>
          html, body, #map {
            height: 100%;
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          // Initialize the map
          const map = L.map('map').setView([${stopInfo?.latitude || 0}, ${stopInfo?.longitude || 0}], 15);
          
          // Add the OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          // Add marker for the stop location
          ${stopInfo ? `
          L.marker([${stopInfo.latitude}, ${stopInfo.longitude}])
            .addTo(map)
            .bindPopup('${stopInfo.name}')
            .openPopup();
          ` : ''}
        </script>
      </body>
    </html>
  `;

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#ff1717" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: htmlContent }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
      <ScrollView style={styles.infoContainer}>
        <Text style={styles.routesHeader}>Routes</Text>
        {sortedRoutes.map((route, index) => (
          <View key={index} style={styles.routeItem}>
            <TouchableOpacity 
              style={styles.routeHeader} 
              onPress={() => toggleRoute(route)}
            >
              <Text style={[
                styles.routeTitle,
                { color: getRouteColor(route) }
              ]}>{formatRouteDisplay(route)}</Text>
              <Text style={[
                styles.expandIcon,
                { color: getRouteColor(route) }
              ]}>
                {expandedRoutes[route] ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            {expandedRoutes[route] && (
              <View style={styles.routeContent}>
                {vehiclesByRoute[route.split('-')[0]]?.map((vehicle, index) => (
                  <View key={index} style={styles.vehicleInfo}>
                    <Text style={styles.vehicleText}>
                      Vehicle {vehicle.vehicle_number} - {vehicle.minutes}
                    </Text>
                    <Text style={[styles.vehicleText, { color: vehicle.delay_color }]}>
                      {vehicle.delay_text}
                    </Text>
                    <Text style={styles.vehicleText}>
                      {vehicle.location}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 