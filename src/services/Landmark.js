import * as Location from 'expo-location';
import * as Speech from 'expo-speech';
import { playWithElevenLabs } from './playwithelevenlabs';
const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";

function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
  const R = 6371e3;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getCurrentLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;
  const location = await Location.getCurrentPositionAsync({});
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
  };
}

async function fetchNearbyLandmarks({ lat, lng }) {
  const radius = 2000;
  const type = "tourist_attraction";
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&key=${GOOGLE_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results;
}

export async function exploreNearby() {
  const location = await getCurrentLocation();
  if (!location) return;

  const places = await fetchNearbyLandmarks(location);
  if (!places || places.length === 0) {
    Speech.speak("No interesting places found nearby.");
    return;
  }

  let closestPlace = places[0];
  let minDistance = getDistanceFromLatLonInMeters(
    location.lat,
    location.lng,
    closestPlace.geometry.location.lat,
    closestPlace.geometry.location.lng
  );

  for (let place of places) {
    const distance = getDistanceFromLatLonInMeters(
      location.lat,
      location.lng,
      place.geometry.location.lat,
      place.geometry.location.lng
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestPlace = place;
    }
  }

  const distanceText =
    minDistance < 1000
      ? `${Math.round(minDistance)} meters`
      : `${(minDistance / 1000).toFixed(1)} kilometers`;

  const placeName = closestPlace.name;

  const description = `Tell me about ${placeName}, including its history, location, and why it's famous.`;

  const finalText = `You're just ${distanceText} away from ${placeName}. ${description}`;
  console.log("Nearby place prompt:", finalText);
  playWithElevenLabs(finalText);
}
