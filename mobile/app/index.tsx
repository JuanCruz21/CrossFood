import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming 
} from "react-native-reanimated";
// import AsyncStorage from "@react-native-async-storage/async-storage";  // ← para después

export default function IntroScreen() {
  const router = useRouter();

  // --- Animaciones ---
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  const animatedStyles = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    //Animación de fade-in al entrar
    opacity.value = withTiming(1, { duration: 700 });
    translateY.value = withTiming(0, { duration: 700 });

    // --- AUTENTICACIÓN (para después) ---
    /*
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        router.replace("/tabs");
      }
    };
    checkAuth();
    */
  }, []);

  return (
    <View className="items-center justify-center flex-1 px-10 bg-naranja-apagado">

      <Animated.View style={[animatedStyles, { alignItems: "center" }]}>
        {/* LOGO */}
        <Image
          source={require("./../assets/images/4.png")}
          style={{ width: 140, height: 140, marginBottom: 25 }}
          resizeMode="contain"
        />

        {/* Título */}
        <Text className="text-3xl text-center text-white font-opensans-bold">
          CrossFood
        </Text>

        <Text className="mt-2 text-lg text-center text-white font-opensans-regular opacity-90">
          Conecta tu restaurante
        </Text>
      </Animated.View>

      {/* Botón continuar */}
      <Animated.View style={[animatedStyles, { marginTop: 60, width: "100%" }]}>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="py-4 bg-black/80 rounded-xl"
        >
          <Text className="text-lg tracking-wide text-center text-white font-opensans-bold">
            Iniciar Sesión
          </Text>
        </TouchableOpacity>
      </Animated.View>

    </View>
  );
}
