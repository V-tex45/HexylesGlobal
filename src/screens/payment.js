// src/screens/Payments.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import axios from 'axios';

export default function PaymentsScreen() {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://YOUR_API_URL/api/mpesa-payment', {
        phone: `254${phone.substring(phone.length - 9)}`, // Convert to 254 format
        amount,
        account: 'HEXYLES'
      });
      Alert.alert('Success', `Payment initiated to ${phone}`);
    } catch (error) {
      Alert.alert('Error', 'Payment failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Make Payment via M-Pesa</Text>
      
      <TextInput
        placeholder="Amount (KES)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      
      <TextInput
        placeholder="Phone (07XX or 2547...)"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
      />
      
      <Button 
        title="Pay Now" 
        onPress={handlePayment}
        color="#3498db"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 50, borderColor: '#bdc3c7', borderWidth: 1, marginBottom: 15, padding: 10, borderRadius: 5 }
});