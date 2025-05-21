declare module 'react-native-get-sms-android' {
  interface SmsFilter {
    box: 'inbox' | 'sent';
    maxCount?: number;
    indexFrom?: number;
    minDate?: number;
    maxDate?: number;
    address?: string;
    bodyRegex?: string;
  }

  interface SmsItem {
    _id: number;
    address: string;
    body: string;
    date: string;
    read: number;
    seen: number;
    status: number;
    thread_id: number;
    type: number;
  }

  const SmsAndroid: {
    list(
      filter: string,
      failureCallback: (error: string) => void,
      successCallback: (count: number, smsList: string) => void
    ): void;
  };

  export default SmsAndroid;
}
