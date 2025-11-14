import React from "react";
import { View } from "react-native";

type Props = {
  children: React.ReactNode;
  color?: string;
};

export default function SplashBackground({ children, color = "#E86F24" }: Props) {
  // fondo sólido naranja apagado
  return (
    <View
      style={{ backgroundColor: color }}
      className="items-center justify-center flex-1"
    >
      {children}
    </View>
  );
}
