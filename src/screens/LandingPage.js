import {
  View,
  Text,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { getInfo } from '../services/geminiapi'; 
import { playWithElevenLabs } from '../services/playwithelevenlabs';
const LandingPage = ({ navigation }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  

//   useEffect(() => {
//     const speak = async () => {
      
//        playWithElevenLabs('Golden Gate Bridge is a famous landmark it was made for gurliv she loves it .');
//     };
//     speak();
//   }, []);

  return (
    <ImageBackground
      className="h-full w-full"
      source={require('./../assets/img1.png')}
      resizeMethod="cover"
      imageStyle={{ opacity: 0.9 }}
    >
      <KeyboardAvoidingView
        className="bg-white absolute bottom-0 w-full h-[50%] rounded-t-[60px] py-[60px] px-[40px]"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Text className="font-bold text-gray-700 text-[20px] mb-4">Starting Point</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-md p-3 bg-white"
          placeholder="📍"
          value={origin}
          onChangeText={setOrigin}
        />
        <Text className="font-bold text-gray-700 text-[20px] mb-4 mt-8">Destination</Text>
        <TextInput
          className="w-full border border-gray-300 rounded-md p-3 bg-white"
          placeholder="📍"
          value={destination}
          onChangeText={setDestination}
        />
        <View className="flex justify-center items-center">
          <TouchableOpacity
            className="bg-blue-500 w-[50%] mt-[42px] p-4 px-6 rounded-full"
            onPress={() =>
              navigation.navigate('RouteMap', {
                origin: origin,
                destination: destination,
              })
            }
          >
            <Text className="text-white font-semibold text-center text-[17px]">
              Get Started
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default LandingPage;
