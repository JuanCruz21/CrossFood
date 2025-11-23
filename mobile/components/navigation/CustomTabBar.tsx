import React from "react";
import { View, TouchableOpacity, StyleSheet, Pressable} from "react-native";
import { Home, ShoppingBag, User } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomTabBar({ state, navigation }: any) {
  const { bottom } = useSafeAreaInsets();

  const icons: Record<string, any> = {
    home: Home,
    orders: ShoppingBag,
    profile: User,
  };

  return (
    <View style={[styles.container, { paddingBottom: bottom + 6 }]}>
      <View style={styles.navBar}>
        {state.routes.map((route: any, index: number) => {
          console.log("ROUTE:", route.name);

          const isFocused = state.index === index;
          const Icon = icons[route.name];
          if (!Icon) return null;

          const onPress = () => navigation.navigate(route.name);

          return (
<Pressable
  key={route.key}
  onPress={onPress}
  style={[styles.tab]}
>
  <View style={styles.iconContainer}>
    <View
      style={[
        styles.iconCircle,
        { backgroundColor: isFocused ? "#f97316" : "transparent" },
      ]}
    >
      <Icon size={24} color={isFocused ? "white" : "#aaaaaa"} />
    </View>
  </View>
</Pressable>


   
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },

  navBar: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "black",
    paddingVertical: 12,
    borderRadius: 25,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  iconContainer: {
    width: 55,
    height: 55,
    alignItems: "center",
    justifyContent: "center",
    // 🔥 ESTO evita deformación
    position: "relative",
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 48 / 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // 🔥 para asegurar circular
  },
});
