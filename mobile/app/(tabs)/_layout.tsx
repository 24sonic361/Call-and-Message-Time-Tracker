import { Tabs } from "expo-router";
import React from "react";
import { Platform, Image } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol, IconSymbol2 } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = "light";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Phone",
          tabBarIcon: ({ color }) => (
            <IconSymbol2 size={28} name="phone" color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="smslog"
        options={{
          title: "SMS",
          tabBarIcon: ({ color, focused }) => (
          <Image
          source={require("../../assets/images/smsIcon.png")}
          style={{
            width: 24,
            height: 24,
            tintColor: focused ? color : "#aaa",
          }}
          resizeMode="contain"
          />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Sync",
          tabBarIcon: ({ color }) => (
            <IconSymbol2 size={28} name="cloud-sync" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
