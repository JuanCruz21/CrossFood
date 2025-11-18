import { TouchableOpacity, Text } from "react-native";

export default function LogoutButton({ onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="py-4 mt-5 bg-red-500 rounded-2xl"
    >
      <Text className="text-lg text-center text-white font-opensans-bold">
        Cerrar sesión
      </Text>
    </TouchableOpacity>
  );
}
