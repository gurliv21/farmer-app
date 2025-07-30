import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,Image
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { getInfo } from '../services/geminiapi'; 
import { playWithElevenLabs } from '../services/playwithelevenlabs';
const LandingPage = ({ navigation }) => {




  return (
    <View>
   <ImageBackground
      className="h-full w-full rounded-b-3xl"
      source={require('../../assets/img3.jpg')}
      resizeMethod="cover"

    >
      <View className=" absolute bottom-24">

          <Text className="font-extrabold text-[40px] text-white text-center mt-[32px] leading-[45px] ">Smart Farm  {'\n'} Mapping </Text>
    <Text className="text-[18px] text-white/70 text-center mt-6 px-2">Select your fields, assign crop types, and visualize your farm like never before.</Text>
    <View className="mt-16 flex justify-center items-center">
        <TouchableOpacity className="bg-orange-400 rounded-full p-4 items-center w-[170px]" onPress={()=>navigation.navigate('Main', { screen: 'HomeScreen' })}>
      <Text className="text-white font-semibold text-center  text-xl">Get started</Text>
    </TouchableOpacity>  
    </View>
      </View>
    </ImageBackground>



     
    </View>
 
    
  );
};

export default LandingPage;
