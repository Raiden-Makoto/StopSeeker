import { StyleSheet } from 'react-native';

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
    padding: 12,
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
  },
  routeTitle: {
    color: '#ff1717',
    fontSize: 16,
    fontWeight: 'bold',
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
}); 