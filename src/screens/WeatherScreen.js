import {EXPO_PUBLIC_GOOGLE_MAPS_API_KEY} from '@env';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import Icon from 'react-native-vector-icons/Feather';
const WeatherScreen = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY; 

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          alert('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const response = await axios.get(
          `https://weather.googleapis.com/v1/currentConditions:lookup`,
          {
            params: {
              key:MAPS_API_KEY,
              'location.latitude': latitude,
              'location.longitude': longitude,
            },
          }
        );

        setWeather(response.data);
        console.log(response.data);
        setLoading(false);
      } catch (error) {
        console.log('Error fetching weather:', error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#333" />
          <Text style={{ marginTop: 10 }}>Fetching weather...</Text>
        </View>
      </View>
    );
  }

  if (!weather || !weather.weatherCondition) {
    return (
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={{ fontSize: 18 }}>Unable to fetch weather data.</Text>
        </View>
      </View>
    );
  }

  const { temperature, weatherCondition } = weather;
  const iconUri = `${weatherCondition.iconBaseUri}.png`;
  const description = weatherCondition.description.text;
  const temp = `${temperature.degrees}°${temperature.unit}`;
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text className="text-black/70 text-left"> Weather </Text>
        <View className="flex items-center">
        <Image source={{ uri: iconUri }} style={styles.icon} />
        <Text className="font-bold text-xl" >{description}</Text>
        </View>
<View style={{ flexDirection: 'row', justifyContent: 'space-evenly', marginTop: 50, marginBottom: 20 }}>
  <View >
    <Icon name="thermometer" size={20} />
    <Text>{weather.temperature.degrees}°C</Text>
    <Text>Temperature</Text>
  </View>
  <View >
    <Icon name="droplet" size={20} />
    <Text>{weather.relativeHumidity}%</Text>
    <Text>Humidity</Text>
  </View>
  <View>
    <Icon name="cloud-rain" size={20} />
    <Text>{weather.precipitation.probability.percent}%</Text>
    <Text>Rain</Text>
  </View>
  <View >
    <Icon name="wind" size={20} />
    <Text>{weather.wind.speed.value} K/H</Text>
    <Text>Wind</Text>
  </View>
</View>

      </View>
    </View>
  );
};

export default WeatherScreen;

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    backgroundColor: '#f2e3d5',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    top: 160,

  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  icon: {
    width: 64,
    height: 64,
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
  temp: {
    fontSize: 22,
    marginTop: 5,
    fontWeight: 'bold',
  },
});
