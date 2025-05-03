import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { WebView } from 'react-native-webview';
import { FontAwesome } from '@expo/vector-icons';
import models from './models.json';

const getArrivalTime = (minutes) => {
  if (!minutes && minutes !== 0) return '--:--';
  const parsedMinutes = parseInt(minutes);
  if (isNaN(parsedMinutes)) return '--:--';
  
  const now = new Date();
  now.setMinutes(now.getMinutes() + parsedMinutes);
  return now.toTimeString().slice(0,5); // HH:mm
};

export default function RouteDetailScreen({ route, navigation }) {
  const { routeNumber, routeName, stopInfo } = route.params;
  const [vehicles, setVehicles] = useState(route.params.vehicles);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [vehicleLocations, setVehicleLocations] = useState({});

  const fetchUpdatedVehicles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://42Cummer-StopSeeker.hf.space/seek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ stop: stopInfo.stop })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);  // Debug log
      if (data.vehicles && Array.isArray(data.vehicles)) {
        // Filter vehicles for current route on the client side
        const routeVehicles = data.vehicles
          .filter(v => v && v.id && v.id.split('_')[0] === routeNumber)
          .map(v => ({
            ...v,
            minutes: v.minutes,
            vehicle_number: v.vehicle_number // Use the direct vehicle_number field
          }));
        console.log('Filtered vehicles:', routeVehicles);  // Debug log
        setVehicles(routeVehicles);
      } else {
        console.log('No vehicles data in response or invalid format:', data);  // Debug log
      }
    } catch (error) {
      console.error('Error fetching updates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicleLocations = async (vehicleNumbers) => {
    try {
      const response = await fetch('https://42cummer-stopseeker.hf.space/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ vehicle_numbers: vehicleNumbers })
      });
      const data = await response.json();
      console.log('Raw vehicle locations response:', data);

      // Now data.vehicles is the array you want
      const locations = {};
      if (Array.isArray(data.vehicles)) {
        data.vehicles.forEach(v => {
          if (vehicleNumbers.includes(String(v.vehicle_id))) {
            locations[v.vehicle_id] = {
              latitude: v.latitude,
              longitude: v.longitude,
              occupancy_status: v.occupancy_status
            };
          }
        });
      } else {
        console.error('vehicles property missing or not an array:', data);
      }
      setVehicleLocations(locations);
      console.log('Vehicle locations:', locations);
    } catch (error) {
      console.error('Error fetching vehicle locations:', error);
    }
  };

  useEffect(() => {
    // Set up the refresh interval
    const intervalId = setInterval(fetchUpdatedVehicles, 30000); // 45 seconds

    // Clean up the interval when component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array means this effect runs once on mount

  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const numbers = vehicles.map(v => String(v.vehicle_number));
      fetchVehicleLocations(numbers);
    }
  }, [vehicles]);

  const getVehicleModel = (vehicleNumber) => {
    const num = parseInt(vehicleNumber);
    for (const [range, data] of Object.entries(models)) {
      const [start, end] = range.split('-').map(n => parseInt(n));
      if (num >= start && num <= end) {
        return {
          model: data.model,
          charging: data.charging || false,
          streetcar: data.streetcar || false
        };
      }
    }
    return null;
  };

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

  const busIconUrl = 'https://www.freeiconspng.com/uploads/red-bus-icon-8.png';

  // Prepare JS for vehicle markers and bounds
  const vehicleMarkersJS = Object.entries(vehicleLocations)
    .map(([id, v]) =>
      v.latitude && v.longitude
        ? `
          var busIcon = L.icon({
            iconUrl: '${busIconUrl}',
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28]
          });
          var marker = L.marker([${v.latitude}, ${v.longitude}], {icon: busIcon})
            .addTo(map)
            .bindPopup('Bus ${id}');
          bounds.push([${v.latitude}, ${v.longitude}]);
        `
        : ''
    ).join('\n');

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
          var bounds = [];
          // Add the OpenStreetMap tiles with attribution
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(map);
          // Add marker for the stop location
          L.marker([${stopInfo.latitude}, ${stopInfo.longitude}])
            .addTo(map)
            .bindPopup('${stopInfo.name}')
            .openPopup();
          bounds.push([${stopInfo.latitude}, ${stopInfo.longitude}]);
          // Add vehicle markers and their bounds
          ${vehicleMarkersJS}
          // Fit map to show all markers
          if (bounds.length > 1) {
            map.fitBounds(bounds, {padding: [30, 30]});
          }
        </script>
      </body>
    </html>
  `;

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchUpdatedVehicles().then(() => setRefreshing(false));
  }, []);

  // Set the page title to include the stop id
  React.useEffect(() => {
    if (navigation && stopInfo && stopInfo.stop) {
      navigation.setOptions({
        title: `${routeNumber} ${routeName} at stop #${stopInfo.stop}`
      });
    }
  }, [navigation, stopInfo, routeNumber, routeName]);

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
        {isLoading && <Text style={styles.refreshingText}>Refreshing...</Text>}
      </View>
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            titleColor="#fff"
          />
        }
      >
        {vehicles && vehicles.length > 0 ? (
          // Prevent duplicate vehicle entries by filtering unique vehicle_number
          (() => {
            const seen = new Set();
            const uniqueVehicles = vehicles.filter(vehicle => {
              if (!vehicle.vehicle_number) return true; // keep if no vehicle_number
              if (seen.has(vehicle.vehicle_number)) return false;
              seen.add(vehicle.vehicle_number);
              return true;
            });
            return uniqueVehicles
              .filter(vehicle => {
                // Only show if vehicle has a vehicle number
                return vehicle.vehicle_number;
              })
              .map((vehicle, index) => {
                const min = vehicle.minutes ? parseInt(vehicle.minutes) : null;
                let minutesDisplay;
                if (min === 0) {
                  minutesDisplay = 'Now';
                } else if (min !== null && !isNaN(min)) {
                  minutesDisplay = `In ${min} minutes`;
                } else {
                  minutesDisplay = 'Time unknown';
                }
                const arrival = getArrivalTime(min);
                const modelInfo = getVehicleModel(vehicle.vehicle_number);

                // Delay text with +/- and color
                let delayText = null;
                if (vehicle.delay_text && typeof vehicle.delay_text === 'string') {
                  let match = vehicle.delay_text.match(/^(\d+:\d{2})\s+(ahead|behind)$/);
                  if (match) {
                    const [ , time, status ] = match;
                    if (time === '0:00') {
                      delayText = (
                        <Text style={{ color: '#fff' }}>
                          {' '}(on time)
                        </Text>
                      );
                    } else if (status === 'ahead') {
                      delayText = (
                        <Text style={{ color: 'green' }}>
                          {' '}(+{time})
                        </Text>
                      );
                    } else if (status === 'behind') {
                      delayText = (
                        <Text style={{ color: 'red' }}>
                          {' '}(-{time})
                        </Text>
                      );
                    }
                  } else {
                    // fallback if format is unexpected
                    delayText = (
                      <Text>
                        {' '}({vehicle.delay_text})
                      </Text>
                    );
                  }
                }

                return (
                  <View key={index} style={styles.vehicleInfoRow}>
                    <View style={{flex: 1}}>
                      <Text style={styles.vehicleTimeText}>
                        {minutesDisplay}
                        {"\n"}
                        at {arrival} {delayText}
                      </Text>
                      <Text style={styles.vehicleRouteText}>
                        {routeNumber} {routeName}
                      </Text>
                    </View>
                    {vehicle.vehicle_number && (
                      <View style={styles.vehicleNumberBlock}>
                        <Text style={styles.vehicleNumberText}>
                          {vehicle.vehicle_number}
                          {modelInfo?.charging && <FontAwesome name="usb" size={14} color="#fff" style={{marginLeft: 4}} />}
                          {modelInfo?.streetcar && <FontAwesome name="train" size={14} color="#fff" style={{marginLeft: 4}} />}
                        </Text>
                        {modelInfo && (
                          <Text style={styles.vehicleModelBlock}>{modelInfo.model}</Text>
                        )}
                      </View>
                    )}
                  </View>
                );
              });
          })()
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
  vehicleNumberText: {
    backgroundColor: '#ff1717',
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 8,
    textAlign: 'center',
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleModelBlock: {
    color: '#CCCCCC',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
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
