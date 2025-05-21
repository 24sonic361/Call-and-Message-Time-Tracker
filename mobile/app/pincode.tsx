import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function PincodeScreen() {
  const [pin, setPin] = useState('');
  const [phone, setPhone] = useState('');
  const [showPhoneInput, setShowPhoneInput] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();
  const { setAuthorized } = useAuth();

  useEffect(() => {
    checkStoredPhone();
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      validatePin(pin);
    }
  }, [pin]);

  const checkStoredPhone = async () => {
    const stored = await AsyncStorage.getItem('phonenumber');
    if (stored) {
      setPhone(stored);
      setShowPhoneInput(false);
    }
  };

  const handleSavePhone = async () => {
    if (!phone) {
      Alert.alert('Please enter a phone number');
      return;
    }
    await AsyncStorage.setItem('phonenumber', phone.trim());
    setShowPhoneInput(false);
  };

  const validatePin = async (inputPin: string) => {
    if (!inputPin || !phone) return;

    const { data, error } = await supabase
      .from('Clients')
      .select('firstname, lastname, pincode')
      .eq('phonenumber', phone.trim())
      .eq('status', 'enabled')
      .maybeSingle();

    if (error) {
      console.error(error);
      Alert.alert('Error', 'Supabase query failed');
      return;
    }

    if (!data) {
      Alert.alert('Not found', 'Phone number not registered or disabled');
      return;
    }

    if (data.pincode !== inputPin) {
      Alert.alert('Incorrect PIN', 'Please try again');
      setPin('');
      return;
    }

    const fullName = `${data.firstname} ${data.lastname}`;
    setUserName(fullName);
    setAuthorized(true);
    setTimeout(() => {
      router.replace('/tabs/call');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      {userName ? (
        <Text style={styles.welcome}>Welcome, {userName}!</Text>
      ) : showPhoneInput ? (
        <>
          <Text style={styles.title}>Enter Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 0212345678"
            placeholderTextColor="#bbb"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Text style={styles.button} onPress={handleSavePhone}>
            Save
          </Text>
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter PIN</Text>
          <TextInput
            style={styles.pinInput}
            value={pin}
            onChangeText={(text) => {
              if (text.length <= 4) setPin(text);
            }}
            secureTextEntry
            keyboardType="number-pad"
            placeholder="****"
            placeholderTextColor="#ccc"
            maxLength={4}
          />
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6c4d9c',
    marginBottom: 16,
  },
  input: {
    borderBottomWidth: 2,
    borderColor: '#6C63FF',
    width: '80%',
    fontSize: 18,
    padding: 10,
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  pinInput: {
    borderWidth: 2,
    borderColor: '#6C63FF',
    borderRadius: 10,
    width: '50%',
    fontSize: 28,
    textAlign: 'center',
    paddingVertical: 12,
    letterSpacing: 10,
    color: '#000',
    backgroundColor: '#fff',
    elevation: 5,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#6C63FF',
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    fontWeight: 'bold',
    overflow: 'hidden',
  },
  welcome: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6c4d9c',
  },
});
