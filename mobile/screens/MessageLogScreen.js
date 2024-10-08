import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchSmsLogs } from '../components/fetchLogs';  // Import the SMS log fetching function

export default function MessageLogScreen() {
  const [smsLogs, setSmsLogs] = useState([]);

  useEffect(() => {
    async function loadSmsLogs() {
      const logs = await fetchSmsLogs();  // Fetch the SMS logs
      setSmsLogs(logs || []);  // Set SMS logs in state
    }

    loadSmsLogs();
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10 }}>Message Log Screen</Text>
      <FlatList
        data={smsLogs}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10 }}>
            <Text>{`Address: ${item.address}`}</Text>
            <Text>{`Message: ${item.body}`}</Text>
            <Text>{`Date: ${new Date(item.date).toLocaleString()}`}</Text>
          </View>
        )}
      />
    </View>
  );
}
