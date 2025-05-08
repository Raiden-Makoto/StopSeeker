import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';

export default function VehicleDetail({ route, navigation }) {
  const { vehicleNumber, modelInfo, location, routeNumber, routeName, destination, delayText: initialDelayText } = route.params; // Get the vehicle number from params
  const [delayText, setDelayText] = useState(initialDelayText);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicleLocations, setVehicleLocations] = useState({});
  const [htmlContent, setHtmlContent] = useState(`
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
  `);

  const fetchVehicleInformation = async () => {
    setIsLoading(true);
    try{
      const response = await fetch('https://42Cummer-StopSeeker.hf.space/vehicleinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ vehicle_number: vehicleNumber })
      });

      if (!response.ok){
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      if (data.delay){
        setDelayText(data.delay);
      } else {
        setDelayText(null);
      }
      if (data.location){
        setVehicleLocations(data.location);
      }
    } catch (error) {
      console.error('Error fetching vehicle information:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchVehicleInformation, 30000);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchVehicleInformation().then(() => setRefreshing(false));
  }, []);

  // Process delayText
  let delayDisplay = null;
  if (delayText) {
    const match = delayText.match(/^(\d+:\d{2})\s+(ahead|behind)$/);
    if (match) {
      const [, time, status] = match;
      if (time === '0:00') {
        delayDisplay = <Text style={{ color: 'green', fontSize: 24, fontWeight: 'bold' }}>{' '}+0</Text>;
      } else if (status === 'ahead') {
        delayDisplay = <Text style={{ color: 'green', fontSize: 24, fontWeight: 'bold' }}>{' '}+{time}</Text>;
      } else if (status === 'behind') {
        delayDisplay = <Text style={{ color: 'red', fontSize: 24, fontWeight: 'bold' }}>{' '}-{time}</Text>;
      }
      else{
        delayDisplay = <Text style={{ color: 'green', fontSize: 24, fontWeight: 'bold' }}>{' '}+0</Text>;
      }
    }
    else{
      delayDisplay = <Text style={{ color: 'green', fontSize: 24, fontWeight: 'bold' }}>{' '}+0</Text>;
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.vehicleNumberText}>{vehicleNumber}</Text>
        <Text style={styles.vehicleModelBlock}>
          {modelInfo.model}
          {modelInfo?.charging && <FontAwesome name="usb" size={17} color="#fff" style={{ marginLeft: 4 }} />}
          {modelInfo?.streetcar && <FontAwesome name="train" size={17} color="#fff" style={{ marginLeft: 4 }} />}
        </Text>
      </View>
      <View style={styles.routeContainer}>
        <Text style={styles.routeTitle}>{routeNumber} {routeName}</Text>
        <View style={styles.delayContainer}>
          {delayDisplay}
        </View>
      </View>
      <View style={styles.routeContainer}>
      <Text style={styles.vehicleRouteText}>
      {(() => {
        const branch = destination[1] === " " ? destination[0] : '';
        if (branch) {
          const formattedDestination = destination.substring(2); // Get the part from "to" onwards
          return `${routeNumber}${branch} ${routeName} ${formattedDestination}`; // Format as "167A {routeName} to Steeles"
        } else {
          return `${routeNumber} ${routeName} ${destination}`; // Return destination as is if no branch
        }
      })()}
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
      <View style={styles.routeContainer}>
        <Text style={styles.occupancyText}>
          Occupancy: {(() => {
            if (location.occupancy_status === 'EMPTY') {
              return 'Many Seats Available 🟢'; // Green circle for empty
            } else if (location.occupancy_status === 'FEW_SEATS_AVAILABLE') {
              return 'Few Seats Available 🟡'; // Yellow circle for few seats available
            } else if (location.occupancy_status === 'FULL') {
              return 'Sorry, Bus Full🔴'; // Red circle for full
            } else {
              return 'Status Unknown'; // Fallback for unexpected values
            }
          })()}
        </Text>
      </View>
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
    fontSize: 29,
    fontWeight: 'bold',
    color: '#fff',
  },
  vehicleModelBlock: {
    flex: 1,
    textAlign: 'right',
    color: '#fff',
    fontSize: 17,
  },
  map: {
    flex: 1,
    backgroundColor: '#fff', // Ensure the WebView background is also black
  },
  mapContainer: {
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  routeContainer: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Space between title and delay
    alignItems: 'center', // Center vertically
    padding: 6,
    backgroundColor: '#333333', // Set a darker grey background
  },
  delayContainer: {
    marginLeft: 'auto', // Push delay text to the right
  },
  routeTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: 'white',
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
  occupancyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
  },
}); 


