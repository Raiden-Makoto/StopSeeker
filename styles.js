import { StyleSheet, Dimensions } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff1717',
    backgroundColor: '#000000',
    padding: 15,
    textAlign: 'center',
  },
  routesHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff1717',
    padding: 15,
    textAlign: 'center',
  },
  mapContainer: {
    height: 300,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: '#000000',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#ffffff',
    fontFamily: 'System',
  },
  routeItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
    overflow: 'hidden',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  expandIcon: {
    fontSize: 16,
    marginLeft: 10,
  },
  routeContent: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#000000',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#f1f1f1',
    padding: 10,
    alignItems: 'center',
  },
  link: {
    color: '#dc0000',
    textDecorationLine: 'none',
  },
  linkPressed: {
    textDecorationLine: 'underline',
  },
  manualInputContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  specialImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').width * 0.8,
    marginBottom: 40,
    alignSelf: 'center',
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#ff1717',
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
    marginTop: 40,
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
}); 