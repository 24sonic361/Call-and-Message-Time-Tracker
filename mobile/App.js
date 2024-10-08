import React, { useState } from "react";
import { Image, Button, View, Text } from "react-native";
import { welcomeStyle } from "./styles/welcome";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/homescreen'; 

const logo = require("./assets/memeCat.png");

const Stack = createStackNavigator();

function WelcomeScreen({ navigation }) {
  return (
    <View style={welcomeStyle.container}>

      <Image source={logo} style={welcomeStyle.image}></Image>

      <Text style={welcomeStyle.header}>
        {"\n"}Welcome to Call and Message
      </Text>

      <Text style={welcomeStyle.header}>
        Time Tracker
      </Text>

      <Text style={welcomeStyle.content}>
        {"\n"}Represented By AUT
      </Text>

      <Button
        title="Click here to enter"
        color="#6F2DA8"
        onPress={() => navigation.navigate('HomeScreen')}
      />

    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>

      <Stack.Navigator initialRouteName="WelcomeScreen">

        <Stack.Screen 
          name="WelcomeScreen" 
          component={WelcomeScreen} 
          options={{ title: 'Welcome' }} 
        />

        <Stack.Screen 
          name="HomeScreen" 
          component={HomeScreen}  
          options={{ title: 'Home' }} 
        />

      </Stack.Navigator>
      
    </NavigationContainer>
  );
}