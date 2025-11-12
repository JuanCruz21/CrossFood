import React from "react";
import { View } from "react-native";

export default function SplashBackground({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 justify-center items-center bg-[#FF6B00]">
      {children}
    </View>
  );
}
