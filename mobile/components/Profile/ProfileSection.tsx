import { View, Text } from "react-native";

export default function ProfileSection({ title, children }: any) {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-xs text-gray-400 uppercase font-opensans-bold">
        {title}
      </Text>

      <View className="p-3 bg-white border border-gray-100 shadow-sm rounded-2xl">
        {children}
      </View>
    </View>
  );
}
