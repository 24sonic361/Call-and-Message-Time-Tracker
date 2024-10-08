import CallLogs from 'react-native-call-log';
import SmsAndroid from 'react-native-get-sms-android';  
import { requestCallLogPermission, requestSmsPermission } from './permission'; 

// Fetch call logs
export async function fetchCallLogs() {
  const hasPermission = await requestCallLogPermission();
  if (hasPermission) {
    const logs = await CallLogs.loadAll();  
    console.log('Call Logs:', logs);  
    return logs;
  } else {
    console.log("Call log permission denied");
    return [];
  }
}

export async function fetchSmsLogs() {
  const hasPermission = await requestSmsPermission();
  if (hasPermission) {
    const filter = {
      box: 'inbox', 
      indexFrom: 0, 
      maxCount: 10, 
    };

    return new Promise((resolve, reject) => {
      SmsAndroid.list(
        JSON.stringify(filter),
        (fail) => {
          console.log('Failed with this error:', fail);
          reject([]);
        },
        (count, smsList) => {
          const messages = JSON.parse(smsList);  
          console.log('SMS List:', messages);  
          resolve(messages);
        }
      );
    });
  } else {
    console.log("SMS permission denied");
    return [];
  }
}
