import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import InputField from "@/components/Text/InputField";
import PrimaryButton from "@/components/Buttons/Buttons";

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 px-8 py-16 bg-white">

  <TouchableOpacity onPress={() => router.back()} className="mb-6">
    <Text className="text-2xl font-opensans-bold">←</Text>
  </TouchableOpacity>

  <Text className="mb-8 text-3xl text-black font-opensans-bold">Crear cuenta</Text>

  <InputField
  label="Nombre completo"
  placeholder="Ingresa tu nombre"
  labelColor="#222"
  bgColor="#F7F7F7"
  textColor="#000"
  borderColor="#e5e5e5"
  placeholderColor="#888"
  iconColor="#666"
/>

  <InputField 
    label="Correo"
    placeholder="Ingresa tu correo electrónico"
    labelColor="black"
  />

  <InputField 
    label="Teléfono"
    placeholder="Ingresa tu número de teléfono"
    labelColor="black"
  />

  <InputField 
    label="Contraseña"
    placeholder="Crea una contraseña segura"
    secure
    labelColor="black"
  />

  <InputField 
    label="Confirmar contraseña"
    placeholder="Confirma tu contraseña"
    secure
    labelColor="black"
  />

  <PrimaryButton title="Crear cuenta" onPress={() => {}} />

  <Text className="mt-4 text-xs text-center text-gray-600">
    Al crear una cuenta, aceptas nuestros{" "}
    <Text className="underline">Términos y Condiciones</Text> y{" "}
    <Text className="underline">Política de Privacidad</Text>.
  </Text>

    </View>

  );
}
