// app/tabs/sms.tsx
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
import SmsAndroid from 'react-native-get-sms-android';

type SmsItem = {
  id: number;
  from: string;
  message: string;
  timestamp: number;
  date: Date;
  time: string;
};

export default function SmsScreen() {
  const [messages, setMessages] = useState<SmsItem[]>([]);

  const handleLoadMessages = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        SmsAndroid.list(
          JSON.stringify({ box: 'inbox', maxCount: 50 }),
          fail => {
            console.log('Failed to load SMS:', fail);
          },
          (count, smsList) => {
            const parsed = JSON.parse(smsList);
            const formatted: SmsItem[] = parsed.map((item: any, index: number) => {
              const dateObj = new Date(Number(item.date));
              return {
                id: index + 1,
                from: item.address || 'Unknown',
                message: item.body,
                timestamp: Number(item.date),
                date: dateObj,
                time: dateObj.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              };
            });
            setMessages(formatted);
          }
        );
      } else {
        alert('Permission to read SMS was denied.');
      }
    }
  };

  const groupMessagesByDate = () => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    return messages.reduce((groups: any, msg) => {
      if (!msg.date) return groups;

      const msgDate = msg.date;
      const isToday = msgDate.toDateString() === today.toDateString();
      const isYesterday = msgDate.toDateString() === yesterday.toDateString();

      const groupTitle = isToday
        ? 'Today'
        : isYesterday
        ? 'Yesterday'
        : msgDate.toLocaleDateString('en-NZ', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

      if (!groups[groupTitle]) {
        groups[groupTitle] = [];
      }
      groups[groupTitle].push(msg);
      return groups;
    }, {});
  };

  const groupedMessages: { [key: string]: SmsItem[] } = groupMessagesByDate();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleLoadMessages}>
        <Ionicons name="chatbox-ellipses-outline" size={20} color="#fff" />
        <Text style={styles.buttonText}>Load Messages</Text>
      </TouchableOpacity>

      {Object.entries(groupedMessages).map(([dateLabel, group]) => (
        <View key={dateLabel} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{dateLabel}</Text>
            <Text style={styles.sectionCount}>({group.length})</Text>
          </View>

          {group.map((msg) => (
            <View key={msg.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="chatbubble-outline" size={20} color="#6c4d9c" />
                <Text style={styles.from}>{msg.from}</Text>
              </View>
              <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.message}
              >
                {msg.message}
              </Text>
              <Text style={styles.time}>{msg.time}</Text>
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
    backgroundColor: '#f4f6fc',
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
  from: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  time: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  message: {
  fontSize: 13,
  color: '#666',
  marginTop: 2,
},

});
