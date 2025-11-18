import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="home"
        options={{ title: "Inicio", headerShown: false }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Pedidos" }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Perfil" }}
      />
    </Tabs>
  );
}
