import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const screenWidth = Dimensions.get("window").width;

const Dashboard = () => {
  const [plots, setPlots] = useState([]);
  const [cropSummary, setCropSummary] = useState([]);
  const [totalArea, setTotalArea] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const fetchPlots = async () => {
    try {
      const saved = await AsyncStorage.getItem("plots");
      const parsed = saved ? JSON.parse(saved) : [];
      console.log(parsed)
      setPlots(parsed);

      const summary = {};
      let total = 0;

      parsed.forEach((plot) => {
        const area = parseFloat(plot.area) || 0;
        const cropName = plot.crop ?? "Unknown";
        const cropColor = plot.color ?? "#cccccc";

        if (!summary[cropName]) {
          summary[cropName] = { area: 0, color: cropColor };
        }

        summary[cropName].area += area;
        total += area;
      });

      setTotalArea(total);
      setCropSummary(
        Object.entries(summary).map(([name, { area, color }]) => ({
          name,
          area,
          color,
          legendFontColor: "#333",
          legendFontSize: 14,
        }))
      );
    } catch (error) {
      console.log("Error loading plots:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlots();
    }, [])
  );

  return (
    <View className="h-full w-full bg-[#f2e3d5]">
      <Text className="font-bold text-black/70 text-2xl mt-[40px] mx-[20px]">
        Crop Area Dashboard
      </Text>


      <View className="flex flex-row gap-0">
        {["overview", "tasks", "seasons"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`${
              activeTab === tab ? "bg-orange-600" : "bg-orange-400"
            } w-[80px] py-3 rounded-3xl items-center ml-[20px] mt-[20px]`}
          >
            <Text className="text-white font-semibold text-sm capitalize">
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

  
      {activeTab === "overview" && (
        <ScrollView className="px-[20px] pb-[80px]">
          {cropSummary.length > 0 ? (
            <View className="bg-[#f5d8ab] my-[40px] rounded-2xl p-[20px]">
              <Text className="text-black/70 font-bold">Field Data</Text>
              <PieChart
                data={cropSummary.map((c) => ({
                  name: c.name,
                  population: c.area,
                  color: c.color,
                  legendFontColor: c.legendFontColor,
                  legendFontSize: c.legendFontSize,
                }))}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  color: () => `#333`,
                  decimalPlaces: 2,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />

              <View className="mt-4">
                <Text className="font-bold text-black/70 text-xl">
                  Total Plots:{" "}
                  <Text className="font-bold text-black/90">{plots.length}</Text>
                </Text>
                <Text className="font-bold text-black/70 text-xl">
                  Total Area:{" "}
                  <Text className="font-bold text-black/90">
                    {(totalArea ?? 0).toFixed(2)} acres
                  </Text>
                </Text>
              </View>
            </View>
          ) : (
            <Text className="mt-[30px] text-base mx-[20px]">No plot data found.</Text>
          )}

          <Text className="text-lg font-bold mb-2">Crop Overview</Text>
          {plots.map((plot, index) => (
            <View
              key={index}
              className="flex-row items-center my-2 bg-[#f9f9f9] p-3 rounded-xl"
              style={{ elevation: 2 }}
            >
              <View
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: plot.color ?? "#ccc" }}
              />
              {plot.image && (
                <Image
                  source={{ uri: plot.image }}
                  className="w-[50px] h-[50px] rounded-lg mr-2"
                />
              )}
              <View>
                <Text className="text-base font-semibold">{plot.crop ?? "Unnamed"}</Text>
                <Text className="font-bold">
                  {parseFloat(plot.area ?? 0).toFixed(2)} acres
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}


      {activeTab === "tasks" && (
        <ScrollView className="px-[20px] pb-[80px]">
          <Text className="text-lg font-bold mb-4 mt-[30px]">Tasks by Plot</Text>
          {plots.map((plot, index) => (
            <View
              key={index}
              className="flex-row items-center my-2 bg-[#f9f9f9] p-3 rounded-xl"
              style={{ elevation: 2 }}
            >
              <View
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: plot.color ?? "#ccc" }}
              />
                            {plot.image && (
                <Image
                  source={{ uri: plot.image }}
                  className="w-[50px] h-[50px] rounded-lg mr-2"
                />
              )}
              <View>
                <Text className="text-base font-semibold">
                  {plot.crop ?? "Unnamed Plot"}
                </Text>
{plot.tasks && plot.tasks.length > 0 ? (
  plot.tasks.map((task, i) => (
    <Text key={i} className="text-sm text-gray-700">• {task}</Text>
  ))
) : (
  <Text className="text-sm text-gray-600">No tasks added yet.</Text>
)}
              </View>
            </View>
          ))}
        </ScrollView>
      )}


      {activeTab === "seasons" && (
        <ScrollView className="px-[20px] pb-[80px]">
          <Text className="text-lg font-bold mb-4 mt-[40px]">Crop Seasons Calendar</Text>
          {plots.map((plot, index) => (
            <View
              key={index}
              className="flex-row items-center my-2 bg-[#f9f9f9] p-3 rounded-xl"
              style={{ elevation: 2 }}
            >
              <View
                className="w-4 h-4 rounded-full mr-3"
                style={{ backgroundColor: plot.color ?? "#ccc" }}
              />
                            {plot.image && (
                <Image
                  source={{ uri: plot.image }}
                  className="w-[50px] h-[50px] rounded-lg mr-2"
                />
              )}
              <View>
                <Text className="text-base font-semibold">{plot.crop ?? "Unnamed"}</Text>
<Text className="text-sm text-gray-600">
  Sow: {plot.sowDate ?? "Not set"} | Harvest: {plot.harvestDate ?? "Not set"}
</Text>

              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default Dashboard;
