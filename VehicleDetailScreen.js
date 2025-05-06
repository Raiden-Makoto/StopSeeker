import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function VehicleDetail({ route, navigation }) {
  const { vehicleNumber, modelInfo, stopInfo, location, destination, delayText } = route.params; // Get the vehicle number from params


  useEffect(() => {
    // Set the title of the page to the vehicle number
    //navigation.setOptions({ title: vehicleNumber });
  }, [navigation, vehicleNumber]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Vehicle Number: {vehicleNumber}</Text>
      {/* Add more details about the vehicle here */}
    </View>
  );
};

