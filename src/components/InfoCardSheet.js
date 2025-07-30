import React, { useRef, useMemo } from 'react';
import { View, Text } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';

const InfoCardSheet = () => {
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['15%', '50%', '90%'], []);

  return (
    <BottomSheet
      ref={sheetRef}
      index={0} 
      snapPoints={snapPoints}
      enablePanDownToClose={false}
    >
      <View className="px-4">
        <Text className="text-xl font-bold mb-2"></Text>
        <Text className="text-gray-700"></Text>
      </View>
    </BottomSheet>
  );
};

export default InfoCardSheet;