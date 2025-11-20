import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import PrimaryButton from "@/components/Buttons/Buttons";

export default function NotFound() {
  const router = useRouter();

  return (
    <View className="items-center justify-center flex-1 px-8 bg-black">
      {/* Card */}
      <View className="w-full p-8 rounded-3xl bg-[#1a1a1a] border border-gray-800 shadow-lg">
        
        <Text className="text-5xl text-center font-opensans-bold text-naranja-apagado">
          404
        </Text>

        <Text className="mt-4 text-xl text-center text-white font-opensans-bold">
          Página no encontrada
        </Text>

        <Text className="mt-2 text-center text-gray-400 font-opensans-regular">
          La página que buscas no existe o ha sido movida.
        </Text>

        <View className="mt-8">
          <PrimaryButton 
            title="Volver atras"
            onPress={() => router.back()}
          />
        </View>

      </View>
    </View>
  );
}
