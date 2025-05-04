// src/screens/Changes.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';
import axios from 'axios';

export default function ChangesScreen() {
  const [description, setDescription] = useState('');
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    try {
      const response = await axios.get('http://YOUR_API_URL/api/changes');
      setChanges(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const submitChange = async () => {
    try {
      const response = await axios.post('http://YOUR_API_URL/api/changes', { description });
      setChanges([...changes, response.data]);
      setDescription('');
      Alert.alert('Success', 'Change request submitted!');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Describe your change request..."
        value={description}
        onChangeText={setDescription}
        multiline
        style={styles.input}
      />
      
      <Button title="Submit Request" onPress={submitChange} color="#3498db" />
      
      <FlatList
        data={changes}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.changeCard}>
            <Text style={styles.changeText}>{item.description}</Text>
            <Text style={styles.changeStatus}>Status: {item.status}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { 
    height: 100, 
    borderColor: '#bdc3c7', 
    borderWidth: 1, 
    marginBottom: 15, 
    padding: 10, 
    borderRadius: 5,
    textAlignVertical: 'top'
  },
  changeCard: { 
    padding: 15, 
    backgroundColor: '#fff', 
    marginTop: 10, 
    borderRadius: 5, 
    elevation: 2 
  },
  changeText: { fontSize: 16 },
  changeStatus: { color: '#7f8c8d', marginTop: 5 }
});