import React from 'react';
import { Image } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CallLogScreen from './CallLogScreen'; // Corrected import path for Call Log screen
import MessageLogScreen from './MessageLogScreen'; // Corrected import path for Message Log screen
import styles from '../styles/HomeScreenStyle';

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
              style={[
                styles.icon,
                { tintColor: focused ? '#6F2DA8' : '#808080' }  // Purple when focused, gray when not
              ]}
            />
          );
        },
        tabBarLabelStyle: styles.tabBarLabel,
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