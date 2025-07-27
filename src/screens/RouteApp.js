import React, { useEffect, useState } from 'react';
import { View, Alert, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import polyline from '@mapbox/polyline';
import * as Location from 'expo-location';
import { getInfo } from '../services/geminiapi';
import { Audio } from 'expo-av';
import { playWithElevenLabs } from '../services/playwithelevenlabs';
import { exploreNearby } from '../services/Landmark';
const { width, height } = Dimensions.get('window');

export default function RouteApp({ route }) {
  const { origin, destination } = route.params;

  const [coords, setCoords] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [region, setRegion] = useState(null);

  const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  let lastCity = "";

 

  const getRoute = async () => {
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();

      if (!json.routes || json.routes.length === 0) {
        Alert.alert('No route found. Check origin or destination.');
        return;
      }

      const points = polyline.decode(json.routes[0].overview_polyline.points);
      const routeCoords = points.map(point => ({
        latitude: point[0],
        longitude: point[1],
      }));

      setCoords(routeCoords);
    } catch (error) {
      console.error(error);
      Alert.alert('Something went wrong getting route.');
    }
  };

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission to access location was denied');
      return;
    }

    const loc = await Location.getCurrentPositionAsync({});
    setUserLocation(loc.coords);
    setRegion({
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });

    Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 2000,
        distanceInterval: 5,
      },
      (loc) => {
        setUserLocation(loc.coords);
        setRegion({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    );
  };

  const fetchGeminiLocationInfo = async (coords) => {
    try {
      const geocode = await Location.reverseGeocodeAsync(coords);
      const city = geocode?.[0]?.city;

      if (city && city !== lastCity) {
        lastCity = city;

        const prompt = `Tell me about ${city} like a fun travel guide or a travel companion. What's it known for, its food, culture, history, and must-see spots in one line each. Start you are in ${city} and continue from here?`;
        const response = await getInfo(prompt);

        if (response) {
          console.log("Gemini on City:", response);
          // playWithElevenLabs(response);
        }
      }
    } catch (e) {
      console.log("Gemini fetch error:", e);
    }
  };
  useEffect(() => {
  const track = async () => {
    const sub = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 10000, distanceInterval: 200 },
      async (location) => {
        const coords = location.coords;
        await fetchGeminiLocationInfo(coords);
        await exploreNearby(); 
      }
    );

    return () => sub?.remove();
  };

  track();
}, []);


  useEffect(() => {
    if (origin && destination) {
      getRoute();
      startTracking();
    }
  }, []);


  return (
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} region={region} showsUserLocation followsUserLocation>
          {coords.length > 0 && (
            <>
              <Marker coordinate={coords[0]} title="Start" />
              <Marker coordinate={coords[coords.length - 1]} title="End" />
              <Polyline coordinates={coords} strokeWidth={5} strokeColor="blue" />
            </>
          )}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
});
