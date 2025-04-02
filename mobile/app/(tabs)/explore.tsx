import {
  StyleSheet,
  Image,
  Platform,
  View,
  TouchableOpacity,
  PermissionsAndroid,
  Text,
} from "react-native";
import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import CallLogs from "react-native-call-log";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useEffect, useState } from "react";
import mockup from "../mockup/mockup";
import { supabase } from "../../utils/supabaseClient";
import { PostgrestError } from '@supabase/supabase-js'; // Import for error typing

interface PropsDataCalling {
  type: string;
  rawType: number;
  name: string | null;
  duration: number;
  dateTime: string;
  timestamp: string;
  phoneNumber: string;
}

export default function ExploreScreen() {
  const [textUpdate, setTextUpdate] = useState("");
  const [dataCalling, setDataCalling] = useState<Record<string, PropsDataCalling[]>>({});

  useEffect(() => {
    initial();
    _PermissionsAndroid(); // Load real call logs if permissions granted
  }, []);

  const initial = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1000);
    let _date = formatDate(date);
    setTextUpdate(_date);
  };

  const _PermissionsAndroid = async () => {
    try {
      if (__DEV__) {
        // Use mock data during simulator testing
        const groupedData = await groupByDate(mockup.dataCall.slice(0, 10));
        setDataCalling(groupedData);
      }

      const _granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
        {
          title: "Call Log",
          message: "Access your call logs",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      if (_granted === PermissionsAndroid.RESULTS.GRANTED) {
        const callLogsData = await CallLogs.load(10);
        const groupedData = await groupByDate(callLogsData);
        setDataCalling(groupedData);
      }
    } catch (e) {
      console.error("Permission error:", e);
    }
  };

  const syncCallLogsToSupabase = async () => {
    try {
      const allCalls = Object.values(dataCalling).flat();

    // Fetch existing calls from Supabase with specific fields
    const { data: existingCalls, error: fetchError } = await supabase
      .from('CallLogs')
      .select('whocalled, starttime');
    if (fetchError) throw fetchError;

    // Log existing calls for debugging (For testing)
    //console.log("Existing calls in Supabase:", existingCalls);

    const newCalls = allCalls.filter(call => {
      // Ensure timestamp and phone number exist and are valid
      if (!call.timestamp || !call.phoneNumber || isNaN(parseInt(call.timestamp))) {
        console.warn(`Invalid data for call from ${call.phoneNumber || 'unknown'}: timestamp=${call.timestamp}`);
        return false; // Skip invalid calls
      }

      // Convert local timestamp directly to Supabase-compatible format
      const localTimestampMs = parseInt(call.timestamp);
      const normalizedLocalTimestamp = new Date(localTimestampMs).toISOString()
        .replace('T', ' ') // Replace 'T' with space
        .replace('Z', '') // Remove 'Z'
        .split('.')[0]; // Remove milliseconds

      const normalizedPhoneNumber = call.phoneNumber.toString().trim();

      // Check if this call already exists in Supabase
      const isDuplicate = existingCalls?.some(existingCall => {
        const existingPhone = existingCall.whocalled?.toString().trim() || '';
        const existingTimestamp = existingCall.starttime?.toString() || '';

        // Normalize Supabase timestamp to match the same format
        const normalizedExistingTimestamp = existingTimestamp.replace('T', ' ').split('.')[0];

        return existingPhone === normalizedPhoneNumber && normalizedExistingTimestamp === normalizedLocalTimestamp;
      });

      //For testing
      /*if (isDuplicate) {
        console.log(`Skipping duplicate call: phone=${normalizedPhoneNumber}, timestamp=${normalizedLocalTimestamp}`);
      } else {
        console.log(`New call identified: phone=${normalizedPhoneNumber}, timestamp=${normalizedLocalTimestamp}`);
      }*/

      return !isDuplicate;
    }).map(call => {
      // Convert timestamp directly to Supabase-compatible format (no need to go back to milliseconds)
      const timestampMs = parseInt(call.timestamp);
      const supabaseTimestampFormat = new Date(timestampMs).toISOString()
        .replace('T', ' ') // Replace 'T' with space
        .replace('Z', '') // Remove 'Z'
        .split('.')[0]; // Remove milliseconds

      // No need to create new Date objects for starttime and endtime; use the same format
      const startTime = supabaseTimestampFormat;
      const endTime = new Date(timestampMs + (call.duration * 1000)).toISOString()
        .replace('T', ' ')
        .replace('Z', '')
        .split('.')[0];

      return {
        whocalled: call.phoneNumber,
        starttime: startTime,
        endtime: endTime,
        isfeescalculated: 0.50, // Default fee, adjust as needed
        createdby: 'User',
        modifiedby: 'User',
        type: call.type,
        rawtype: call.rawType,
        name: call.name || null,
        duration: call.duration,
        datetime: startTime, // Use start time as datetime
      };
    });

    if (newCalls.length > 0) {
      const { data, error: insertError } = await supabase
        .from('CallLogs')
        .insert(newCalls)
        .select();
      if (insertError) throw insertError;

      const now = new Date();
      let _date = formatDate(now);
      setTextUpdate(_date);
      alert(`Synced ${newCalls.length} new call logs`);
    } else {
      alert('No new call logs to sync!');
    }
    } catch (error) {
      const err = error as PostgrestError;
      console.error('Sync error:', err.message);
      alert('Failed to sync call logs.');
    }
  };

  const formatDate = (date: Date) => {
    const day = date.toLocaleString("en-US", { day: "2-digit" });
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.toLocaleString("en-US", { year: "numeric" });
    const timePart = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${day}-${month}-${year} ${timePart}`;
  };

  const groupByDate = async (data: any[]) => {
    return data.reduce((acc: Record<string, PropsDataCalling[]>, item: PropsDataCalling) => {
      const date = new Date(parseInt(item.timestamp))
        .toISOString()
        .split("T")[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {});
  };

  const Line = () => <View style={{ height: 3, backgroundColor: "#0288d1" }} />;

  const App = () => {
    return (
      <View style={styles.container}>
        <ThemedText
          type="title"
          style={{
            paddingBottom: 10,
            paddingTop: 10,
            height: 300,
            width: 200,
            textAlign: "center",
          }}
        >
          {textUpdate}
        </ThemedText>
        <TouchableOpacity
          onPress={syncCallLogsToSupabase}
          style={styles.button}
        >
          <ThemedText style={[styles.buttonText, { color: "#fff" }]}>
            Sync
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#0288d1", dark: "#0288d1" }}
      headerImage={<View />}
    >
      {Line()}
      <ThemedText type="title" style={{ paddingBottom: 10, paddingTop: 10 }}>
        Last sync
      </ThemedText>
      {Line()}
      {App()}
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 700,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    backgroundColor: "#008000",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "70%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});