// src/screens/Projects.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import axios from 'axios';
import * as Progress from 'react-native-progress';

export default function ProjectsScreen() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://YOUR_API_URL/api/projects');
        setProjects(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={projects}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.projectCard}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.status}>{item.status}</Text>
            
            <Progress.Bar 
              progress={item.progress / 100} 
              width={300} 
              color="#2ecc71"
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>{item.progress}% Complete</Text>

            {item.photos && item.photos.map((photo, index) => (
              <Image
                key={index}
                source={{ uri: photo }}
                style={styles.projectImage}
              />
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15 },
  projectCard: { marginBottom: 20, padding: 15, backgroundColor: '#fff', borderRadius: 10, elevation: 3 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  status: { color: '#7f8c8d', marginBottom: 10 },
  progressBar: { marginVertical: 10 },
  progressText: { textAlign: 'center', marginBottom: 10 },
  projectImage: { width: '100%', height: 200, borderRadius: 5, marginTop: 10 }
});