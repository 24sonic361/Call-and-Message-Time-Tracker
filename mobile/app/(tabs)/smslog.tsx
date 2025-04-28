import {
  View,
  PermissionsAndroid,
  StyleSheet,
  TextInput,
  Pressable,
  ToastAndroid,
} from "react-native";
import { useEffect, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { IconFeather } from "@/components/ui/IconSymbol";
import SmsAndroid from "react-native-get-sms-android";
import smsMockData from "../mockup/smsMockup";
import Clipboard from "@react-native-clipboard/clipboard"; 
interface SmsItem {
  _id: string;
  address: string;
  body: string;
  date: number;
}

export default function SmsLogScreen() {
  const [smsData, setSmsData] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSMS, setExpandedSMS] = useState<Record<string, boolean>>({});

  useEffect(() => {
    requestSmsPermission();
  }, []);

  const requestSmsPermission = async () => {
    try {
      if (__DEV__) {
        const mockData = smsMockData
          .map((sms, index) => ({ ...sms, _id: String(index) }))
          .sort((a, b) => b.date - a.date)
          .slice(0, 50);
        const groupedData = groupByDate(mockData);
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
          JSON.stringify({
            box: "inbox",
            maxCount: 50,
            sort: "date DESC",
          }),
          (fail: any) => {
            console.log("SMS Load Failed: ", fail);
          },
          (count: any, smsListStr: string) => {
            const smsList: SmsItem[] = JSON.parse(smsListStr);
            const groupedData = groupByDate(smsList);
            setSmsData(groupedData);
          }
        );
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const groupByDate = (data: SmsItem[]) => {
    return data.reduce((acc: any, item) => {
      const d = new Date(item.date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const date = `${year}-${month}-${day}`;
      if (!acc[date]) acc[date] = [];
      acc[date].push(item);
      return acc;
    }, {});
  };

  const formatDateTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
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

          {filteredList.map((sms) => {
            const isExpanded = expandedSMS[sms._id];

            return (
              <Pressable
                key={sms._id}
                style={styles.smsCard}
                onLongPress={() => {
                  Clipboard.setString(sms.body);
                  ToastAndroid.show("Message copied", ToastAndroid.SHORT);
                }}
                onPress={() => {
                  setExpandedSMS((prev) => ({
                    ...prev,
                    [sms._id]: !prev[sms._id],
                  }));
                }}
              >
                <View style={styles.iconContainer}>
                  <IconFeather name="message-square" size={18} color="#0288d1" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
  searchBarContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
  },
  groupContainer: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  dateHeader: {
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
    fontSize: 12,
    color: "#666",
  },
  smsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
