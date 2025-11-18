import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function PrimaryButton({ title, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="py-4 mt-2 rounded-full bg-naranja-apagado"
    >
      <Text className="text-lg text-center text-white font-opensans-bold">
        {title}
      </Text>
    </TouchableOpacity>
  );
}

