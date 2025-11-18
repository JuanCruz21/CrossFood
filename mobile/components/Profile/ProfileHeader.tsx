import { View, Text, Image } from "react-native";

export default function ProfileHeader() {
  return (
    <View className="items-center py-8">
      {/*<Image
        source={{ uri: "https://i.pravatar.cc/300" }}
        className="rounded-full w-28 h-28"
      />*/}

      <Text className="mt-4 text-2xl text-black font-opensans-bold">
        Yerson Cardozo
      </Text>

      <Text className="mt-1 text-gray-500 font-opensans-regular">
        yerson@example.com
      </Text>
    </View>
  );
}
