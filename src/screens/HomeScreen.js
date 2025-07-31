import React, { useState, useEffect,useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, StyleSheet, Dimensions, ScrollView, Image,Button, Platform
} from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculatePolygonArea } from '../utils/calculateArea';
import DateTimePicker from '@react-native-community/datetimepicker';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Location from 'expo-location';
const { width } = Dimensions.get('window');

const COLORS = ['#00B4D8', '#90BE6D', '#ff78eb', '#F9C74F', '#577590', '#43AA8B', '#E07A5F', '#F3722C','#fff'];

export default function HomeScreen({navigation}) {
  const [drawingMode, setDrawingMode] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [savedPolygons, setSavedPolygons] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cropName, setCropName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [image, setImage] = useState(null);
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [showSowPicker, setShowSowPicker] = useState(false);
const [showHarvestPicker, setShowHarvestPicker] = useState(false);
const [tempSowDate, setTempSowDate] = useState(new Date());
const [tempHarvestDate, setTempHarvestDate] = useState(new Date());
  const [modalVisible1, setModalVisible1] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [taskInputVisible, setTaskInputVisible] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [place, setPlace] = useState('');

const mapRef = useRef(null);


 useEffect(() => {
    (async () => {
      const storedPlots = await AsyncStorage.getItem('plots');
      if (storedPlots) {
        try {
          const parsed = JSON.parse(storedPlots);


          parsed.forEach((plot, i) => {
            // console.log(Plot ${i + 1} coordinates:);
            plot.coordinates.forEach((c, j) => {
              // console.log(  Point ${j + 1}:, c);
            });
          });

          const cleaned = parsed.map((plot) => ({
            ...plot,
            coordinates: plot.coordinates.map(coord => {
              const lat = Number(coord.latitude ?? coord.lat ?? coord._latitude);
              const lng = Number(coord.longitude ?? coord.lng ?? coord._longitude);
              return {
                latitude: lat,
                longitude: lng,
              };
            }),
          }));

          setSavedPolygons(cleaned);
        } catch (e) {
          console.error('Error parsing plots from AsyncStorage:', e);
        }
      }
    })();
  }, []);

const handleMapPress = (e) => {
    if (!drawingMode) return;
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCurrentPolygon([...currentPolygon, { latitude, longitude }]);
  };
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access media required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const finishDrawing = () => {
    if (currentPolygon.length >= 3) {
      setModalVisible(true);
    } else {
      alert("Draw at least 3 points.");
    }
  };


  const savePolygon = async () => {
       const area = calculatePolygonArea(currentPolygon);


const newPlot = {
    id: uuidv4(), 
    coordinates: currentPolygon.map(pt => ({
      latitude: pt.latitude,
      longitude: pt.longitude
    })),
    crop: cropName,
    color: selectedColor,
    image: image,
    area: area.toFixed(2),

  };
    const updatedPolygons = [...savedPolygons, newPlot];
    setSavedPolygons(updatedPolygons);
    await AsyncStorage.setItem('plots', JSON.stringify(updatedPolygons));


    setCurrentPolygon([]);
    setCropName('');
    setImage(null);
    setModalVisible(false);
    setDrawingMode(false);
  };
 const saveDate = (type, date) => {
  const formattedDate = date.toISOString().split('T')[0];

  const updated = savedPolygons.map(p => {
    if (
      p.id === selectedPlot.id
    ) {
      return {
        ...p,
        [type]: formattedDate,
      };
    }
    return p;
  });

  const updatedSelected = {
    ...selectedPlot,
    [type]: formattedDate,
  };

  setSavedPolygons(updated);
  AsyncStorage.setItem('plots', JSON.stringify(updated));
  setSelectedPlot(updatedSelected);
};

const addTask = async () => {
  if (!newTask.trim()) return;

  const updated = savedPolygons.map(p => {
    if (
      p.id === selectedPlot.id
    ) {
      return {
        ...p,
        tasks: [...(p.tasks || []), newTask.trim()],
      };
    }
    return p;
  });

  const updatedSelected = {
    ...selectedPlot,
    tasks: [...(selectedPlot.tasks || []), newTask.trim()],
  };

  setSavedPolygons(updated);
  await AsyncStorage.setItem('plots', JSON.stringify(updated));
  setSelectedPlot(updatedSelected);
  setNewTask('');
  setTaskInputVisible(false);
};

//  useEffect(()=>{
// const clearAllStorage = async () => {
//   try {
//     await AsyncStorage.clear();
//     console.log('AsyncStorage cleared!');
//   } catch (error) {
//     console.error('Error clearing AsyncStorage:', error);
//   }
// };
// clearAllStorage();
//  },[])
const handleSearch = async () => {
  if (!place.trim()) return;

  try {
    const result = await Location.geocodeAsync(place);

    if (result.length > 0) {
      const { latitude, longitude } = result[0];


      mapRef.current?.animateCamera({
        center: { latitude, longitude },
        zoom: 16,
        pitch: 45,
      });

      setShowInput(false);
      setPlace('');
    } else {
      alert('Location not found');
    }
  } catch (error) {
    alert('Error fetching coordinates');
    console.error(error);
  }
};
const destroyField = async () => {
  if (!selectedPlot) return;

  const updatedPolygons = savedPolygons.map(p => {
    if (p.id === selectedPlot.id) {
      return {
        ...p,
        color: 'rgba(255,0,0,0.5)',  
        crop: 'Destroyed',
      };
    }
    return p;
  });

  const updatedSelected = {
    ...selectedPlot,
    color: 'rgba(255,0,0,0.5)',
    crop: 'Destroyed',
  };

  setSavedPolygons(updatedPolygons);
  await AsyncStorage.setItem('plots', JSON.stringify(updatedPolygons));
  setSelectedPlot(updatedSelected);
  setModalVisible1(false); 
};

const hexToRgba = (hex, alpha = 0.5) => {
  let r = 0, g = 0, b = 0;

  if (hex.startsWith('#')) {
    hex = hex.slice(1);
  }

  if (hex.length === 3) {

    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {

    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  return `rgba(${r},${g},${b},${alpha})`;
};


  return (
    <View style={{ flex: 1 }}>
      <MapView
      ref={mapRef}
        style={{ width, height: '100%' }}
        mapType="satellite"
        onPress={handleMapPress}
        initialRegion={{
          latitude: 30.507,
          longitude: 74.95,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {savedPolygons.map((plot, idx) => (
          <React.Fragment key={idx}>
            <Polygon
  coordinates={plot.coordinates}
  strokeColor="#000"
  fillColor={plot.color || 'rgba(0,0,255,0.3)'}
  strokeWidth={2}
  tappable={true} 
  onPress={() => {
    setSelectedPlot(plot); 
    setModalVisible1(true); 
  }}
/>

            {plot.coordinates.length > 0 && (
              <Marker coordinate={plot.coordinates[0]}>
                <View style={styles.markerBox}>
                  {plot.image && <Image source={{ uri: plot.image }} style={styles.markerImage} />}
                  <Text style={styles.markerText}>{plot.crop}</Text>
                </View>
              </Marker>
            )}
          </React.Fragment>
        ))}

        {currentPolygon.map((point, index) => (
          <Marker key={index} coordinate={point}>
            <View style={styles.pointMarker} />
          </Marker>
        ))}
      </MapView>


      {!drawingMode ? (
             <TouchableOpacity
          className="absolute top-14 right-16 z-10 bg-orange-400 p-4 px-5 rounded-2xl"
          onPress={() => setDrawingMode(true)}
        >
          <Text style={styles.drawButtonText} className="text-2xl">+</Text>
        </TouchableOpacity>

   
      ) : (
        <View  className="absolute top-16 right-4 z-10 gap-4 p-4 rounded-2xl">
          <TouchableOpacity style={styles.actionBtn} onPress={finishDrawing}>
            <Text style={{ color: 'white' }}>Finish</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#ccc' }]}
            onPress={() => {
              setCurrentPolygon([]);
              setDrawingMode(false);
            }}
          >
            <Text>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}


     <Modal
  animationType="slide"
  transparent={true}
  visible={modalVisible1}
  onRequestClose={() => setModalVisible1(false)}
>
 <View style={{ flex: 1,  justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 40, left: 20, backgroundColor: 'orange', padding: 10, paddingHorizontal:15,borderRadius: 20, zIndex: 10 }}
          onPress={() => setModalVisible1(false)}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>X</Text>
        </TouchableOpacity>

        <View style={{ margin: 20, backgroundColor: '#fce5c5', borderRadius: 10, padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#444' }}>
              {selectedPlot?.crop || "Unknown Crop"}
            </Text>
            <View style={{ backgroundColor: 'orange', padding: 8, borderRadius: 20 }}>
              <Text style={{ color: 'white' }}>
                {selectedPlot?.area
                  ? `${parseFloat(selectedPlot.area).toFixed(2)} acres`
                  : 'Area not calculated'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 40 }} className="flex flex-row justify-between">
            <Text  className="text-black/70 font-bold">Sowed On</Text>
            {selectedPlot?.sowDate ? (
              <Text>{selectedPlot.sowDate}</Text>
            ) : (
              <Button title="Select Sow Date" onPress={() => setShowSowPicker(true)} />
            )}
          </View>

          <View style={{ marginTop: 10 }} className="flex flex-row justify-between">
            <Text className="text-black/70 font-bold"> Harvested On</Text>
            {selectedPlot?.harvestDate ? (
              <Text>{selectedPlot.harvestDate}</Text>
            ) : (
              <Button title="Select Har Date" onPress={() => setShowHarvestPicker(true)} />
            )}
          </View>
          <TouchableOpacity
  onPress={destroyField}
  style={{
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  }}
>
  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Destroy Field</Text>
</TouchableOpacity>

          <View style={{ marginTop: 20 }}>
            <Text className="text-black/70 font-bold"> Tasks:</Text>
            {(selectedPlot?.tasks || []).map((task, idx) => (
              <Text key={idx}>• {task}</Text>
            ))}
           {taskInputVisible ? (
  <View >
    <TextInput
      placeholder="Enter task"
      value={newTask}
      onChangeText={setNewTask}
      style={{
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginTop: 10,
        padding: 8,
      }}
                />
<TouchableOpacity
      onPress={addTask}
      style={{
        backgroundColor: '#f97316', 
        padding: 10,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        width: 100,
      }}
    >
      <Text style={{ color: '#fff', fontWeight: 'bold' }}>Save Task</Text>
    </TouchableOpacity>
              </View>
            ) : (
<TouchableOpacity
    onPress={() => setTaskInputVisible(true)}
    style={{
      backgroundColor: '#f97316',
      padding: 10,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
      width: 100,
    }}
  >
    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Add Task</Text>
  </TouchableOpacity>

            )}
          </View>
        </View>

        {showSowPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowSowPicker(false);
              if (date) saveDate('sowDate', date);
            }}
          />
        )}

        {showHarvestPicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            onChange={(_, date) => {
              setShowHarvestPicker(false);
              if (date) saveDate('harvestDate', date);
            }}
          />
        )}
      </View>
</Modal> 
 <View className="absolute top-14 right-36 z-10 bg-orange-100 p-4 rounded-2xl">



      {showInput ? (
        <View className=" flex flex-row gap-4  ">
          <TextInput
            className="bg-white rounded-md px-3 py-2 w-48 border border-gray-300 text-black"
            placeholder="Enter place name"
            placeholderTextColor="#888"
            value={place}
            onChangeText={setPlace}
          />
          <TouchableOpacity
            onPress={handleSearch}
            className="bg-orange-400 rounded-md py-2 w-[80px]"
          >
            <Text className="text-white text-center font-semibold">Search</Text>
          </TouchableOpacity>
        </View>
      ):(
      <TouchableOpacity onPress={() => setShowInput(!showInput)} >
        <Icon name="search" size={24} color="#000" />
      </TouchableOpacity>
      )}
    </View>
<Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView>
              <Text style={styles.modalTitle}>Add Crop Info</Text>
              <TextInput
                placeholder="Crop Name"
                value={cropName}
                onChangeText={setCropName}
                style={styles.input}
              />

              <Text>Select Color:</Text>
              <View style={styles.colorRow}>
                {COLORS.map((color, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.colorCircle,
                      {
                        backgroundColor: color,
                        borderWidth: selectedColor === color ? 3 : 1,
                      },
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Text>Pick Image</Text>
              </TouchableOpacity>

              {image && (
                <Image
                  source={{ uri: image }}
                  style={{ height: 100, width: '100%', marginVertical: 10 }}
                  resizeMode="cover"
                />
              )}

              <TouchableOpacity style={styles.saveBtn} onPress={savePolygon}>
                <Text style={{ color: 'white' }}>Save Plot</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  drawButton: {
    position: 'absolute',
    Top: 40,
    left: 20,
    backgroundColor: '#00B4D8',
    padding: 12,
    borderRadius: 10,
    zIndex:10
  },
  drawButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  actionRow: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    backgroundColor: '#ffaa26',
    padding: 10,
    borderRadius: 8,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '90%',
  },
  modalTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 12,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
    gap: 10,
  },
  colorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderColor: '#000',
  },
  imageBtn: {
    backgroundColor: '#e5e5e5',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 15,
    backgroundColor: '#43AA8B',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  pointMarker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerBox: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 100,
  },
  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginBottom: 2,
  },
  markerText: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#f2e3d5',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalArea: {
    fontSize: 16,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
  },
});