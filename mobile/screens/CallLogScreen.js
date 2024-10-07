import React from 'react';
import { Text, View } from 'react-native';
import { welcomeStyle } from '../styles/welcome';

export default function CallLogScreen() {
  return (
    <View style={welcomeStyle.container}>
      <Text style={welcomeStyle.header}>
        Call Log Screen
      </Text>
    </View>
  );
}
