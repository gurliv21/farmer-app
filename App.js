import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import "./global.css";
import LandingPage from './src/screens/LandingPage.js';
import HomeScreen from './src/screens/HomeScreen.js';
import Dashboard from './src/screens/Dashboard.js';
import { StatusBar } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import WeatherScreen from './src/screens/WeatherScreen.js';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'HomeScreen') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'Dashboard') {
          iconName = focused ? 'bar-chart' : 'bar-chart-outline';
        } else if (route.name === 'Weather') {
          iconName = focused ? 'cloud' : 'cloud-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#ff8112',
      tabBarInactiveTintColor: 'white',
      tabBarStyle: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        marginHorizontal: 20,
        marginBottom: 40,
        height: 60,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        borderTopWidth: 0,
        paddingTop: 8,
      },
    })}
  >
    <Tab.Screen name="HomeScreen" component={HomeScreen} />
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen
      name="Weather"
      children={() => (
        <>
          <HomeScreen />
          <WeatherScreen />
        </>
      )}
    />
  </Tab.Navigator>
);

const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar hidden={true} />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Landing" component={LandingPage} />
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
