import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Home, ShoppingBag, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomTabBar({ state, navigation }: any) {
  const { bottom } = useSafeAreaInsets();

  const icons: Record<string, any> = {
    home: Home,
    orders: ShoppingBag,
    profile: User,
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 items-center"
      style={{ paddingBottom: bottom + 6 }}
    >
      <View className="bg-black w-[85%] rounded-3xl py-3 flex-row justify-around shadow-lg">

        {state.routes.map((route: any, index: number) => {
          const isFocused = state.index === index;
          const Icon = icons[route.name];
          if (!Icon) return null;

          const onPress = () => navigation.navigate(route.name);

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              className="items-center justify-center flex-1"
              activeOpacity={0.8}
            >
              {/* Círculo fijo, fondo dinámico */}
              <View
                className="items-center justify-center"
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 9999,   // <--- CÍRCULO 100% FIJO
                    backgroundColor: isFocused ? "#f97316" : "transparent",
                }}
                >
                <Icon size={26} color={isFocused ? "white" : "#aaaaaa"} />
              </View>
            </TouchableOpacity>
          );
        })}

      </View>
    </View>
  );
}
