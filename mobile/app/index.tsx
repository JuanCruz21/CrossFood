import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 px-4 pt-10 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <Text className="text-2xl font-bold text-gray-800">Bienvenido 🍽️</Text>
        <Image
          source={require("./../assets/images/splash-icon.png")}
          className="w-10 h-10"
          resizeMode="contain"
        />
      </View>

      {/* Categorías */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {["Restaurantes", "Reservas", "Domicilios", "Promos"].map((cat, i) => (
          <TouchableOpacity
            key={i}
            className="mr-3 bg-[#FF6B00] px-5 py-2 rounded-full"
          >
            <Text className="font-medium text-white">{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Recomendados */}
      <Text className="mt-8 mb-4 text-lg font-semibold">Recomendados</Text>
      <ScrollView>
        {[1, 2, 3].map((item) => (
          <View
            key={item}
            className="flex-row items-center p-4 mb-4 bg-gray-100 rounded-2xl"
          >
            <Image
              source={require("./../assets/images/splash-icon.png")}
              className="w-16 h-16 mr-4 rounded-lg"
            />
            <View>
              <Text className="font-semibold text-gray-800">
                Restaurante #{item}
              </Text>
              <Text className="text-sm text-gray-500">Comida rápida</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
