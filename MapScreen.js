import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { styles } from './styles';
import stopsData from './stops.json';

export default function MapScreen({ route, navigation }) {
  const { stopId, routes } = route.params;
  const [stopInfo, setStopInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sort routes in ascending order
  const sortedRoutes = [...routes].sort((a, b) => {
    // Extract numbers from route strings (assuming format like "167 Pharmacy North")
    const numA = parseInt(a.replace(/\D/g, ''));
    const numB = parseInt(b.replace(/\D/g, ''));
    return numA - numB;
  });

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
        title: `Stop Information for ${stopId}: ${matchingStop.stop_name}`
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
      <Text style={styles.header}>Stop Information</Text>
      <ScrollView style={styles.infoContainer}>
        <Text style={styles.text}>Stop ID: {stopId}</Text>
        {stopInfo && (
          <Text style={styles.text}>Stop Name: {stopInfo.name}</Text>
        )}
        <Text style={styles.header}>Routes</Text>
        {sortedRoutes.map((route, index) => (
          <View key={index} style={styles.routeItem}>
            <Text style={styles.routeTitle}>{route}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: htmlContent }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back to Camera</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 