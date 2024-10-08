import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, StyleSheet } from 'react-native';
import { fetchCallLogs } from '../components/fetchLogs'; 
import ListItem from '../components/ListItem';  

export default function CallLogScreen() {
  const [callLogs, setCallLogs] = useState([]);

  useEffect(() => {
    async function loadCallLogs() {
      const logs = await fetchCallLogs();
      const groupedLogs = groupLogsByDate(logs);
      setCallLogs(groupedLogs);
    }

    loadCallLogs();
  }, []);

  function groupLogsByDate(logs) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayLogs = logs.filter(log => isSameDay(log.timestamp, today));
    const yesterdayLogs = logs.filter(log => isSameDay(log.timestamp, yesterday));

    return [
      { title: 'Today', data: todayLogs },
      { title: 'Yesterday', data: yesterdayLogs },
    ];
  }

  function isSameDay(timestamp, date) {
    const logDate = new Date(parseInt(timestamp));
    return logDate.toDateString() === date.toDateString();
  }

  return (
    <View style={styles.container}>
      <SectionList
        sections={callLogs}
        keyExtractor={(item) => item.timestamp.toString()}
        renderItem={({ item }) => (
          <ListItem
            contactName={item.name}
            phoneNumber={item.phoneNumber}
            timestamp={item.timestamp}
            type={item.type}
            duration={item.duration}
            isCallLog={true}
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f4f4f4',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
});
