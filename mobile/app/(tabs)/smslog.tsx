import {
    View,
    PermissionsAndroid,
    StyleSheet,
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
  
    useEffect(() => {                                    
      requestSmsPermission();                                  // Request SMS permission on component mount
    }, []);
  
    const requestSmsPermission = async () => {                    // Request SMS permission from the user
      try {
        if (__DEV__) {                                                         // If in development mode, use mock data
          const groupedData = await groupByDate(smsMockData.slice(0, 50));     // Group mock data by date
          setSmsData(groupedData);
        }
  
        const granted = await PermissionsAndroid.request(              // Request SMS permission
          PermissionsAndroid.PERMISSIONS.READ_SMS,                    
          {
            title: "SMS Permission",
            message: "This app needs access to your SMS messages",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
  
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {            // If permission granted, load SMS messages
          SmsAndroid.list(
            JSON.stringify({ box: "inbox", maxCount: 50 }),
            (fail: any) => {
              console.log("SMS Load Failed: ", fail);
            },
            async (count: any, smsListStr: string) => {                   // On success, parse and group SMS messages by date
              const smsList: SmsItem[] = JSON.parse(smsListStr);
              const groupedData = await groupByDate(smsList);
              setSmsData(groupedData);
            }
          );
        }
      } catch (e) {                                          // Handle any errors that occur during permission request or SMS loading
        console.warn(e);
      }
    };
  
    const groupByDate = async (data: SmsItem[]) => {            // Group SMS messages by date
      return data.reduce((acc: any, item) => {                     // For each SMS item, extract the date and group by it
        const date = new Date(item.date).toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
      }, {});
    };
  
    const formatDateTime = (timestamp: number) => {            // Format the date and time for display
      const date = new Date(timestamp);
      const time = `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
      const datePart = date.toLocaleDateString("en-GB");
      return `${datePart} ${time}`;
    };
  
    const Line = () => <View style={{ height: 3, backgroundColor: "#0288d1" }} />;
  
    const RenderSMS = () => {
      return Object.entries(smsData).flatMap(([logDate, messages]: any) => {
        const list: SmsItem[] = messages || [];
        return (
          <View key={logDate} style={{ marginTop: 10, marginBottom: 10 }}>
            {Line()}
            <View
              style={{
                height: 50,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 10,
              }}
            >
              <ThemedText>{logDate}</ThemedText>
              <ThemedText>{`(${list.length})`}</ThemedText>
            </View>
            {Line()}
            {list.map((sms, index) => (
              <View
                key={`${logDate}-${sms.date}-${index}`}
                style={styles.itemContainer}
              >
                <View style={styles.iconContainer}>
                  <IconFeather name="message-square" size={20} color="#000" />
                </View>
                <View>
                  <ThemedText type="defaultSemiBold">
                    {sms.address || "Unknown"}
                  </ThemedText>
                  <View style={{ flexDirection: "row" }}>
                    <ThemedText type="time" style={{ width: 100 }}>
                      {formatDateTime(sms.date)}
                    </ThemedText>
                    <ThemedText
                      numberOfLines={1}
                      type="mini"
                      ellipsizeMode="tail"
                      style={{ width: 180 }}
                    >
                      {sms.body}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      });
    };
  
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: "#0288d1", dark: "#0288d1" }}
        headerImage={<View />}
      >

        {RenderSMS()}
      </ParallaxScrollView>
    );
  }
  
  const styles = StyleSheet.create({
    itemContainer: {
      flexDirection: "row",
      height: 70,
      alignItems: "center",
      justifyContent: "flex-start",
      paddingHorizontal: 15,
      borderBottomWidth: 0.5,
      borderColor: "#ccc",
    },
    iconContainer: {
      width: 45,
      height: 45,
      borderRadius: 100,
      backgroundColor: "#D3D3D3",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
    },
  });
  