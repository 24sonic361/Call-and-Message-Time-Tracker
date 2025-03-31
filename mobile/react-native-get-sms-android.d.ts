declare module "react-native-get-sms-android" {
    interface SmsAndroidOptions {
      box: "inbox" | "sent";
      maxCount?: number;
      minDate?: number;
      maxDate?: number;
      bodyRegex?: string;
      indexFrom?: number;
      address?: string;
    }
  
    interface Sms {
      _id: number;
      address: string;
      body: string;
      date: number;
      read: number;
      status: number;
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
  