import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.violet,
        tabBarInactiveTintColor: Colors.ash,
        tabBarStyle: {
          backgroundColor: Colors.obsidian,
          borderTopColor: Colors.steel,
        },
      }}
    >
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="keys"
        options={{
          title: "Keys",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="key" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scales"
        options={{
          title: "Scales",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trending-up" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="circle"
        options={{
          title: "Circle",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="radio-button-on" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
