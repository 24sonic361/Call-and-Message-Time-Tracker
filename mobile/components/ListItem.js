import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

export default function ListItem({ contactName, phoneNumber, timestamp, type, duration, isCallLog }) {
  // Determine the icon based on the type of call (incoming, outgoing, missed)
  let callIcon = type === 'incoming' ? require('../assets/incomingIcon.png') :
                 type === 'outgoing' ? require('../assets/outgoingIcon.png') :
                 require('../assets/missedIcon.png');
  
  // Example placeholder for message icon (You can modify as needed)
  let messageIcon = require('../assets/messageIcon.png');
  
  const date = new Date(parseInt(timestamp));
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/avatarIcon.png')}  // Placeholder for avatar icon
        style={styles.avatar}
      />
      <View style={styles.detailsContainer}>
        <Text style={styles.name}>{contactName ? contactName : 'Unsaved'}</Text>
        <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        <Text style={styles.time}>{formattedTime}</Text>
      </View>
      <View style={styles.iconContainer}>
        {isCallLog ? (
          <>
            <Image source={callIcon} style={styles.icon} />
            <Text style={styles.duration}>{duration ? `${duration}s` : '0s'}</Text>
          </>
        ) : (
          <Image source={messageIcon} style={styles.icon} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneNumber: {
    fontSize: 14,
    color: '#777',
  },
  time: {
    fontSize: 12,
    color: '#aaa',
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 5,
  },
  duration: {
    fontSize: 12,
    color: '#777',
  },
});
