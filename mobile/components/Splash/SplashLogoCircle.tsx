import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";

type Props = {
  logoSource: any;
};

export default function SplashLogoCircle({ logoSource }: Props) {
  const scale = useSharedValue(0.85);
  const circleOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: circleOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: (1 - textOpacity.value) * 10 }],
  }));

  useEffect(() => {
    circleOpacity.value = withTiming(1, { duration: 600 });
    scale.value = withDelay(150, withTiming(1, { duration: 700 }));
    textOpacity.value = withDelay(600, withTiming(1, { duration: 700 }));
  }, []);

  return (
    <View className="items-center">
      {/* Círculo con logo */}
      <Animated.View
        style={[
          circleStyle,
          {
            width: 150,
            height: 150,
            borderRadius: 75,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.18)",
          },
        ]}
      >
        <Image
          source={logoSource}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Texto del splash */}
      <Animated.View style={[{ marginTop: 30 }, textStyle]}>
        <Text className="text-4xl text-center text-white font-opensans-bold">
          CrossFood
        </Text>

        <Text className="mt-1 text-xl text-center text-white font-opensans-semibold opacity-90">
          Conecta Con Tu Restauran­te
        </Text>
      </Animated.View>
    </View>
  );
}
