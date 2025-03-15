import React, { useEffect, useState } from 'react';
import { View, Text, SectionList } from 'react-native';
import { fetchSmsLogs } from '../components/fetchLogs'; 
import ListItem from '../components/ListItem';  
import styles from '../styles/MessageLogStyle';

export default function MessageLogScreen() {
  const [smsLogs, setSmsLogs] = useState([]);

  useEffect(() => {
    async function loadSmsLogs() {
      const logs = await fetchSmsLogs();
      const groupedLogs = groupLogsByDate(logs);
      setSmsLogs(groupedLogs);
    }

    loadSmsLogs();
  }, []);

  function groupLogsByDate(logs) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const todayLogs = logs.filter(log => isSameDay(log.date, today));
    const yesterdayLogs = logs.filter(log => isSameDay(log.date, yesterday));

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
        sections={smsLogs}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <ListItem
            contactName={item.address}
            phoneNumber={item.address}
            timestamp={item.date}
            isCallLog={false}  // For messages, we set `isCallLog` to false
          />
        )}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
      />
    </View>
  );
}