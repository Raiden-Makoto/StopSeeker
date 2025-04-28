import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert, TextInput, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MapScreen from './MapScreen';
import RouteDetailScreen from './RouteDetailScreen';

const Stack = createNativeStackNavigator();

function CameraScreen({ navigation }) {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [stopInfo, setStopInfo] = useState(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualStopId, setManualStopId] = useState('');
  const [cropStart, setCropStart] = useState(null);
  const [cropEnd, setCropEnd] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function toggleInputMode() {
    setIsManualMode(!isManualMode);
    setPhoto(null);
    setStopInfo(null);
  }

  async function takePhoto() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log('Photo taken:', photo);
        
        // Create a temporary file path
        const tempFilePath = `${FileSystem.cacheDirectory}temp_photo_${Date.now()}.jpg`;
        
        // Copy the photo to the temporary location
        await FileSystem.copyAsync({
          from: photo.uri,
          to: tempFilePath
        });
        
        console.log('Photo saved to:', tempFilePath);
        setPhoto(tempFilePath);
      } catch (error) {
        console.error('Error taking/saving photo:', error);
      }
    }
  }

  async function cropImage() {
    if (!photo) return;
    
    setIsCropping(true);
    Alert.alert(
      "Crop Image",
      "Please select the area to crop by dragging on the image",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            setIsCropping(false);
            setCropStart(null);
            setCropEnd(null);
          }
        },
        {
          text: "Crop",
          onPress: async () => {
            if (!cropStart || !cropEnd) {
              Alert.alert('Error', 'Please select an area to crop');
              return;
            }

            try {
              const { width, height } = await ImageManipulator.getImageSizeAsync(photo);
              const cropWidth = Math.abs(cropEnd.x - cropStart.x);
              const cropHeight = Math.abs(cropEnd.y - cropStart.y);
              const originX = Math.min(cropStart.x, cropEnd.x);
              const originY = Math.min(cropStart.y, cropEnd.y);

              const manipResult = await ImageManipulator.manipulateAsync(
                photo,
                [{
                  crop: {
                    originX: (originX / Dimensions.get('window').width) * width,
                    originY: (originY / Dimensions.get('window').height) * height,
                    width: (cropWidth / Dimensions.get('window').width) * width,
                    height: (cropHeight / Dimensions.get('window').height) * height
                  }
                }],
                { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
              );
              
              setPhoto(manipResult.uri);
            } catch (error) {
              console.error('Error cropping image:', error);
              Alert.alert('Error', 'Failed to crop image. Please try again.');
            } finally {
              setIsCropping(false);
              setCropStart(null);
              setCropEnd(null);
            }
          }
        }
      ]
    );
  }

  function handleImagePress(event) {
    if (!isCropping) return;
    
    const { locationX, locationY } = event.nativeEvent;
    if (!cropStart) {
      setCropStart({ x: locationX, y: locationY });
    } else {
      setCropEnd({ x: locationX, y: locationY });
    }
  }

  async function uploadImage() {
    if (!photo) return;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: photo,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await fetch('https://42Cummer-StopSeeker.hf.space/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setStopInfo({
        stopId: result.stop,
        routes: result.routes
      });
      
      // Navigate to the map screen with the stop information
      navigation.navigate('Map', {
        stopId: result.stop,
        routes: result.routes
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleManualSubmit() {
    if (!manualStopId.trim()) {
      Alert.alert('Error', 'Please enter a stop number');
      return;
    }

    setIsUploading(true);
    try {
      console.log('Fetching stop information for:', manualStopId);
      const response = await fetch('https://42Cummer-StopSeeker.hf.space/seek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ stop: manualStopId.trim() })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Received data:', data);
      
      if (!data.routes) {
        throw new Error('No routes found in response');
      }
      
      navigation.navigate('Map', {
        stopId: manualStopId,
        routes: data.routes,
        vehicles: data.vehicles || []
      });
    } catch (error) {
      console.error('Error fetching stop information:', error);
      Alert.alert(
        'Error',
        `Failed to fetch stop information: ${error.message}. Please try again.`
      );
    } finally {
      setIsUploading(false);
    }
  }

  if (photo) {
    return (
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.previewContainer} 
          onPress={handleImagePress}
          activeOpacity={1}
        >
          <Image source={{ uri: photo }} style={styles.preview} />
          {isCropping && cropStart && (
            <View
              style={[
                styles.cropOverlay,
                {
                  left: Math.min(cropStart.x, cropEnd?.x || cropStart.x),
                  top: Math.min(cropStart.y, cropEnd?.y || cropStart.y),
                  width: cropEnd ? Math.abs(cropEnd.x - cropStart.x) : 0,
                  height: cropEnd ? Math.abs(cropEnd.y - cropStart.y) : 0,
                },
              ]}
            />
          )}
        </TouchableOpacity>
        <View style={styles.previewButtons}>
          <TouchableOpacity style={styles.previewButton} onPress={cropImage}>
            <Text style={styles.text}>{isCropping ? 'Select Area' : 'Crop'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.previewButton} onPress={() => {
            setPhoto(null);
            setStopInfo(null);
            setCropStart(null);
            setCropEnd(null);
            setIsCropping(false);
          }}>
            <Text style={styles.text}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.previewButton, isUploading && styles.disabledButton]} 
            onPress={uploadImage}
            disabled={isUploading}
          >
            <Text style={styles.text}>{isUploading ? 'Uploading...' : 'Upload'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isManualMode) {
    return (
      <View style={styles.container}>
        <View style={styles.manualInputContainer}>
          <Image 
            source={require('./assets/special.png')} 
            style={styles.specialImage}
            onError={(error) => console.error('Image loading error:', error.nativeEvent.error)}
            onLoad={() => console.log('Image loaded successfully')}
          />
          
          <TextInput
            style={styles.manualInput}
            value={manualStopId}
            onChangeText={setManualStopId}
            keyboardType="number-pad"
            placeholder="Enter stop number"
            placeholderTextColor="#666"
          />
          <View style={styles.manualInputButtons}>
            <TouchableOpacity
              style={[styles.manualInputButton, isUploading && styles.disabledButton]}
              onPress={handleManualSubmit}
              disabled={isUploading}
            >
              <Text style={styles.text}>{isUploading ? 'Loading...' : 'Submit'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={toggleInputMode}
            >
              <Text style={styles.text}>Use Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
          <Text style={styles.text}>Flip Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.manualModeButton} onPress={toggleInputMode}>
          <Text style={styles.text}>Enter Stop Number</Text>
        </TouchableOpacity>
        <View style={styles.captureButtonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Map" 
          component={MapScreen}
          options={{ title: 'Stop Information' }}
        />
        <Stack.Screen 
          name="RouteDetail" 
          component={RouteDetailScreen}
          options={({ route }) => ({ 
            title: `${route.params.routeNumber} ${route.params.routeName}`,
            headerStyle: {
              backgroundColor: '#000000',
            },
            headerTintColor: '#ffffff',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  flipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
  },
  manualModeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  previewButtons: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  previewButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 5,
  },
  disabledButton: {
    opacity: 0.5,
  },
  manualInputContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#242424',
  },
  manualInputLabel: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
  manualInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    fontSize: 18,
    marginBottom: 20,
  },
  manualInputButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  manualInputButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 5,
    minWidth: 120,
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    width: '100%',
  },
  cropOverlay: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#ff1717',
    backgroundColor: 'rgba(255, 23, 23, 0.2)',
  },
  specialImage: {
    width: '100%',
    height: 100,
    marginBottom: 10,
  },
});