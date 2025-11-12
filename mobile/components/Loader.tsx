import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function Loader() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="mt-8">
      <Animated.View
        style={[
          animatedStyle,
          {
            width: 40,
            height: 40,
            borderWidth: 3,
            borderColor: "white",
            borderTopColor: "transparent",
            borderRadius: 20,
          },
        ]}
      />
    </View>
  );
}
