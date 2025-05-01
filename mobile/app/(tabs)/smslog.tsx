import React, { useState, useEffect, useCallback } from 'react';
import { View, PermissionsAndroid, StyleSheet, Platform, SectionList, Text, NativeEventEmitter, NativeModules } from 'react-native';
import { ThemedText } from '../../components/ThemedText';
import ParallaxScrollView from '../../components/ParallaxScrollView'; 
import { IconFeather } from '../../components/ui/IconSymbol'; 

interface SmsItem {
  address: string;
  body: string;
  date: number;
  timestamp?: string; // Important for ordering
}

interface GroupedSms {
  [date: string]: SmsItem[];
}

const groupByDate = (data: SmsItem[]): GroupedSms => {
  return data.reduce((acc: GroupedSms, item) => {
    const date = new Date(item.date).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(item);
    return acc;
  }, {});
};

const formatDateTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  const datePart = date.toLocaleDateString('en-GB');
  return `${datePart} ${time}`;
};

const SmsLogScreen = () => {
  const [smsData, setSmsData] = useState<GroupedSms>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [smsAvailable, setSmsAvailable] = useState<boolean>(true);

  // 1. Declare the event emitter
  const eventEmitter = new NativeEventEmitter(NativeModules.RNSmsListener); //  Needs react-native-sms-listener

  // 2. Function to fetch initial SMS messages
  const fetchInitialSms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (Platform.OS === 'android') {
        const SmsAndroid = require('react-native-get-sms-android'); // Import only for Android
        SmsAndroid.list(
          JSON.stringify({ box: 'inbox', maxCount: 50 }), // Or however many you want
          (fail: any) => {
            console.error('Failed to fetch initial SMS:', fail);
            setError('Failed to load initial SMS messages.');
            setLoading(false);
            setSmsAvailable(false);
          },
          (count: any, smsListStr: string) => {
            try {
              const smsList: SmsItem[] = JSON.parse(smsListStr);
              const groupedData = groupByDate(smsList);
              setSmsData(groupedData);
            } catch (parseError) {
              console.error('Error parsing initial SMS data:', parseError);
              setError('Error parsing initial SMS data.');
              setLoading(false);
              setSmsAvailable(false);
            } finally {
              setLoading(false);
            }
          }
        );
      } else {
        setError('SMS functionality is only supported on Android.');
        setLoading(false);
        setSmsAvailable(false);
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
      setSmsAvailable(false);
    }
  }, []);

  // 3. Set up the SMS listener (only on Android)
  useEffect(() => {
    if (Platform.OS === 'android') {
      const listener = eventEmitter.addListener('onReceive', (sms: SmsItem) => {
        //  IMPORTANT:  Handle the new SMS.  Update state.
        console.log('New SMS received:', sms);

        //  Update the smsData state.  Be very careful to do this correctly!
        setSmsData((prevSmsData) => {
          const date = new Date(sms.date).toLocaleDateString();
          const existingMessagesForDate = prevSmsData[date] || [];
          //  Check if this SMS is already in the list (to prevent duplicates)
          const isDuplicate = existingMessagesForDate.some(
            (existingSms) => existingSms.date === sms.date
          );

          if (!isDuplicate) {
            const updatedMessages = [...existingMessagesForDate, sms];
            // Sort the messages by date/time (most recent first)
            updatedMessages.sort((a, b) => b.date - a.date);
            return {
              ...prevSmsData,
              [date]: updatedMessages,
            };
          }
          return prevSmsData; // Return the *original* state if it's a duplicate
        });
      });

      // Fetch initial messages
      fetchInitialSms();

      // 4. Clean up the listener when the component unmounts
      return () => {
        listener.remove();
      };
    } else {
      //  No listener setup.
      fetchInitialSms(); //  Still fetch initial messages (mock, or empty)
      return () => {};
    }
  }, [eventEmitter, fetchInitialSms]); //  Dependencies

  // 5.  Permission Request (Android Only)
  useEffect(() => {
    const requestSmsPermission = async () => {
      if (Platform.OS === 'android') {
        try {
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
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            setError('SMS permission denied.');
            setSmsAvailable(false);
          }
        } catch (err) {
          console.warn(err);
          setError('Error requesting SMS permission.');
          setSmsAvailable(false);
        }
      }
    };
    requestSmsPermission();
  }, []);

  const renderItem = ({ item }: { item: SmsItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.iconContainer}>
        <IconFeather name="message-square" size={20} color="#000" />
      </View>
      <View>
        <ThemedText type="defaultSemiBold">
          {item.address || 'Unknown'}
        </ThemedText>
        <View style={{ flexDirection: 'row' }}>
          <ThemedText type="time" style={{ width: 100 }}>
            {formatDateTime(item.date)}
          </ThemedText>
          <ThemedText
            numberOfLines={1}
            type="mini"
            ellipsizeMode="tail"
            style={{ width: 180 }}
          >
            {item.body}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.line} />
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <ThemedText style={styles.sectionCount}>{`(${smsData[title]?.length || 0})`}</ThemedText>
      <View style={styles.line} />
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading SMS Messages...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  if (!smsAvailable) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>SMS functionality is not available on this platform.</Text>
      </View>
    );
  }

  const sections = Object.entries(smsData).map(([date, messages]) => ({
    title: date,
    data: messages.sort((a, b) => b.date - a.date), // Sort each section
  }));

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#0288d1', dark: '#0288d1' }}
      headerImage={<View />}
    >
      <View style={{ flex: 1 }}>
        {sections.length > 0 ? (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.date}-${index}`}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>No SMS messages to display.</Text>
          </View>
        )}
      </View>
    </ParallaxScrollView>
  );
};

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
  line: {
    height: 1,
    backgroundColor: '#0288d1',
    flex: 1,
    marginHorizontal: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 5
  },
  sectionCount: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 5
  }
});

export default SmsLogScreen;