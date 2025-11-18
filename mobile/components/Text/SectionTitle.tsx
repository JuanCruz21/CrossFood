import React from "react";
import { Text } from "react-native";

export default function SectionTitle({ children }: any) {
  return (
    <Text className="mt-6 mb-3 text-xl text-gray-800 font-opensans-bold">
      {children}
    </Text>
  );
}
