import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

export default function SplashLoader() {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => {
    // rotate between 0 and 360deg
    const deg = progress.value * 360;
    return {
      transform: [{ rotate: `${deg}deg` }],
    };
  });

  return (
    <View className="mt-8">
      <Animated.View
        style={[
          ringStyle,
          {
            width: 28,
            height: 28,
            borderRadius: 14,
            borderWidth: 2,
            borderColor: "rgba(255,255,255,0.9)",
            borderTopColor: "rgba(255,255,255,0.18)",
            borderRightColor: "rgba(255,255,255,0.18)",
            borderBottomColor: "rgba(255,255,255,0.18)",
          },
        ]}
      />
    </View>
  );
}
