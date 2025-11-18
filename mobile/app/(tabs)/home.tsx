import React from "react";
import { ScrollView, View, Text, TextInput, Image } from "react-native";
import { router } from "expo-router";

import SectionTitle from "@/components/Text/SectionTitle";
import CategoryCard from "@/components/Cards/CategoryCard";
import ProductCard from "@/components/Cards/ProductCard";

export default function Home() {
  return (
    <ScrollView className="flex-1 bg-[#F5F5F5] px-5 pt-12">

      {/* HEADER */}
      <View className="mb-6">
        <Text className="text-3xl text-gray-900 font-opensans-bold">
          CrossApp
        </Text>
        <Text className="text-sm text-gray-500">
          Ordena, disfruta, repite
        </Text>
      </View>

      {/* SEARCHBAR */}
      <View className="flex-row items-center p-4 mb-5 bg-white shadow-sm rounded-2xl">
        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/622/622669.png" }}
          className="w-6 h-6 mr-3 opacity-50"
        />
        <TextInput
          placeholder="Buscar comidas, platos o restaurantes"
          placeholderTextColor="#a1a1a1"
          className="flex-1 text-gray-700"
        />
      </View>

      {/* BANNER DESTACADO */}
      <View className="bg-[#FF7A00] h-40 rounded-3xl mb-6 p-5 flex-row items-center shadow-lg">
        <View className="flex-1">
          <Text className="text-2xl text-white font-opensans-bold">
            ¡Promos de hoy!
          </Text>
          <Text className="mt-1 text-white opacity-90">
            Hasta 40% en tus platos favoritos
          </Text>
        </View>

        <Image
          source={{ uri: "https://cdn-icons-png.flaticon.com/512/3595/3595455.png" }}
          className="w-28 h-28"
        />
      </View>

      {/* CATEGORÍAS */}
      <SectionTitle>Categorías</SectionTitle>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <CategoryCard
          title="Hamburguesas"
          icon="https://cdn-icons-png.flaticon.com/512/3082/3082031.png"
          onPress={() => router.push("/categoria")}
        />
        <CategoryCard
          title="Pizzas"
          icon="https://cdn-icons-png.flaticon.com/512/6978/6978255.png"
          onPress={() => router.push("/categoria")}
        />
        <CategoryCard
          title="Pollo"
          icon="https://cdn-icons-png.flaticon.com/512/1046/1046751.png"
          onPress={() => router.push("/categoria")}
        />
        <CategoryCard
          title="Bebidas"
          icon="https://cdn-icons-png.flaticon.com/512/2738/2738730.png"
          onPress={() => router.push("/categoria")}
        />
        <CategoryCard
          title="Postres"
          icon="https://cdn-icons-png.flaticon.com/512/2887/2887975.png"
          onPress={() => router.push("/categoria")}
        />
      </ScrollView>

      {/* PRODUCTOS DESTACADOS */}
      <SectionTitle>Recomendados para ti</SectionTitle>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ProductCard
          title="Hamburguesa Doble"
          price={25.900}
          image="https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg"
          onPress={() => router.push("/product")}
        />

        <ProductCard
          title="Pizza Pepperoni"
          price={32.500}
          image="https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg"
          onPress={() => router.push("/product")}
        />

        <ProductCard
          title="Café Helado"
          price={12.500}
          image="https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg"
          onPress={() => router.push("/product")}
        />
      </ScrollView>


    {/**Restaunrantes rescomendados */}
    <SectionTitle>Restaurantes Recomendados</SectionTitle>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ProductCard
          title="Restaurante 1"
          price={25.900}
          image="https://images.pexels.com/photos/1322184/pexels-photo-1322184.jpeg"
          onPress={() => router.push("/product")}
        />

        <ProductCard
          title="Pizza Restaurante"
          price={32.500}
          image="https://images.pexels.com/photos/1322184/pexels-photo-1322184.jpeg"
          onPress={() => router.push("/product")}
        />

        <ProductCard
          title="Bar Restaurante"
          price={12.500}
          image="https://images.pexels.com/photos/1322184/pexels-photo-1322184.jpeg"
          onPress={() => router.push("/product")}
        />
      </ScrollView>
      <View className="h-12" />
    </ScrollView>
  );
}
