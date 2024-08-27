import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore methods
import { firestore as db } from '../firebaseConfig'; // Import the configured firestore from firebaseConfig
import { auth } from '../firebaseConfig'; // Import the auth module from firebaseConfig

const EmotionFormScreen = ({ navigation }) => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);

  const emotions = [
    { label: '😢', value: 'worst' },
    { label: '😟', value: 'worse' },
    { label: '😐', value: 'medium' },
    { label: '😊', value: 'happy' },
    { label: '😁', value: 'happier' },
  ];

  const saveEmotion = async () => {
    if (!selectedEmotion) {
      Alert.alert('Please select an emotion');
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    const now = new Date();
    const timestamp = now.toISOString(); // Full timestamp including date and time

    const emotionData = {
      timestamp, // Save full timestamp
      emotion: selectedEmotion,
      email: user.email, // Include the user's email
    };

    try {
      // Add a new document with a generated id
      await addDoc(collection(db, 'emotions'), emotionData);
      Alert.alert('Success', 'Emotion saved successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving emotion:', error);
      Alert.alert('Error', 'Failed to save emotion to the database');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>How do you feel today?</Text>
      <View style={styles.emotionsContainer}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.value}
            style={[
              styles.emotionButton,
              selectedEmotion === emotion.value && styles.selectedEmotion,
            ]}
            onPress={() => setSelectedEmotion(emotion.value)}
          >
            <Text style={styles.emotionText}>{emotion.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Button title="Save Emotion" onPress={saveEmotion} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  emotionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  emotionButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedEmotion: {
    borderColor: '#007BFF',
  },
  emotionText: {
    fontSize: 30,
  },
});

export default EmotionFormScreen;
