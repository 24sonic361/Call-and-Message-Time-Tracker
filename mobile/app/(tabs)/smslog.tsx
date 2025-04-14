import {
  View,
  PermissionsAndroid,
  StyleSheet,
  TextInput,
  Pressable,
  ToastAndroid,
  Clipboard,
} from "react-native";
import { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconFeather } from "@/components/ui/IconSymbol";
import SmsAndroid from "react-native-get-sms-android";
import smsMockData from "../mockup/smsMockup";

interface SmsItem {
  address: string;
  body: string;
  date: number;
}

export default function SmsLogScreen() {
  const [smsData, setSmsData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSMS, setExpandedSMS] = useState<Record<number, boolean>>({});

  useEffect(() => {
    requestSmsPermission();
  }, []);

  const requestSmsPermission = async () => {
    try {
      if (__DEV__) {
        const groupedData = await groupByDate(smsMockData.slice(0, 50));
        setSmsData(groupedData);
      }

      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_SMS,
        {
          title: "SMS Permission",
          message: "This app needs access to your SMS messages",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        SmsAndroid.list(
          JSON.stringify({ box: "inbox", maxCount: 50 }),
          (fail: any) => {
            console.log("SMS Load Failed: ", fail);
          },
          async (count: any, smsListStr: string) => {
            const smsList: SmsItem[] = JSON.parse(smsListStr);
            const groupedData = await groupByDate(smsList);
            setSmsData(groupedData);
          }
        );
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const groupByDate = async (data: SmsItem[]) => {
    return data.reduce((acc: any, item) => {
      const date = new Date(item.date).toISOString().split("T")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const time = `${date.getHours()}:${String(date.getMinutes()).padStart(
      2,
      "0"
    )}`;
    const datePart = date.toLocaleDateString("en-GB");
    return `${datePart} ${time}`;
  };

  const RenderSMS = () => {
    return Object.entries(smsData).flatMap(([logDate, messages]: any) => {
      const list: SmsItem[] = messages || [];

      const filteredList = list.filter(
        (sms) =>
          sms.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sms.body?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filteredList.length === 0) return null;

      return (
        <View key={logDate} style={styles.groupContainer}>
          <View style={styles.dateHeader}>
            <ThemedText style={styles.dateHeaderText}>{logDate}</ThemedText>
            <ThemedText style={styles.dateHeaderCount}>
              {`${filteredList.length} messages`}
            </ThemedText>
          </View>

          {filteredList.map((sms, index) => {
            const isExpanded = expandedSMS[sms.date];

            return (
              <Pressable
                key={`${logDate}-${sms.date}-${index}`}
                style={styles.smsCard}
                onLongPress={() => {
                  Clipboard.setString(sms.body);
                  ToastAndroid.show("Message copied", ToastAndroid.SHORT);
                }}
                onPress={() => {
                  setExpandedSMS((prev) => ({
                    ...prev,
                    [sms.date]: !prev[sms.date],
                  }));
                }}
              >
                <View style={styles.iconContainer}>
                  <IconFeather name="message-square" size={18} color="#0288d1" />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <ThemedText type="defaultSemiBold" style={{ color: "#333" }}>
                      {sms.address || "Unknown number"}
                    </ThemedText>
                    <ThemedText type="mini" style={{ color: "#888" }}>
                      {formatDateTime(sms.date)}
                    </ThemedText>
                  </View>
                  <ThemedText
                    numberOfLines={isExpanded ? undefined : 1}
                    type="default"
                    style={{ color: "#444", marginTop: 4 }}
                  >
                    {sms.body}
                  </ThemedText>
                </View>
              </Pressable>
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
      {/* Search bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          placeholder="Search by phone number or content"
          value={searchTerm}
          onChangeText={setSearchTerm}
          style={styles.searchInput}
          placeholderTextColor="#aaa"
        />
      </View>

      {RenderSMS()}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  dateHeader: {
    backgroundColor: "#E1F5FE",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  dateHeaderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0288d1",
  },
  dateHeaderCount: {
    fontSize: 14,
    color: "#0288d1",
  },
  smsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#B3E5FC",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  searchBarContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#f5f5f5",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
