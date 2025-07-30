import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { Buffer } from "buffer";
import {EXPO_PUBLIC_ELEVEN_LABS_API_KEY } from '@env';

const ELEVEN_LABS_API_KEY = process.env.EXPO_PUBLIC_ELEVEN_LABS_API_KEY;
const VOICE_ID = "MF3mGyEYCl7XYWbV9V6O"; 

export async function playWithElevenLabs(text) {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: "POST",
      headers: {
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const audioData = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioData).toString("base64");

    const fileUri = FileSystem.documentDirectory + "voice.mp3";
    await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
      encoding: FileSystem.EncodingType.Base64
    });

    const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
    await sound.playAsync();
  } catch (err) {
    console.error("TTS error:", err);
  }
}
