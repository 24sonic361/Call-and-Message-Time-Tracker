// app/tabs/sync.tsx
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import {
  Alert,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import CallLogs from 'react-native-call-log';
import SmsAndroid from 'react-native-get-sms-android';

export default function SyncScreen() {
  const [lastSync, setLastSync] = useState('Not yet synced');

  const handleSync = async () => {
    try {
      const phone = await AsyncStorage.getItem('phonenumber');
      if (!phone) {
        Alert.alert('Error', 'Phone number not found');
        return;
      }

      const { data: client, error } = await supabase
        .from('Clients')
        .select('firstname, lastname')
        .eq('phonenumber', phone)
        .maybeSingle();

      if (error || !client) {
        Alert.alert('Error', 'Cannot find user info from Supabase');
        return;
      }

      const fullName = `${client.firstname} ${client.lastname}`;
      const now = new Date().toISOString();

      // --- CALL LOG ---
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CALL_LOG
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          const logs = await CallLogs.load(20);
          for (const item of logs) {
            const startTimestamp = Number(item.timestamp);
            const durationSec = Number(item.duration);

            if (isNaN(startTimestamp) || isNaN(durationSec)) continue;

            const datetime = new Date(startTimestamp).toISOString();
            const endtime = new Date(startTimestamp + durationSec * 1000).toISOString();

            const { data: existing, error: checkError } = await supabase
              .from('CallLogs')
              .select('cid')
              .eq('datetime', datetime);

            if (checkError) continue;

            if (existing && existing.length === 0) {
              await supabase.from('CallLogs').insert({
                whocalled: item.phoneNumber,
                starttime: datetime,
                endtime,
                billingrate: 4.0,
                createdon: now,
                createdby: fullName,
                modifiedon: now,
                modifiedby: fullName,
                type: item.type ?? 'UNKNOWN',
                name: item.name ?? null,
                duration: durationSec,
                datetime,
                rawtype: item.rawType,
              });
            }
          }
        } else {
          Alert.alert("Permission denied", "Cannot access call logs");
        }
      }

      // --- SMS LOG ---
      const smsPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS
      );

      if (smsPermission === PermissionsAndroid.RESULTS.GRANTED) {
        SmsAndroid.list(
          JSON.stringify({ box: 'inbox', maxCount: 20 }),
          () => {},
          async (count, smsList) => {
            const parsed = JSON.parse(smsList);
            for (const item of parsed) {
              const timestamp = new Date(Number(item.date)).toISOString();
              const existing = await supabase
                .from('MessageLogs')
                .select('cmid')
                .eq('senttime', timestamp);

              if (existing.data?.length === 0) {
                await supabase.from('MessageLogs').insert({
                  whomessaged: item.address,
                  senttime: timestamp,
                  wordcount: item.body.split(/\s+/).length,
                  billingrate: 4.0,
                  createdon: now,
                  createdby: fullName,
                  modifiedon: now,
                  modifiedby: fullName,
                });
              }
            }
          }
        );
      }

      const current = new Date().toLocaleString();
      setLastSync(current);
      Alert.alert('Success', 'Data synced to Supabase!');
    } catch (err) {
      Alert.alert('Error', 'Failed to sync');
    }
  };

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-upload-outline" size={48} color="#6c4d9c" style={styles.icon} />
      <Text style={styles.title}>Sync Your Data</Text>

      <TouchableOpacity style={styles.syncButton} onPress={handleSync}>
        <Ionicons name="sync-outline" size={20} color="#fff" />
        <Text style={styles.syncButtonText}>Sync Now</Text>
      </TouchableOpacity>

      <Text style={styles.lastSync}>Last Sync: {lastSync}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  syncButton: {
    flexDirection: 'row',
    backgroundColor: '#6c4d9c',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  lastSync: {
    fontSize: 14,
    color: '#666',
  },
});
