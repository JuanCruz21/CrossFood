import { Tabs } from "expo-router";
import CustomTabBar from "@/components/navigation/CustomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 0 },   //Desactiva estilo del tabBar nativo
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="orders" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
