import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#242424',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  text: {
    fontSize: 16,
    marginBottom: 5,
    color: 'rgba(255, 255, 255, 0.87)',
    fontFamily: 'System',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    height: 395,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#ff1717',
    backgroundColor: '#000',
    padding: 10,
  },
  routeItem: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  routeTitle: {
    margin: 0,
    color: '#dc0000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeText: {
    marginVertical: 5,
    color: '#333',
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