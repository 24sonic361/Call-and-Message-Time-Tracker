import {StyleSheet} from "react-native"; 

export const welcomeStyle = StyleSheet.create({
    container:{
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center"
    },
    header:{
      fontSize: 20, 
      fontWeight: "bold"
    },
    content:{
      fontSize: 13,
      fontStyle: "italic"
    },
    image:{
      width: 150,
      height: 150
    }
  });