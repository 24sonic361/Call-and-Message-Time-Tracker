import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PinCodeScreen() {
  const [pin, setPin] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams();
  useEffect(() => {
    setModalVisible(params.openModel === "Y");
  }, []);
  useEffect(() => {
    if (pin.length === 4) {
      router.back();
      setModalVisible(false);
    }
  }, [pin]);
  const handlePress = (num: string) => {
    if (num === ".") {
      return;
    }
    if (pin.length < 4) {
      setPin((prev) => prev + num);
    }
  };
  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };
  return (
    <Modal animationType="slide" transparent={true} visible={modalVisible}>
      <View style={styles.container}>
        <View style={styles.pinContainer}>
          {[...Array(4)].map((_, index) => (
            <View
              key={index}
              style={[
                styles.pinBox,
                pin.length > index ? styles.pinBoxFilled : {},
              ]}
            />
          ))}
        </View>
        <View style={styles.numberPad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map(
            (num, k) => (
              <View key={`${k}-${num}`}>
                {num !== "del" && (
                  <TouchableOpacity
                    style={styles.numButton}
                    onPress={() => handlePress(num)}
                  >
                    {num !== "." && <Text style={styles.numText}>{num}</Text>}
                  </TouchableOpacity>
                )}
                {num === "del" && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                  >
                    <Ionicons name="backspace-outline" size={32} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            )
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0288d1",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  pinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  pinBoxFilled: {
    backgroundColor: "#FFF", // สีเปลี่ยนเมื่อกดตัวเลข
  },
  pinBox: {
    width: 15,
    height: 15,
    marginHorizontal: 10,
    borderRadius: 100,
    // backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  pinText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6200EE",
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 300,
    justifyContent: "space-between",
  },
  numButton: {
    width: 60,
    height: 60,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
  },
  numText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  deleteButton: {
    width: 60,
    height: 60,
    margin: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#AAA",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  submitActive: {
    backgroundColor: "#6200EE",
  },
  submitText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
