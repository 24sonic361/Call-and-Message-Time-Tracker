import {
  StyleSheet,
  Image,
  Platform,
  View,
  TouchableOpacity,
  Text,
} from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useEffect, useState } from "react";

export default function TabTwoScreen() {
  const [textUpdate, setTextUpdate] = useState("");
  useEffect(() => {
    initial();
  }, []);
  const initial = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1000);
    let _date = formatDate(date);
    setTextUpdate(_date);
  };
  const Line = () => <View style={{ height: 3, backgroundColor: "#0288d1" }} />;
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
  const onUpdate = () => {
    const now = new Date();
    let _date = formatDate(now);
    setTextUpdate(_date);
  };
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
          onPress={() => {
            onUpdate();
          }}
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
}

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
