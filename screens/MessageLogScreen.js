import React from 'react';
import { Text, View } from 'react-native';
import { welcomeStyle } from '../styles/welcome';

export default function MessageLogScreen() {
  return (
    <View style={welcomeStyle.container}>
      <Text style={welcomeStyle.header}>
        Message Log Screen
      </Text>
    </View>
  );
}