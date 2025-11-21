import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { useRouter } from "expo-router";
import InputField from "@/components/Text/InputField";
import PrimaryButton from "@/components/Buttons/Buttons";
import { useAuth } from "@/store/auth";

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuth((s) => s.login);

  const [username, setUsername] = useState(""); // correo o username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }
    setLoading(true);
    try {
      await login(username, password);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="justify-center flex-1 px-8 py-16 bg-black/90">

      {/* Header redondo */}
      <View className="items-center w-full mb-10">
        <View className="items-center justify-center w-32 h-32 rounded-full shadow-lg bg-naranja-apagado">
          <Image
            source={require("@/assets/images/3.png")}
            style={{
              width: 70,
              height: 70,
              tintColor: "white",
            }}
            resizeMode="contain"
          />
        </View>

        <Text className="mt-3 text-2xl text-white font-opensans-bold">
          CrossFood
        </Text>
      </View>

      <Text className="mb-10 text-3xl text-white font-opensans-bold">
        Bienvenido a {"\n"}CrossFood
      </Text>

      {/* Inputs */}
      <InputField
        label="Correo / Usuario"
        placeholder="Ingresa tu correo"
        labelColor="white"
        bgColor="rgba(255,255,255,0.08)"
        textColor="white"
        placeholderColor="#c4c4c4"
        borderColor="transparent"
        iconColor="#fff"
        value={username}
        onChangeText={setUsername}
      />

      <InputField
        label="Contraseña"
        placeholder="Ingresa tu contraseña"
        secure
        labelColor="white"
        bgColor="rgba(255,255,255,0.08)"
        textColor="white"
        placeholderColor="#c4c4c4"
        borderColor="transparent"
        iconColor="#fff"
        value={password}
        onChangeText={setPassword}
      />

      {/* Botón Login */}
      <PrimaryButton
        title={loading ? "Ingresando..." : "Iniciar Sesión"}
        onPress={handleLogin}
      />

      {/* Crear cuenta */}
      <TouchableOpacity
        onPress={() => router.push("/(auth)/register")}
        className="mt-5 mb-8"
      >
        <Text className="text-center text-white underline font-opensans-regular">
          Crear nueva cuenta
        </Text>
      </TouchableOpacity>

      {/* Google removed as requested (no functionality) */}
      <TouchableOpacity className="flex-row items-center justify-center py-3 bg-gray-800 rounded-xl"
      onPress={() => router.push("/(tabs)/home")}
      >
        <Image
          source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFqRA_ozV7SC8oQbaiXrqx2k5iDzvtqvc1xA&s" }}
          style={{ width: 25, height: 25, marginRight: 10, borderRadius: 50 }}
        />
        <Text className="text-white font-opensans-bold">Continuar con Google</Text>
      </TouchableOpacity>

    </View>
  );
}
