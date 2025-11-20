import React from "react";
import { Text, Image, TouchableOpacity } from "react-native";

export default function ProductCard({ title, price, image, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-3 mr-4 bg-white shadow-sm rounded-2xl w-44"
      style={{ elevation: 2 }}
    >
      <Image source={{ uri: image }} className="w-full h-28 rounded-xl" />

      <Text className="mt-2 text-gray-800 font-opensans-bold">{title}</Text>
      <Text className="text-[#FF7A00] font-bold mt-1">${price}</Text>
    </TouchableOpacity>
  );
}
