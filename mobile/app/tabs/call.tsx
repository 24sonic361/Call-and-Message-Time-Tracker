// app/tabs/call.tsx
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CallLogs from 'react-native-call-log';

type CallItem = {
  id: number;
  name: string;
  number: string;
  timestamp: number;
  time: string;
  date: Date;
  duration: number;
  type: string;
};



export default function CallScreen() {
  const [calls, setCalls] = useState<any[]>([]);

  const handleLoadCalls = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        try {
          const logs = await CallLogs.load(20);
          const formatted = logs.map((item: any, index: number) => ({
            id: index + 1,
            name: item.name || 'Unknown',
            number: item.phoneNumber,
            timestamp: Number(item.timestamp),
            time: new Date(Number(item.timestamp)).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            date: new Date(Number(item.timestamp)),
            duration: Number(item.duration),
            type: item.type,
          }));
          setCalls(formatted);
        } catch (err) {
          console.warn('Failed to load call logs', err);
        }
      } else {
        alert('Permission to access call logs was denied.');
      }
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'INCOMING':
        return <Ionicons name="call-outline" size={20} color="#4caf50" />;
      case 'OUTGOING':
        return <Ionicons name="arrow-redo-outline" size={20} color="#2196f3" />;
      case 'MISSED':
        return <Ionicons name="close-circle-outline" size={20} color="#f44336" />;
      default:
        return <Ionicons name="help-circle-outline" size={20} color="#9e9e9e" />;
    }
  };

  const groupCallsByDate = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return calls.reduce((groups: any, call) => {
      const callDate = call.date;
      const isToday =
        callDate.toDateString() === today.toDateString();
      const isYesterday =
        callDate.toDateString() === yesterday.toDateString();

      const groupTitle = isToday
        ? 'Today'
        : isYesterday
        ? 'Yesterday'
        : callDate.toLocaleDateString('en-NZ', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(call);
      return groups;
    }, {});
  };

  const groupedCalls: { [key: string]: CallItem[] } = groupCallsByDate();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleLoadCalls}>
        <Ionicons name="cloud-download-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Load Calls</Text>
      </TouchableOpacity>

      {Object.entries(groupedCalls).map(([dateLabel, callsInGroup]) => (
        <View key={dateLabel} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{dateLabel}</Text>
            <Text style={styles.sectionCount}>({callsInGroup.length})</Text>
          </View>

          {(callsInGroup as any[]).map((call) => (
            <View key={call.id} style={styles.card}>
              <View style={styles.cardHeader}>
                {getTypeIcon(call.type)}
                <Text style={styles.name}>{call.name}</Text>
              </View>
              <Text style={styles.meta}>{call.number}</Text>
              <Text style={styles.time}>{call.time}</Text>
              <Text style={styles.duration}>Duration: {call.duration}s</Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: '#f9f9fc',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#a88fd5', 
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c4d9c',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  meta: {
    fontSize: 14,
    color: '#666',
  },
  time: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  duration: {
    fontSize: 13,
    color: '#a88fd5',
    fontStyle: 'italic',
    marginTop: 2,
  },
});
