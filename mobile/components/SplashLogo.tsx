import React, { useEffect } from "react";
import { Image, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";

export default function SplashLogo() {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  useEffect(() => {
    scale.value = withTiming(1, { duration: 1000 });
    opacity.value = withTiming(1, { duration: 1000 });

    textOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    textTranslateY.value = withDelay(800, withTiming(0, { duration: 800 }));
  }, []);

  return (
    <View className="items-center">
      <Animated.View style={logoStyle}>
        <Image
          source={require("./../assets/images/splash-icon.png")}
          className="w-32 h-32 mb-4"
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View style={textStyle}>
        <Text className="text-3xl font-bold tracking-widest text-white">
          CrossFood
        </Text>
      </Animated.View>
    </View>
  );
}
