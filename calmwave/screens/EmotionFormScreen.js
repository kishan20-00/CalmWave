import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button } from 'react-native';
import { collection, addDoc } from 'firebase/firestore'; // Import Firestore methods
import { firestore as db } from '../firebaseConfig'; // Import the configured firestore from firebaseConfig
import { auth } from '../firebaseConfig'; // Import the auth module from firebaseConfig

const EmotionFormScreen = ({ navigation }) => {
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [alcoholConsumption, setAlcoholConsumption] = useState(null); // State for alcohol consumption

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

    if (alcoholConsumption === null) {
      Alert.alert('Please answer the alcohol consumption question');
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
      alcoholConsumption, // Include the alcohol consumption answer
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
      <Text style={styles.subHeader}>Did you consume alcohol yesterday?</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[
            styles.optionButton,
            alcoholConsumption === 'yes' && styles.selectedOption,
          ]}
          onPress={() => setAlcoholConsumption('yes')}
        >
          <Text style={styles.optionText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionButton,
            alcoholConsumption === 'no' && styles.selectedOption,
          ]}
          onPress={() => setAlcoholConsumption('no')}
        >
          <Text style={styles.optionText}>No</Text>
        </TouchableOpacity>
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
  subHeader: {
    fontSize: 18,
    marginBottom: 10,
  },
  emotionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  optionsContainer: {
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
  optionButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  selectedOption: {
    borderColor: '#007BFF',
  },
  emotionText: {
    fontSize: 30,
  },
  optionText: {
    fontSize: 20,
  },
});

export default EmotionFormScreen;
