import React, { useEffect, useState } from 'react';
import { View, PermissionsAndroid, StyleSheet, Platform } from 'react-native';
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconFeather } from './IconSymbol';
import smsMockData from '../mockup/smsMockup';

interface SmsItem {
  address: string;
  body: string;
  date: number;
}

// Mock SmsAndroid for web compatibility
const SmsAndroid = Platform.OS === 'android' ? require('react-native-get-sms-android') : {
  list: (filter: string, fail: (msg: string) => void, success: (count: number, data: string) => void) => {
    // Mock implementation for non-Android platforms
    const mockData: SmsItem[] = [ // Added type annotation here
      { address: '12345', body: 'Hello from 12345', date: Date.now() - 10000 },
      { address: '54321', body: 'Hi there from 54321', date: Date.now() - 5000 },
    ];
    const mockDataString = JSON.stringify(mockData);
    success(mockData.length, mockDataString);
  },
};

export default function SmsLogScreen() {
  const [smsData, setSmsData] = useState<any>({});

  useEffect(() => {
    requestSmsPermission();
  }, []);

  const requestSmsPermission = async () => {
    try {
      if (__DEV__) {
        const groupedData = await groupByDate(smsMockData.slice(0, 50));
        setSmsData(groupedData);
      }

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_SMS,
          {
            title: 'SMS Permission',
            message: 'Access to SMS is required to display messages',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'allow',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          SmsAndroid.list(
            JSON.stringify({ box: 'inbox', maxCount: 50 }),
            (fail: any) => {
              console.log('SMS Load Failed: ', fail);
            },
            async (count: any, smsListStr: string) => {
              try {
                const smsList: SmsItem[] = JSON.parse(smsListStr);
                const groupedData = await groupByDate(smsList);
                setSmsData(groupedData);
              } catch (error) {
                console.error('Error parsing SMS data', error);
              }
            }
          );
        } else {
          console.log('SMS permission denied');
        }
      } else {
        // For other platforms (e.g., iOS, web), provide mock data.
        SmsAndroid.list(
          JSON.stringify({ box: 'inbox', maxCount: 50 }),
          (fail: any) => {
            console.log("SMS Load Failed: ", fail);
          },
          async (count: any, smsListStr: string) => {
            try {
              const smsList: SmsItem[] = JSON.parse(smsListStr);
              const groupedData = await groupByDate(smsList);
              setSmsData(groupedData);
            }
            catch (e) {
              console.error("Error", e);
            }
          }
        )
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const groupByDate = async (data: SmsItem[]) => {
    return data.reduce((acc: any, item) => {
      const date = new Date(item.date).toISOString().split('T')[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const time = `${date.getHours()}:${String(
      date.getMinutes()
    ).padStart(2, '0')}`;
    const datePart = date.toLocaleDateString('en-GB');
    return `${datePart} ${time}`;
  };

  const Line = () => <View style={styles.line} />; // Corrected usage of styles

  const RenderSMS = () => {
    return Object.entries(smsData).map(([logDate, messages]) => {
      const list: SmsItem[] = messages || [];
      return (
        <View key={logDate} style={{ marginTop: 10, marginBottom: 10 }}>
          <Line />
          <View
            style={{
              height: 50,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 10,
            }}
          >
            <ThemedText>{logDate}</ThemedText>
            <ThemedText>{`(${list.length})`}</ThemedText>
          </View>
          <Line />
          {list.map((sms, index) => (
            <View
              key={`${logDate}-${sms.date}-${index}`}
              style={styles.itemContainer}
            >
              <View style={styles.iconContainer}>
                <IconFeather name="message-square" size={20} color="#000" />
              </View>
              <View>
                <ThemedText type="defaultSemiBold">
                  {sms.address || 'Unknown'}
                </ThemedText>
                <View style={{ flexDirection: 'row' }}>
                  <ThemedText type="time" style={{ width: 100 }}>
                    {formatDateTime(sms.date)}
                  </ThemedText>
                  <ThemedText
                    numberOfLines={1}
                    type="mini"
                    ellipsizeMode="tail"
                    style={{ width: 180 }}
                  >
                    {sms.body}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      );
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0288d1', dark: '#0288d1' }}
      headerImage={<View />}
    >
      {RenderSMS()}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 100,
    backgroundColor: '#D3D3D3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  line: {  // Added style for the line
    height: 3,
    backgroundColor: '#0288d1'
  }
});
