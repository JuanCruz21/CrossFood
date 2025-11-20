import { TouchableOpacity, View, Text } from "react-native";
import { ChevronRight } from "lucide-react-native";

export default function ProfileOption({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-2 py-4"
    >
      <View className="flex-row items-center">
        {icon}
        <Text className="ml-3 text-lg text-black font-opensans-regular">
          {label}
        </Text>
      </View>

      <ChevronRight size={22} color="#777" />
    </TouchableOpacity>
  );
}
