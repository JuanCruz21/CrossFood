import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";

export default function CategoryCard({ title, icon, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="items-center mx-3"
    >
      <View className="items-center justify-center w-20 h-20 bg-white rounded-full shadow-md">
        <Image source={{ uri: icon }} className="w-12 h-12" />
      </View>

      <Text className="w-20 mt-2 text-sm text-center text-gray-700 font-opensans-regular">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
