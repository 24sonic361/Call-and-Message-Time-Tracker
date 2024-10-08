import CallLogs from 'react-native-call-log';
import SmsAndroid from 'react-native-get-sms-android';  // Import SMS Android
import { requestCallLogPermission, requestSmsPermission } from './permission';  // Import permission functions

// Fetch call logs
export async function fetchCallLogs() {
  const hasPermission = await requestCallLogPermission();
  if (hasPermission) {
    const logs = await CallLogs.loadAll();  // Fetch call logs
    console.log('Call Logs:', logs);  // Log the call logs for debugging
    return logs;
  } else {
    console.log("Call log permission denied");
    return [];
  }
}

// Fetch SMS logs
export async function fetchSmsLogs() {
  const hasPermission = await requestSmsPermission();
  if (hasPermission) {
    const filter = {
      box: 'inbox', // 'inbox' or 'sent'
      indexFrom: 0, // Starts from the first message
      maxCount: 10, // Maximum number of messages to fetch
    };

    return new Promise((resolve, reject) => {
      SmsAndroid.list(
        JSON.stringify(filter),
        (fail) => {
          console.log('Failed with this error:', fail);
          reject([]);
        },
        (count, smsList) => {
          const messages = JSON.parse(smsList);  // Parse the SMS data
          console.log('SMS List:', messages);  // Log the SMS list for debugging
          resolve(messages);
        }
      );
    });
  } else {
    console.log("SMS permission denied");
    return [];
  }
}
