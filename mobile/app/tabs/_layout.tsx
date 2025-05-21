// app/tabs/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="call" options={{ title: 'Call', tabBarIcon: ({ color }) => <Ionicons name="call" size={20} color={color} /> }} />
      <Tabs.Screen name="sms" options={{ title: 'SMS', tabBarIcon: ({ color }) => <Ionicons name="chatbubbles" size={20} color={color} /> }} />
      <Tabs.Screen name="sync" options={{ title: 'Sync', tabBarIcon: ({ color }) => <Ionicons name="cloud-upload" size={20} color={color} /> }} />
    </Tabs>
  );
}
