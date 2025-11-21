import React, { useState } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import InputField from "@/components/Text/InputField";
import PrimaryButton from "@/components/Buttons/Buttons";
import { useAuth } from "@/store/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const signup = useAuth((s) => s.signup);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirm) {
      Alert.alert("Error", "Todos los campos son obligatorios.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Payload según tu swagger (ejemplo)
      const payload = {
        email: email,
        password: password,
        full_name: name,
        nombre_empresa: "Mi Empresa",
        direccion_empresa: "N/A",
        ciudad_empresa: "N/A",
        nombre_restaurante: "Mi Restaurante",
        direccion_restaurante: "N/A",
        telefono_restaurante: phone,
      };

      await signup(payload);
      router.replace("/(tabs)/home");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 px-8 py-16 bg-white">

      <TouchableOpacity onPress={() => router.back()} className="mb-6">
        <Text className="text-2xl font-opensans-bold">←</Text>
      </TouchableOpacity>

      <Text className="mb-8 text-3xl text-black font-opensans-bold">Crear cuenta</Text>

      <InputField
        label="Nombre completo"
        placeholder="Ingresa tu nombre"
        value={name}
        onChangeText={setName}
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
        value={email}
        onChangeText={setEmail}
        labelColor="black"
      />

      <InputField
        label="Teléfono"
        placeholder="Ingresa tu número de teléfono"
        value={phone}
        onChangeText={setPhone}
        labelColor="black"
      />

      <InputField
        label="Contraseña"
        placeholder="Crea una contraseña segura"
        secure
        value={password}
        onChangeText={setPassword}
        labelColor="black"
      />

      <InputField
        label="Confirmar contraseña"
        placeholder="Confirma tu contraseña"
        secure
        value={confirm}
        onChangeText={setConfirm}
        labelColor="black"
      />

      <PrimaryButton title={loading ? "Creando..." : "Crear cuenta"} onPress={handleRegister} />

      <Text className="mt-4 text-xs text-center text-gray-600">
        Al crear una cuenta, aceptas nuestros{" "}
        <Text className="underline">Términos y Condiciones</Text> y{" "}
        <Text className="underline">Política de Privacidad</Text>.
      </Text>

    </View>
  );
}
