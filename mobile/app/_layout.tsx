import "@/global.css";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { View } from "react-native";

export default function RootLayout() {

  const [loaded] = useFonts({
    "OpenSans-Regular": require("../assets/fonts/OpenSans-Regular.ttf"),
    "OpenSans-Medium": require("../assets/fonts/OpenSans-Medium.ttf"),
    "OpenSans-Bold": require("../assets/fonts/OpenSans-Bold.ttf"),
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Medium": require("../assets/fonts/Roboto-Medium.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
  });

  if (!loaded) {
    return <View className="flex-1 bg-white" />; // splash de carga básico
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash/index" />
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
    </Stack>
  );
}
