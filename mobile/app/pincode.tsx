import { Link, Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../utils/supabaseClient";
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      validatePin();
    }
  }, [pin]);

  const validatePin = async () => {
    try {
      const { data, error } = await supabase
        .from("Clients")
        .select("firstname, lastname, status")
        .eq("pincode", pin)
        .single();

      if (error || !data) {
        Alert.alert("Error", "Invalid PIN code. Please try again.");
        setPin("");
        return;
      }

      if (data.status !== "enabled") {
        Alert.alert("Error", "Account is disabled. Please contact support.");
        setPin("");
        return;
      }

      const fullname = `${data.firstname} ${data.lastname}`;
      await AsyncStorage.setItem('clientFullname', fullname);
      router.back();
      setModalVisible(false);
    } catch (error) {
      console.error("PIN validation error:", error);
      Alert.alert("Error", "Failed to validate PIN. Please try again.");
      setPin("");
    }
  };

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
    backgroundColor: "#FFF",
  },
  pinBox: {
    width: 15,
    height: 15,
    marginHorizontal: 10,
    borderRadius: 100,
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