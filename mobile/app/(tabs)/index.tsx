import {
  Image,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  SafeAreaView,
  View,
  Clipboard,
  Alert,
} from "react-native";
import { Fragment, useEffect, useState } from "react";
import CallLogs from "react-native-call-log";
import { StatusBar } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import {
  IconFeather,
  IconSymbol,
  IconSymbol2,
} from "@/components/ui/IconSymbol";
import { ThemedView } from "@/components/ThemedView";
import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import mockup from "../mockup/mockup";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";

interface PropsDataCalling {
  type: string;
  rawType: number;
  name: string | null;
  duration: number;
  dateTime: string;
  timestamp: string;
  phoneNumber: string;
}

export default function HomeScreen() {
  const [dataCalling, setDataCalling] = useState<Record<string, PropsDataCalling[]>>({});
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    _PermissionsAndroid();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {                                          
      router.push({                                               // Navigate to the pincode screen
        pathname: "/pincode",
        params: { openModel: "Y" },
      });
    }
  }, [isMounted]);

  const _PermissionsAndroid = async () => {
    try {
      if (__DEV__) {
        // Use mock data during simulator testing
        const groupedData = await groupByDate(mockup.dataCall.slice(0, 50));
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
        const callLogsData = await CallLogs.load(50);
        const groupedData = await groupByDate(callLogsData);
        setDataCalling(groupedData);
      }
    } catch (e) {
      console.error("Permission error:", e);
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp));
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatTime = (s: number) => {
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes}m ${seconds}s`;
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

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const isYesterday = (date: Date) => {                                // Check if the date is yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return (
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate()
    );
  };

  const Line = () => <View style={{ height: 3, backgroundColor: "#0288d1" }} />;

  const RenderCalling = () => {
    return Object.entries(dataCalling).flatMap(([logDate, calls]) => {
      const date = `${logDate}T00:00:00`;
      const _logDate = new Date(date);
      let formattedDate = _logDate.toLocaleDateString("en-GB", {             // Format date to dd/mm/yyyy
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      if (isYesterday(_logDate)) {            
        formattedDate = "YESTERDAY";
      }
      if (isToday(_logDate)) {
        formattedDate = "TODAY";
      }
      const list = (calls as PropsDataCalling[]) || [];
      return (
        <View key={`${logDate}`} style={{ marginTop: 10, marginBottom: 10 }}>
          {Line()}
          <View
            style={{
              height: 50,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingLeft: 10,
              paddingRight: 10,
            }}
          >
            <ThemedText>{formattedDate}</ThemedText>
            <ThemedText>{`(${list.length})`}</ThemedText>
          </View>
          {Line()}
          {list.map((v, index) => {
            const date = formatDate(v.timestamp);
            const isOpen = v.type === "MISSED";
            const _IconFeather =
              v.type === "OUTGOING"
                ? "arrow-up-right"
                : v.type === "INCOMING"
                ? "arrow-down-left"
                : v.type === "MISSED"
                ? "plus"
                : "help-circle";
            const _IconColor =
              v.type === "OUTGOING"
                ? "#008000"
                : v.type === "INCOMING"
                ? "#0000FF"
                : v.type === "MISSED"
                ? "#FF0000"
                : "#FF0000";
            return (
              <View
                key={`${logDate}-${v.timestamp}-${index}`}
                style={{
                  flexDirection: "row",
                  height: 70,
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <View
                    style={{
                      width: 45,
                      height: 45,
                      borderRadius: 100,
                      backgroundColor: "#D3D3D3",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 10,
                    }}
                  >
                    <IconFeather name="user" size={20} color={"#000"} />
                  </View>
                  <View>
                    <ThemedText type="defaultSemiBold">
                      {v.type === "UNKNOWN"
                        ? "Unknown"
                        : v.name
                        ? v.name
                        : "Unknown"}
                    </ThemedText>
                    <View style={{ flexDirection: "row" }}>
                      <ThemedText type="time" style={{ width: 70 }}>
                        {date}
                      </ThemedText>
                      <ThemedText
                        numberOfLines={1}
                        type="mini"
                        ellipsizeMode="middle"
                        style={{ width: 180}}
                      >
                        {v.phoneNumber}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                  }}
                >
                  <View
                    style={{ flexDirection: "row", alignItems: "flex-end" }}
                  >
                    <IconSymbol2
                      name="phone"
                      size={35}
                      color={Colors.light.icon}
                    />
                    <IconFeather
                      name={_IconFeather}
                      size={20}
                      color={_IconColor}
                      style={{
                        transform: [{ rotate: isOpen ? "45deg" : "0deg" }],
                      }}
                    />
                  </View>
                  <ThemedText type="mini-2">
                    {formatTime(v.duration)}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>
      );
    });
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#0288d1", dark: "#0288d1" }}
      headerImage={<View />}
    >
      {RenderCalling()}
    </ParallaxScrollView>
  );
};