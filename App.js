import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Image, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import ImagePicker from 'react-native-image-crop-picker';

export default function App() {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
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
    Alert.alert(
      "Crop Image",
      "Please crop the image to show only the bus stop pole",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "OK",
          onPress: async () => {
            try {
              const croppedImage = await ImagePicker.openCropper({
                path: photo,
                width: 300,
                height: 300,
                cropperCircleOverlay: false,
                freeStyleCropEnabled: true,
                cropperToolbarTitle: 'Crop Image',
                cropperToolbarColor: '#000000',
                cropperStatusBarColor: '#000000',
                cropperActiveWidgetColor: '#000000',
                cropperToolbarWidgetColor: '#ffffff',
              });
              
              setPhoto(croppedImage.path);
            } catch (error) {
              console.error('Error cropping image:', error);
            }
          }
        }
      ]
    );
  }

  if (photo) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: photo }} style={styles.preview} />
        <View style={styles.previewButtons}>
          <TouchableOpacity style={styles.previewButton} onPress={cropImage}>
            <Text style={styles.text}>Crop</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.previewButton} onPress={() => setPhoto(null)}>
            <Text style={styles.text}>Retake</Text>
          </TouchableOpacity>
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
        <View style={styles.captureButtonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
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
});