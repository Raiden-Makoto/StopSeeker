import React, { useEffect } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';

export default function VehicleDetail({ route, navigation }) {
  const { vehicleNumber, modelInfo, location, destination, delayText } = route.params; // Get the vehicle number from params
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
          const map = L.map('map').setView([${location.latitude}, ${location.longitude}], 15);
          
          // Add the OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
          
          // Define custom bus icon
          const busIcon = L.icon({
            iconUrl: 'https://www.freeiconspng.com/uploads/red-bus-icon-8.png',
            iconSize: [28, 28], // Size of the icon
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
          });

          // Add marker for the bus location
          L.marker([${location.latitude}, ${location.longitude}], { icon: busIcon })
            .addTo(map)
            .bindPopup('Bus ${vehicleNumber}')
            .openPopup();
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.vehicleNumberText}>{vehicleNumber}</Text>
        <Text style={styles.vehicleModelBlock}>
          {modelInfo.model}
          {modelInfo?.charging && <FontAwesome name="usb" size={14} color="#fff" style={{ marginLeft: 4 }} />}
          {modelInfo?.streetcar && <FontAwesome name="train" size={14} color="#fff" style={{ marginLeft: 4 }} />}
        </Text>
      </View>
      <View style={styles.mapContainer}>
        <WebView
          source={{ html: htmlContent }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
      {/* Add more details about the vehicle here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    width: '100%',
    padding: 10,
  },
  vehicleNumberText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  vehicleModelBlock: {
    flex: 1,
    textAlign: 'right',
    color: '#fff',
  },
  map: {
    flex: 1,
    backgroundColor: '#000', // Ensure the WebView background is also black
  },
  mapContainer: {
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  routeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingVertical: 15,
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingLeft: 15,
    paddingRight: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  vehicleTimeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  vehicleRouteText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
  },
  vehicleNumberBlock: {
    alignItems: 'flex-end',
    minWidth: 64,
    marginLeft: 'auto',
  },
  noServiceText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
  },
  refreshingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
}); 


