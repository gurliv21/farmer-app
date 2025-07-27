import { View, Text } from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react'
import "./global.css"
import LandingPage from './src/LandingPage'
import RouteApp from './src/RouteApp.js'
import { StatusBar } from 'react-native';

const Stack =  createNativeStackNavigator();
const App = () => {
  return (
    <NavigationContainer>
      <StatusBar hidden={true}/>
      <Stack.Navigator initialRouteName="Landing" screenOptions={{headerShown:false}}>
      <Stack.Screen name="Landing" component={LandingPage}/>
       <Stack.Screen name="RouteMap" component={RouteApp} />
       </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App