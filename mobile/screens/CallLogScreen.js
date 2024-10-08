import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchCallLogs } from '../components/fetchLogs';  // Import the fetchCallLogs function

export default function CallLogScreen() {
  const [callLogs, setCallLogs] = useState([]);

  useEffect(() => {
    async function loadCallLogs() {
      const logs = await fetchCallLogs();  // Fetch the call logs
      setCallLogs(logs || []);  // Set call logs to state
    }

    loadCallLogs();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Call Log Screen</Text>
      <FlatList
        data={callLogs}
        keyExtractor={(item) => item.timestamp.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text>{`Number: ${item.phoneNumber}`}</Text>
            <Text>{`Type: ${item.type}`}</Text>
            <Text>{`Date: ${new Date(parseInt(item.timestamp)).toLocaleString()}`}</Text>
            <Text>{`Duration: ${item.duration} seconds`}</Text>
          </View>
        )}
      />
    </View>
  );
}
