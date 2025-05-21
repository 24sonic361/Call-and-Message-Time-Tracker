declare module 'react-native-call-log' {
  export interface CallLogItem {
    name: string | null;
    phoneNumber: string;
    timestamp: string;
    duration: string;
    type: 'INCOMING' | 'OUTGOING' | 'MISSED' | 'UNKNOWN';
    rawType: number;
  }

  const CallLogs: {
    load: (limit?: number) => Promise<CallLogItem[]>;
  };

  export default CallLogs;
}
