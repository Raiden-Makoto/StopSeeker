import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function RouteDetailScreen({ route }) {
  const { routeNumber, routeName, vehicles, stopInfo } = route.params;

  const getRouteColor = (routeNumber) => {
    if (routeNumber.startsWith('3') && routeNumber.length === 3) {
      return '#007AFF'; // Blue for 3xx routes
    } else if (routeNumber.startsWith('9') && routeNumber.length === 3) {
      return '#34C759'; // Green for 9xx routes
    } else if (routeNumber.startsWith('4') && routeNumber.length === 3) {
      return '#8E8E93'; // Grey for 4xx routes
    }
    return '#ff1717'; // Default red color
  };

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
          const map = L.map('map').setView([${stopInfo.latitude}, ${stopInfo.longitude}], 15);
          
          // Add the OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          // Add marker for the stop location
          L.marker([${stopInfo.latitude}, ${stopInfo.longitude}])
            .addTo(map)
            .bindPopup('${stopInfo.name}')
            .openPopup();
        </script>
      </body>
    </html>
  `;

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
      <View style={styles.header}>
        <Text style={[styles.routeTitle, { color: getRouteColor(routeNumber) }]}>
          {routeNumber} {routeName}
        </Text>
      </View>
      <ScrollView style={styles.content}>
        {vehicles?.length > 0 ? (
          vehicles.map((vehicle, index) => (
            <View key={index} style={styles.vehicleInfo}>
              <View style={styles.vehicleHeader}>
                <Text style={styles.vehicleMinutes}>
                  {vehicle.minutes}
                </Text>
                <Text style={styles.vehicleNumber}>
                  {vehicle.vehicle_number}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noServiceText}>No service at this time</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mapContainer: {
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  map: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  routeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  vehicleInfo: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleMinutes: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
  },
  vehicleNumber: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  noServiceText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
  },
}); 

//https://bustime.ttc.ca/gtfsrt/vehicles?debug