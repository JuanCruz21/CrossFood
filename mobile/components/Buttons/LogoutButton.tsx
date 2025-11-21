import { TouchableOpacity, Text } from "react-native";

export default function LogoutButton({ onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="py-3 mt-6 bg-red-500 rounded-xl"
    >
      <Text className="text-lg text-center text-white font-opensans-bold">
        Cerrar sesión
      </Text>
    </TouchableOpacity>
  );
}
