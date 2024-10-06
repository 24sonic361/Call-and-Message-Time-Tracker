import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CallLogScreen from './CallLogScreen'; // Import Call Log screen
import MessageLogScreen from './MessageLogScreen'; // Import Message Log screen

const Tab = createBottomTabNavigator();

export default function HomeScreen() {
  return (
    <Tab.Navigator
      initialRouteName="CallLog"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          let iconSource;

          if (route.name === 'CallLog') {
            iconSource = require('../assets/phoneIcon.png'); // Path to phoneIcon.png
          } else if (route.name === 'MessageLog') {
            iconSource = require('../assets/messageIcon.png'); // Path to messageIcon.png
          }

          return (
            <Image
              source={iconSource}
              style={{
                width: 25,
                height: 25,
                tintColor: focused ? '#6F2DA8' : '#808080'  // Purple when focused, gray when not
              }}
            />
          );
        },
        tabBarLabelStyle: {
          fontSize: 12, // Adjust the size of the label text
        },
        tabBarActiveTintColor: '#6F2DA8',  // Purple color when the tab is active
        tabBarInactiveTintColor: '#808080',  // Gray color when the tab is inactive
      })}
    >
      <Tab.Screen 
        name="CallLog" 
        component={CallLogScreen} 
        options={{ title: 'Call Log' }}
      />
      <Tab.Screen 
        name="MessageLog" 
        component={MessageLogScreen} 
        options={{ title: 'Message Log' }}
      />
    </Tab.Navigator>
  );
}

